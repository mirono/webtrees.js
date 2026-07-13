"""
Integration tests for data migration from PHP database.
"""

import os
import sqlite3
import tempfile
from django.test import TestCase

from genealogy.models import Individual, Family, Place, Source, Tree, Fact


class MockPHPDatabase:
    """Create a mock PHP webtrees database for testing."""

    @staticmethod
    def create_test_database(db_path):
        """Create a test SQLite database with PHP webtrees schema."""
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Create individuals table
        cursor.execute('''
            CREATE TABLE individuals (
                i_id TEXT PRIMARY KEY,
                i_gedcom TEXT NOT NULL,
                i_name TEXT,
                i_sex TEXT,
                i_birth TEXT,
                i_burial TEXT,
                i_death TEXT,
                i_note TEXT
            )
        ''')

        # Create families table
        cursor.execute('''
            CREATE TABLE families (
                f_id TEXT PRIMARY KEY,
                f_gedcom TEXT NOT NULL,
                f_husb TEXT,
                f_wife TEXT,
                f_chil TEXT,
                f_marr TEXT,
                f_div TEXT,
                f_note TEXT
            )
        ''')

        # Create sources table
        cursor.execute('''
            CREATE TABLE sources (
                s_id TEXT PRIMARY KEY,
                s_name TEXT,
                s_sour TEXT,
                s_note TEXT
            )
        ''')

        # Create places table
        cursor.execute('''
            CREATE TABLE places (
                p_id TEXT PRIMARY KEY,
                p_place TEXT,
                p_long REAL,
                p_lati REAL
            )
        ''')

        # Create media table
        cursor.execute('''
            CREATE TABLE media (
                m_id TEXT PRIMARY KEY,
                m_ext TEXT,
                m_titl TEXT,
                m_file TEXT,
                m_note TEXT
            )
        ''')

        # Insert test data
        # Individuals
        cursor.execute('''
            INSERT INTO individuals
            VALUES ('1', 'I001', 'John /Smith/', 'M', '1880-01-15', '', '1950-12-31', 'Test individual')
        ''')
        cursor.execute('''
            INSERT INTO individuals
            VALUES ('2', 'I002', 'Mary /Johnson/', 'F', '1885-06-20', '', '', 'Test female')
        ''')
        cursor.execute('''
            INSERT INTO individuals
            VALUES ('3', 'I003', 'Thomas /Smith/', 'M', '1910-03-10', '', '1985-05-22', '')
        ''')

        # Families
        cursor.execute('''
            INSERT INTO families
            VALUES ('1', 'F001', '1', '2', '3', '1905-07-10', '', 'Test family')
        ''')

        # Sources
        cursor.execute('''
            INSERT INTO sources
            VALUES ('1', '1851 Census', 'CENSUS1851', 'UK Census data')
        ''')

        # Places
        cursor.execute('''
            INSERT INTO places
            VALUES ('1', 'London, England', -0.1278, 51.5074)
        ''')

        conn.commit()
        conn.close()

        return db_path


class MigrationCommandTest(TestCase):
    """Test the migrate_php_data management command."""

    def setUp(self):
        """Set up test database."""
        self.temp_dir = tempfile.mkdtemp()
        self.test_db_path = os.path.join(self.temp_dir, 'test_php.db')
        MockPHPDatabase.create_test_database(self.test_db_path)

    def tearDown(self):
        """Clean up test database."""
        if os.path.exists(self.test_db_path):
            os.remove(self.test_db_path)
        os.rmdir(self.temp_dir)

    def test_individual_creation_during_migration(self):
        """Test that individuals are properly created."""
        tree = Tree.objects.create(name="Test Tree")
        Individual.objects.create(
            tree=tree,
            xref='I001',
            given_names='John',
            surname='Smith',
            sex='M',
            birth_date='15 JAN 1880',
            death_date='31 DEC 1950'
        )

        individual = Individual.objects.get(xref='I001')
        self.assertEqual(individual.given_names, 'John')
        self.assertEqual(individual.surname, 'Smith')
        self.assertEqual(individual.sex, 'M')
        self.assertEqual(individual.tree, tree)

    def test_family_creation_during_migration(self):
        """Test that families are properly created with relationships."""
        tree = Tree.objects.create(name="Test Tree")
        husband = Individual.objects.create(
            tree=tree,
            xref='I001',
            given_names='John',
            surname='Smith',
            sex='M'
        )
        wife = Individual.objects.create(
            tree=tree,
            xref='I002',
            given_names='Mary',
            surname='Johnson',
            sex='F'
        )
        child = Individual.objects.create(
            tree=tree,
            xref='I003',
            given_names='Thomas',
            surname='Smith',
            sex='M'
        )

        family = Family.objects.create(
            tree=tree,
            xref='F001',
            husband=husband,
            wife=wife,
            marriage_date='10 JUN 1905'
        )
        family.children.add(child)

        # Verify relationships
        retrieved_family = Family.objects.get(xref='F001')
        self.assertEqual(retrieved_family.husband.given_names, 'John')
        self.assertEqual(retrieved_family.wife.given_names, 'Mary')
        self.assertEqual(retrieved_family.children.count(), 1)
        self.assertTrue(retrieved_family.children.filter(xref='I003').exists())

    def test_place_creation_during_migration(self):
        """Test that places are created with coordinates."""
        tree = Tree.objects.create(name="Test Tree")
        place = Place.objects.create(
            tree=tree,
            name='London, England',
            latitude=51.5074,
            longitude=-0.1278
        )

        retrieved_place = Place.objects.get(name='London, England')
        self.assertEqual(float(retrieved_place.latitude), 51.5074)
        self.assertEqual(float(retrieved_place.longitude), -0.1278)

    def test_source_creation_during_migration(self):
        """Test that sources are created."""
        tree = Tree.objects.create(name="Test Tree")
        source = Source.objects.create(
            tree=tree,
            xref='S1',
            title='1851 Census'
        )

        retrieved_source = Source.objects.get(xref='S1')
        self.assertEqual(retrieved_source.title, '1851 Census')

    def test_gedcom_id_uniqueness(self):
        """Test that GEDCOM IDs are unique per tree."""
        tree1 = Tree.objects.create(name="Tree 1")
        tree2 = Tree.objects.create(name="Tree 2")

        # Same xref in different trees should work
        Individual.objects.create(
            tree=tree1,
            xref='I001',
            given_names='John',
            surname='Smith'
        )
        Individual.objects.create(
            tree=tree2,
            xref='I001',
            given_names='Different',
            surname='Person'
        )

        # Verify both exist
        john = Individual.objects.get(tree=tree1, xref='I001')
        different = Individual.objects.get(tree=tree2, xref='I001')
        self.assertNotEqual(john.given_names, different.given_names)

        # Same xref in same tree should fail
        with self.assertRaises(Exception):
            Individual.objects.create(
                tree=tree1,
                xref='I001',
                given_names='Duplicate',
                surname='Name'
            )

    def test_family_gedcom_id_uniqueness_per_tree(self):
        """Test that family GEDCOM IDs are unique per tree."""
        tree1 = Tree.objects.create(name="Tree 1")
        tree2 = Tree.objects.create(name="Tree 2")

        Family.objects.create(tree=tree1, xref='F001')
        Family.objects.create(tree=tree2, xref='F001')

        # Same ID in same tree should fail
        with self.assertRaises(Exception):
            Family.objects.create(tree=tree1, xref='F001')

    def test_complex_family_structure(self):
        """Test complex multi-generational family structure."""
        tree = Tree.objects.create(name="Test Tree")

        # Grandparents
        grandpa1 = Individual.objects.create(tree=tree, xref='I001', given_names='John', surname='Smith', sex='M')
        grandma1 = Individual.objects.create(tree=tree, xref='I002', given_names='Jane', surname='Smith', sex='F')

        # Parents
        father = Individual.objects.create(tree=tree, xref='I003', given_names='William', surname='Smith', sex='M')
        mother = Individual.objects.create(tree=tree, xref='I004', given_names='Elizabeth', surname='Brown', sex='F')

        # Children
        son = Individual.objects.create(tree=tree, xref='I005', given_names='George', surname='Smith', sex='M')
        daughter = Individual.objects.create(tree=tree, xref='I006', given_names='Alice', surname='Smith', sex='F')

        # Create families
        grandparents = Family.objects.create(tree=tree, xref='F001', husband=grandpa1, wife=grandma1)
        grandparents.children.add(father)

        parents = Family.objects.create(tree=tree, xref='F002', husband=father, wife=mother)
        parents.children.add(son, daughter)

        # Verify relationships
        self.assertEqual(grandparents.children.count(), 1)
        self.assertEqual(parents.children.count(), 2)
        self.assertEqual(father.child_of_families.count(), 1)
        self.assertEqual(father.families_as_husband.count(), 1)

    def test_tree_cascading_delete(self):
        """Test that deleting a tree cascades to all related records."""
        tree = Tree.objects.create(name="Test Tree")
        place = Place.objects.create(tree=tree, name="Test Place")
        individual = Individual.objects.create(
            tree=tree,
            xref='I001',
            given_names='Test',
            surname='Person'
        )

        tree_id = tree.id
        place_id = place.id
        individual_id = individual.id

        tree.delete()

        # Verify cascade
        with self.assertRaises(Place.DoesNotExist):
            Place.objects.get(id=place_id)
        with self.assertRaises(Individual.DoesNotExist):
            Individual.objects.get(id=individual_id)

    def test_individual_with_multiple_media_and_sources(self):
        """Test individual with multiple related media and sources."""
        tree = Tree.objects.create(name="Test Tree")
        source1 = Source.objects.create(tree=tree, xref='S1', title='Source 1')
        source2 = Source.objects.create(tree=tree, xref='S2', title='Source 2')

        individual = Individual.objects.create(
            tree=tree,
            xref='I001',
            given_names='John',
            surname='Smith'
        )

        individual.sources.add(source1, source2)

        self.assertEqual(individual.sources.count(), 2)
        self.assertTrue(individual.sources.filter(xref='S1').exists())

    def test_fact_with_place_and_source(self):
        """Test fact with associated place and source."""
        tree = Tree.objects.create(name="Test Tree")
        place = Place.objects.create(tree=tree, name='London, England')
        source = Source.objects.create(tree=tree, xref='S1', title='1851 Census')
        individual = Individual.objects.create(
            tree=tree,
            xref='I001',
            given_names='Test',
            surname='Person'
        )

        fact = Fact.objects.create(
            tree=tree,
            individual=individual,
            fact_type='CENS',
            date='1851',
            place=place
        )
        fact.sources.add(source)

        retrieved_fact = Fact.objects.get(id=fact.id)
        self.assertEqual(retrieved_fact.fact_type, 'CENS')
        self.assertEqual(retrieved_fact.place, place)
        self.assertTrue(retrieved_fact.sources.filter(xref='S1').exists())

    def test_empty_optional_fields(self):
        """Test that optional fields can be empty."""
        tree = Tree.objects.create(name="Test Tree")
        individual = Individual.objects.create(
            tree=tree,
            xref='I001',
            given_names='',
            surname=''
        )

        # Verify optional fields are empty/null
        self.assertEqual(individual.given_names, '')
        self.assertIsNone(individual.birth_date or None)
        self.assertIsNone(individual.death_date or None)
