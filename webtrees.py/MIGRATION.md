# Data Migration from PHP to Django

## Overview

This document describes the data migration process for migrating genealogical data from a PHP webtrees database to the Django application.

## Architecture

### Django Models

The genealogy app implements a comprehensive set of Django models that mirror the GEDCOM 5.5.1 data model:

- **Tree**: A genealogy database (equivalent to a GEDCOM file)
  - Contains complete genealogy data for a single family tree
  - Supports ownership and multi-user trees
  - Acts as the primary organizational unit

- **Individual**: A person in the genealogy (GEDCOM INDI record)
  - Stores given names, surname, sex
  - Tracks birth/death dates and places
  - Supports GEDCOM data preservation
  - Can have media, notes, and sources

- **Family**: A family group linking spouses and children (GEDCOM FAM record)
  - Links husband and wife
  - Manages parent-child relationships
  - Tracks marriage and divorce information
  - Supports multiple families per person (child relationships)

- **Place**: A geographic location
  - Supports hierarchical places (city > county > state > country)
  - Stores latitude/longitude coordinates
  - Can be referenced by multiple individuals and families

- **Source**: A source of genealogical information (GEDCOM SOUR record)
  - Stores title, author, publisher, publication info
  - Preserves source citations and text
  - Links to individuals and families for citations

- **Media**: Multimedia objects - photos, documents, audio, video (GEDCOM OBJE record)
  - Stores file references and metadata
  - MIME type tracking for display
  - Can be attached to individuals and families

- **Note**: Shared note records (GEDCOM NOTE record)
  - Stores textual notes
  - Can be attached to individuals, families, and facts

- **Fact**: Events and attributes (GEDCOM EVEN/ATTR records)
  - Tracks birth, death, marriage, census, occupation, residence, etc.
  - 50+ fact types supported
  - Can reference places, sources, notes, and media

### Database Backends

The application supports multiple database backends:

- **SQLite** (development): `sqlite:///path/to/db.sqlite3`
- **PostgreSQL** (production): `postgresql://user:pass@host:5432/dbname`
- **MySQL** (alternative): `mysql://user:pass@host:3306/dbname`

## Migration Process

### Prerequisites

1. Access to the source PHP webtrees database
2. Connection credentials or connection string
3. Django development environment with `genealogy` app installed and migrated

### Step 1: Verify Database Connection

Test the connection without migrating data:

```bash
python manage.py migrate_php_data \
  "mysql://user:password@localhost/webtrees" \
  --validate-only
```

Output:
```
✓ Connection successful
```

### Step 2: Run Dry-Run Migration

Test the migration process without saving changes:

```bash
python manage.py migrate_php_data \
  "mysql://user:password@localhost/webtrees" \
  --tree-name "Family Name" \
  --dry-run
```

This will:
- Connect to the PHP database
- Read all genealogical data
- Create Django model instances in memory
- Validate data integrity
- Rollback all changes without saving

### Step 3: Execute Full Migration

Run the migration to save data:

```bash
python manage.py migrate_php_data \
  "mysql://user:password@localhost/webtrees" \
  --tree-name "Family Name"
```

The command will:
1. Parse the connection string and connect to the PHP database
2. Create a new Tree in Django
3. Migrate places
4. Migrate sources
5. Migrate individuals
6. Migrate families
7. Validate data integrity
8. Report results

### Migration Statistics

The migration reports:
- Places created
- Sources created
- Individuals created
- Families created
- Media created (when available)
- Facts created (when available)
- Errors encountered
- Data integrity issues

Example output:
```
Migration completed successfully!

Migration Statistics:
  Places created: 47
  Sources created: 12
  Individuals created: 254
  Families created: 89
  Media created: 0
  Facts created: 0

Errors encountered (3)
  - Failed to migrate place 15: ...
  ...
```

## Data Mapping

### PHP to Django Field Mapping

| PHP Field | Django Field | Notes |
|-----------|--------------|-------|
| `i_id` | `Individual.xref` | GEDCOM ID (e.g., I001) |
| `i_gedcom` | `Individual.xref` | Used if available |
| `i_name` | `given_names`, `surname` | Parsed from GEDCOM format |
| `i_sex` | `sex` | M/F/U/X |
| `i_birth` | `birth_date` | GEDCOM date string |
| `p_place` | `Place.name` | Birth place |
| `i_death` | `death_date` | GEDCOM date string |
| `p_place` | `Place.name` | Death place |
| `f_id` | `Family.xref` | Family GEDCOM ID |
| `f_husb` | `Family.husband` | FK to Individual |
| `f_wife` | `Family.wife` | FK to Individual |
| `f_chil` | `Family.children` | M2M to Individual |
| `f_marr` | `Family.marriage_date` | GEDCOM date string |
| `s_name` | `Source.title` | Source name |
| `s_sour` | `Source.xref` | Source GEDCOM ID |
| `p_place` | `Place.name` | Place name |

### Name Parsing

Names are parsed from GEDCOM format:
- Input: `"John /Smith/"`
- Output: `given_names="John"`, `surname="Smith"`

Fallback parsing if GEDCOM format not found:
- Input: `"John Smith"`
- Output: `given_names="John"`, `surname="Smith"`

## Data Integrity

### Validation Checks

The migration validates:

1. **Orphaned Individuals**: Individuals with no family relationships and minimal data are logged
2. **Empty Families**: Families with no members are flagged as issues
3. **Cascading Relationships**: Parent-child relationships are verified
4. **Referential Integrity**: All foreign keys are validated

### Error Handling

- Individual migration errors are logged and recorded
- Migration continues despite errors (all-or-nothing per entity)
- Errors are reported at end of migration
- Full atomic transaction — entire migration rolls back on critical failure

## Testing

### Unit Tests (26 tests)

Run tests with:
```bash
python manage.py test genealogy.tests
```

Test coverage includes:
- Model creation and validation
- Relationships (one-to-many, many-to-many)
- Cascading deletes
- Field uniqueness constraints
- Hierarchical data (places)
- Fact creation and typing
- Data integrity

### Integration Tests

Tests include:
- Mock PHP database creation
- Multi-family relationships (child in one family, parent in another)
- Tree cascading deletes

### Manual Testing

1. **Validate Connection**:
   ```bash
   python manage.py migrate_php_data \
     "sqlite:///path/to/php.db" \
     --validate-only
   ```

2. **Dry-Run Migration**:
   ```bash
   python manage.py migrate_php_data \
     "sqlite:///path/to/php.db" \
     --tree-name "Test" \
     --dry-run
   ```

3. **Full Migration**:
   ```bash
   python manage.py migrate_php_data \
     "sqlite:///path/to/php.db" \
     --tree-name "My Family"
   ```

4. **Verify in Django Admin**:
   ```bash
   python manage.py createsuperuser
   python manage.py runserver
   # Visit http://localhost:8000/admin/
   ```

## Multiple Database Backends

### SQLite Example

For development with SQLite:

```bash
# Connection string for local file
python manage.py migrate_php_data \
  "sqlite:////path/to/webtrees.db"

# Connection string for relative path
python manage.py migrate_php_data \
  "sqlite:///./webtrees.db"
```

### PostgreSQL Example

For production with PostgreSQL:

```bash
python manage.py migrate_php_data \
  "postgresql://webtrees_user:password@db.example.com:5432/webtrees_db"
```

### MySQL Example

For MySQL backend:

```bash
python manage.py migrate_php_data \
  "mysql://webtrees_user:password@db.example.com:3306/webtrees_db"
```

## Environment Configuration

Configure database backend via environment variables:

```bash
export DB_ENGINE="django.db.backends.postgresql"
export DB_NAME="webtrees_django"
export DB_USER="postgres"
export DB_PASSWORD="secret"
export DB_HOST="localhost"
export DB_PORT="5432"

python manage.py migrate_php_data \
  "postgresql://webtrees_user:password@php.db.com/webtrees"
```

## Performance Considerations

### Large Datasets

For large genealogies (10,000+ individuals):

1. **Database**: Use PostgreSQL or MySQL (not SQLite)
2. **Memory**: Ensure sufficient RAM (2GB+ recommended)
3. **Indexing**: Indexes are created on:
   - `(tree, surname)` on Individual
   - `(tree, xref)` on Individual
   - `(tree, name)` on Place
   - `(tree, fact_type)` on Fact

### Batch Processing

The migration processes data in batches:
- No explicit batching; Django ORM handles efficiently
- Atomic transaction ensures consistency
- Rollback on error preserves data integrity

## Troubleshooting

### Connection Errors

**Error**: `Failed to connect to PHP database`
- Verify connection string format
- Check credentials
- Confirm network connectivity
- Verify PHP database is running

### Data Type Errors

**Error**: `Failed to migrate individual X`
- Check for malformed names in GEDCOM format
- Verify date formats are valid GEDCOM
- Check for null/empty critical fields

### Unique Constraint Violations

**Error**: `UNIQUE constraint failed`
- Check for duplicate xrefs in PHP database
- Consider data cleanup before migration
- Use `--tree-name` to create separate tree if needed

### Memory Errors

**Error**: `MemoryError` or process killed
- Reduce dataset size or split migration
- Use production database (PostgreSQL/MySQL)
- Increase available RAM

## Post-Migration

After successful migration:

1. **Verify Data**: Check counts and spot-check individuals/families
2. **Create Admin User**: Add Django admin user for access
3. **Configure Views**: Build views and templates for genealogy display
4. **Set Permissions**: Configure access control per tree
5. **Export to GEDCOM**: Test GEDCOM export for backup/compatibility

## Architecture Notes

- **No Raw SQL**: Uses Django ORM exclusively (portable, safe)
- **GEDCOM Standard**: Models and field names follow GEDCOM 5.5.1
- **Data Preservation**: Raw GEDCOM stored in `gedcom_data` field for round-tripping
- **Multi-Tree Support**: Single Django instance can manage multiple genealogies
- **Cascade Deletes**: Tree deletion cascades to all related records
- **Unique per Tree**: xref fields are unique per tree, allowing data isolation
