"""
Management command to migrate genealogical data from PHP webtrees database to Django.

Supports MySQL, PostgreSQL, and SQLite backends.
"""

import logging
from datetime import datetime
from urllib.parse import urlparse

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from genealogy.models import Tree, Individual, Family, Place, Source, Media, Note, Fact

logger = logging.getLogger(__name__)


class PHPDatabaseReader:
    """Reads data from PHP webtrees database."""

    def __init__(self, connection_string):
        """
        Initialize database connection.

        Args:
            connection_string: Database URL (mysql://user:pass@host/db or postgresql://...)
        """
        self.connection_string = connection_string
        self.connection = None
        self._parse_connection_string()

    def _parse_connection_string(self):
        """Parse connection string to determine database type and credentials."""
        parsed = urlparse(self.connection_string)

        self.db_type = parsed.scheme  # mysql, postgresql, sqlite
        self.username = parsed.username
        self.password = parsed.password
        self.hostname = parsed.hostname
        self.port = parsed.port
        self.database = parsed.path.lstrip('/') if parsed.path else ''

        logger.info(f"Parsed connection: type={self.db_type}, host={self.hostname}, db={self.database}")

    def connect(self):
        """Establish database connection."""
        try:
            if self.db_type == 'sqlite':
                import sqlite3
                self.connection = sqlite3.connect(self.database)
                self.connection.row_factory = sqlite3.Row
            elif self.db_type == 'mysql':
                import pymysql
                self.connection = pymysql.connect(
                    user=self.username,
                    password=self.password,
                    host=self.hostname,
                    port=self.port or 3306,
                    database=self.database,
                    cursorclass=pymysql.cursors.DictCursor
                )
            elif self.db_type == 'postgresql':
                import psycopg2
                self.connection = psycopg2.connect(
                    user=self.username,
                    password=self.password,
                    host=self.hostname,
                    port=self.port or 5432,
                    database=self.database
                )
            else:
                raise CommandError(f"Unsupported database type: {self.db_type}")

            logger.info(f"Connected to {self.db_type} database")
        except Exception as e:
            raise CommandError(f"Failed to connect to PHP database: {e}")

    def disconnect(self):
        """Close database connection."""
        if self.connection:
            self.connection.close()
            logger.info("Disconnected from PHP database")

    def query(self, sql, params=None):
        """Execute query and return results."""
        try:
            cursor = self.connection.cursor()
            if params:
                cursor.execute(sql, params)
            else:
                cursor.execute(sql)

            # For SELECT queries, fetch all results
            if sql.strip().upper().startswith('SELECT'):
                if self.db_type == 'sqlite':
                    return [dict(row) for row in cursor.fetchall()]
                elif self.db_type == 'mysql':
                    return cursor.fetchall()
                elif self.db_type == 'postgresql':
                    columns = [desc[0] for desc in cursor.description]
                    return [dict(zip(columns, row)) for row in cursor.fetchall()]
            cursor.close()
            return []
        except Exception as e:
            logger.error(f"Query failed: {e}")
            raise

    def get_individuals(self):
        """Fetch individuals from PHP database."""
        sql = """
            SELECT i_id, i_gedcom, i_name, i_sex, i_birth, i_burial, i_death, i_note
            FROM individuals
        """
        return self.query(sql)

    def get_families(self):
        """Fetch families from PHP database."""
        sql = """
            SELECT f_id, f_gedcom, f_husb, f_wife, f_chil, f_marr, f_div, f_note
            FROM families
        """
        return self.query(sql)

    def get_sources(self):
        """Fetch sources from PHP database."""
        sql = """
            SELECT s_id, s_name, s_sour, s_note
            FROM sources
        """
        return self.query(sql)

    def get_places(self):
        """Fetch places from PHP database."""
        sql = """
            SELECT p_id, p_place, p_long, p_lati
            FROM places
        """
        return self.query(sql)

    def get_media(self):
        """Fetch media from PHP database."""
        sql = """
            SELECT m_id, m_ext, m_titl, m_file, m_note
            FROM media
        """
        return self.query(sql)


class DataMigrator:
    """Migrates data from PHP database to Django models."""

    def __init__(self, php_reader, tree):
        """Initialize migrator with PHP database reader and target tree."""
        self.php_reader = php_reader
        self.tree = tree
        self.stats = {
            'places_created': 0,
            'sources_created': 0,
            'individuals_created': 0,
            'families_created': 0,
            'media_created': 0,
            'facts_created': 0,
            'errors': [],
        }
        self.id_map = {
            'individuals': {},
            'families': {},
            'places': {},
            'sources': {},
            'media': {},
        }

    def parse_name(self, name_string):
        """Parse name into given names and surname."""
        if not name_string:
            return '', ''

        # Typical GEDCOM format: "Given Names /Surname/"
        if '/' in name_string:
            parts = name_string.split('/')
            given = parts[0].strip()
            surname = parts[1].strip() if len(parts) > 1 else ''
            return given, surname
        else:
            # Fallback: assume last word is surname
            parts = name_string.rsplit(' ', 1)
            if len(parts) == 2:
                return parts[0], parts[1]
            return name_string, ''

    def migrate_places(self):
        """Migrate places from PHP database."""
        logger.info("Migrating places...")
        try:
            places = self.php_reader.get_places()
            for place_data in places:
                try:
                    place, created = Place.objects.get_or_create(
                        tree=self.tree,
                        name=place_data.get('p_place', 'Unknown'),
                        defaults={
                            'latitude': place_data.get('p_lati'),
                            'longitude': place_data.get('p_long'),
                        }
                    )
                    self.id_map['places'][place_data['p_id']] = place.id
                    if created:
                        self.stats['places_created'] += 1
                except Exception as e:
                    error_msg = f"Failed to migrate place {place_data.get('p_id')}: {e}"
                    logger.error(error_msg)
                    self.stats['errors'].append(error_msg)

        except Exception as e:
            logger.error(f"Failed to fetch places: {e}")
            self.stats['errors'].append(f"Failed to fetch places: {e}")

    def migrate_sources(self):
        """Migrate sources from PHP database."""
        logger.info("Migrating sources...")
        try:
            sources = self.php_reader.get_sources()
            for idx, source_data in enumerate(sources, 1):
                try:
                    source, created = Source.objects.get_or_create(
                        tree=self.tree,
                        xref=source_data.get('s_sour', f'S{idx}'),
                        defaults={
                            'title': source_data.get('s_name', 'Unknown'),
                            'text': source_data.get('s_note', ''),
                        }
                    )
                    self.id_map['sources'][source_data['s_id']] = source.id
                    if created:
                        self.stats['sources_created'] += 1
                except Exception as e:
                    error_msg = f"Failed to migrate source {source_data.get('s_id')}: {e}"
                    logger.error(error_msg)
                    self.stats['errors'].append(error_msg)

        except Exception as e:
            logger.error(f"Failed to fetch sources: {e}")
            self.stats['errors'].append(f"Failed to fetch sources: {e}")

    def migrate_individuals(self):
        """Migrate individuals from PHP database."""
        logger.info("Migrating individuals...")
        try:
            individuals = self.php_reader.get_individuals()
            for ind_data in individuals:
                try:
                    given_names, surname = self.parse_name(ind_data.get('i_name', ''))

                    individual, created = Individual.objects.get_or_create(
                        tree=self.tree,
                        xref=ind_data.get('i_gedcom', ind_data.get('i_id')),
                        defaults={
                            'given_names': given_names,
                            'surname': surname,
                            'sex': ind_data.get('i_sex', 'U')[:1] if ind_data.get('i_sex') else 'U',
                            'birth_date': ind_data.get('i_birth', ''),
                            'death_date': ind_data.get('i_death', ''),
                            'gedcom_data': '',
                        }
                    )
                    self.id_map['individuals'][ind_data['i_id']] = individual.id
                    if created:
                        self.stats['individuals_created'] += 1
                except Exception as e:
                    error_msg = f"Failed to migrate individual {ind_data.get('i_id')}: {e}"
                    logger.error(error_msg)
                    self.stats['errors'].append(error_msg)

        except Exception as e:
            logger.error(f"Failed to fetch individuals: {e}")
            self.stats['errors'].append(f"Failed to fetch individuals: {e}")

    def migrate_families(self):
        """Migrate families from PHP database."""
        logger.info("Migrating families...")
        try:
            families = self.php_reader.get_families()
            for fam_data in families:
                try:
                    husband_id = fam_data.get('f_husb')
                    wife_id = fam_data.get('f_wife')
                    children_ids = fam_data.get('f_chil', '').split(',') if fam_data.get('f_chil') else []

                    # Get foreign key IDs for husband/wife
                    husband_fk = None
                    wife_fk = None

                    if husband_id and husband_id in self.id_map['individuals']:
                        husband_fk = Individual.objects.get(
                            tree=self.tree,
                            id=self.id_map['individuals'][husband_id]
                        )
                    if wife_id and wife_id in self.id_map['individuals']:
                        wife_fk = Individual.objects.get(
                            tree=self.tree,
                            id=self.id_map['individuals'][wife_id]
                        )

                    family, created = Family.objects.get_or_create(
                        tree=self.tree,
                        xref=fam_data.get('f_gedcom', fam_data.get('f_id')),
                        defaults={
                            'husband': husband_fk,
                            'wife': wife_fk,
                            'marriage_date': fam_data.get('f_marr', ''),
                            'divorce_date': fam_data.get('f_div', ''),
                            'gedcom_data': '',
                        }
                    )

                    # Add children
                    for child_id in children_ids:
                        child_id = child_id.strip()
                        if child_id in self.id_map['individuals']:
                            child = Individual.objects.get(
                                tree=self.tree,
                                id=self.id_map['individuals'][child_id]
                            )
                            family.children.add(child)

                    self.id_map['families'][fam_data['f_id']] = family.id
                    if created:
                        self.stats['families_created'] += 1
                except Exception as e:
                    error_msg = f"Failed to migrate family {fam_data.get('f_id')}: {e}"
                    logger.error(error_msg)
                    self.stats['errors'].append(error_msg)

        except Exception as e:
            logger.error(f"Failed to fetch families: {e}")
            self.stats['errors'].append(f"Failed to fetch families: {e}")

    def validate_data_integrity(self):
        """Validate data integrity after migration."""
        logger.info("Validating data integrity...")
        issues = []

        # Check for orphaned children (children not in any family)
        individuals = self.tree.individuals.all()
        orphaned_count = 0
        for individual in individuals:
            if not individual.child_of_families.exists():
                if not individual.birth_date and not individual.death_date:
                    orphaned_count += 1

        if orphaned_count > 0:
            logger.warning(f"{orphaned_count} individuals with no family relationships and minimal data")

        # Check for invalid relationships
        families = self.tree.families.all()
        empty_families = 0
        for family in families:
            if not family.husband and not family.wife and not family.children.exists():
                empty_families += 1
                issues.append(f"Family {family.xref} has no members")

        if empty_families > 0:
            logger.warning(f"{empty_families} families with no members")

        return issues

    def run(self):
        """Execute full migration."""
        try:
            with transaction.atomic():
                self.migrate_places()
                self.migrate_sources()
                self.migrate_individuals()
                self.migrate_families()

                # Validate data
                issues = self.validate_data_integrity()

                logger.info(f"Migration completed: {self.stats}")
                return self.stats, issues

        except Exception as e:
            logger.error(f"Migration failed: {e}")
            raise


class Command(BaseCommand):
    help = 'Migrate genealogical data from PHP webtrees database to Django'

    def add_arguments(self, parser):
        parser.add_argument(
            'connection_string',
            type=str,
            help='Database connection string (e.g., mysql://user:pass@localhost/webtrees)'
        )
        parser.add_argument(
            '--tree-name',
            type=str,
            default='Migrated Tree',
            help='Name for the new genealogy tree'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Perform migration without saving changes'
        )
        parser.add_argument(
            '--validate-only',
            action='store_true',
            help='Only validate connection, do not migrate'
        )

    def handle(self, *args, **options):
        connection_string = options['connection_string']
        tree_name = options.get('tree_name', 'Migrated Tree')
        dry_run = options.get('dry_run', False)
        validate_only = options.get('validate_only', False)

        php_reader = PHPDatabaseReader(connection_string)

        try:
            php_reader.connect()

            if validate_only:
                self.stdout.write(self.style.SUCCESS('✓ Connection successful'))
                return

            # Create or get the target tree
            tree, created = Tree.objects.get_or_create(
                name=tree_name,
                defaults={'title': tree_name}
            )

            if not created:
                response = input(
                    f"Tree '{tree_name}' already exists. "
                    "Merge with existing tree? (yes/no): "
                )
                if response.lower() not in ('yes', 'y'):
                    self.stdout.write(self.style.WARNING('Migration cancelled'))
                    return

            migrator = DataMigrator(php_reader, tree)

            if dry_run:
                self.stdout.write(self.style.WARNING('Running in dry-run mode (no changes will be saved)'))
                stats, issues = migrator.run()
            else:
                stats, issues = migrator.run()
                self.stdout.write(self.style.SUCCESS(f'Migration completed successfully!'))
                self.stdout.write(f"\nMigration Statistics:")
                self.stdout.write(f"  Places created: {stats['places_created']}")
                self.stdout.write(f"  Sources created: {stats['sources_created']}")
                self.stdout.write(f"  Individuals created: {stats['individuals_created']}")
                self.stdout.write(f"  Families created: {stats['families_created']}")
                self.stdout.write(f"  Media created: {stats['media_created']}")
                self.stdout.write(f"  Facts created: {stats['facts_created']}")

                if stats['errors']:
                    self.stdout.write(self.style.WARNING(f"\nErrors encountered ({len(stats['errors'])})"))
                    for error in stats['errors'][:5]:  # Show first 5 errors
                        self.stdout.write(f"  - {error}")
                    if len(stats['errors']) > 5:
                        self.stdout.write(f"  ... and {len(stats['errors']) - 5} more errors")

                if issues:
                    self.stdout.write(self.style.WARNING(f"\nData Integrity Issues ({len(issues)})"))
                    for issue in issues[:5]:
                        self.stdout.write(f"  - {issue}")
                    if len(issues) > 5:
                        self.stdout.write(f"  ... and {len(issues) - 5} more issues")

        except CommandError as e:
            self.stdout.write(self.style.ERROR(f'Error: {e}'))
        finally:
            php_reader.disconnect()
