# Genealogy App

A comprehensive Django application for managing genealogical data with support for GEDCOM 5.5.1 standard.

## Features

- **Tree Management**: Create and manage multiple family trees
- **Individual Records**: Track people with birth/death dates and places
- **Family Relationships**: Model complex family structures including multiple marriages
- **Sources**: Cite genealogical sources for data validation
- **Media Management**: Attach photos, documents, and other media to people and families
- **Facts & Events**: Track detailed life events (birth, death, marriage, census, occupation, etc.)
- **Places**: Store geographic locations with coordinates and hierarchical relationships
- **Notes**: Attach notes to individuals, families, and facts
- **GEDCOM Support**: Store raw GEDCOM data for round-tripping
- **Multi-Database**: Works with SQLite, PostgreSQL, and MySQL

## Models

### Tree
A genealogy database (equivalent to a single GEDCOM file).

```python
tree = Tree.objects.create(
    name="Smith Family",
    title="The Smith Family Tree",
    description="Family history"
)
```

### Individual
A person in the genealogy.

```python
person = Individual.objects.create(
    tree=tree,
    xref="I001",
    given_names="John",
    surname="Smith",
    sex="M",
    birth_date="15 JAN 1880",
    birth_place=place,
    death_date="31 DEC 1950"
)
```

### Family
A family group linking spouses and children.

```python
family = Family.objects.create(
    tree=tree,
    xref="F001",
    husband=john,
    wife=mary,
    marriage_date="10 JUN 1900"
)
family.children.add(child1, child2)
```

### Place
A geographic location.

```python
place = Place.objects.create(
    tree=tree,
    name="London, England",
    latitude=51.5074,
    longitude=-0.1278
)
```

### Source
A source of genealogical information.

```python
source = Source.objects.create(
    tree=tree,
    xref="S1",
    title="1851 Census",
    author="UK Government"
)
individual.sources.add(source)
```

### Media
Photos, documents, audio, video.

```python
media = Media.objects.create(
    tree=tree,
    xref="M1",
    title="Smith Family Photo",
    file_path="photos/smith.jpg",
    mime_type="image/jpeg"
)
individual.media.add(media)
```

### Note
Shared notes.

```python
note = Note.objects.create(
    tree=tree,
    xref="N1",
    text="Additional information about this person"
)
individual.notes.add(note)
```

### Fact
Events and attributes (birth, death, marriage, census, occupation, etc.).

```python
fact = Fact.objects.create(
    tree=tree,
    individual=person,
    fact_type="OCCU",
    value="Blacksmith",
    date="1900-1940",
    place=workplace
)
```

## Relationships

### Individual Relationships
- `Individual.family_as_husband`: Families where individual is husband
- `Individual.families_as_wife`: Families where individual is wife
- `Individual.child_of_families`: Families where individual is a child
- `Individual.media`: Related media objects
- `Individual.notes`: Related notes
- `Individual.sources`: Related sources
- `Individual.facts`: Related facts/events

### Family Relationships
- `Family.husband`: FK to Individual (husband)
- `Family.wife`: FK to Individual (wife)
- `Family.children`: M2M to Individual (children)
- `Family.media`: Related media
- `Family.notes`: Related notes
- `Family.sources`: Related sources
- `Family.facts`: Related facts/events

## Querying Examples

### Find all individuals in a tree
```python
individuals = tree.individuals.all()
individuals = tree.individuals.filter(surname="Smith")
individuals = tree.individuals.filter(sex="F")
```

### Find families with children
```python
families = Family.objects.filter(tree=tree, children__isnull=False).distinct()
```

### Find individuals born in a specific place
```python
people_born = tree.individuals.filter(birth_place=place)
```

### Find all facts of a specific type
```python
censuses = tree.facts.filter(fact_type="CENS")
marriages = tree.facts.filter(fact_type="MARR")
```

### Find sources cited for an individual
```python
sources = person.sources.all()
```

## Data Migration

For migrating data from PHP webtrees, see [MIGRATION.md](../MIGRATION.md).

Quick start:
```bash
python manage.py migrate_php_data \
  "mysql://user:pass@localhost/webtrees" \
  --tree-name "Family Name"
```

## Testing

Run tests:
```bash
python manage.py test genealogy.tests -v 2
```

26 tests cover:
- Model creation
- Relationships
- Cascading deletes
- Field validation
- Data integrity
- Hierarchical data

## Admin Interface

Register models in Django admin:

```python
from django.contrib import admin
from genealogy.models import Tree, Individual, Family, Place, Source, Media, Note, Fact

admin.site.register(Tree)
admin.site.register(Individual)
admin.site.register(Family)
admin.site.register(Place)
admin.site.register(Source)
admin.site.register(Media)
admin.site.register(Note)
admin.site.register(Fact)
```

Then access via `/admin/`.

## GEDCOM Compliance

The models implement the GEDCOM 5.5.1 data model:
- `xref` field stores GEDCOM cross-reference identifiers (e.g., I001, F001)
- `gedcom_data` field stores raw GEDCOM text for round-tripping
- Fact types follow GEDCOM standard (50+ types supported)

## Performance

### Indexes
- `(tree, surname)` on Individual
- `(tree, xref)` on Individual
- `(tree, name)` on Place
- `(tree, fact_type)` on Fact
- `(individual, fact_type)` on Fact

### Queries
- Use `select_related()` and `prefetch_related()` for related objects
- Filter by tree to isolate genealogies
- Unique constraints prevent duplicate xrefs per tree

## Future Enhancements

- GEDCOM import/export API
- REST API for tree access
- Search across genealogies
- Privacy controls per individual/family
- Change tracking and versioning
- Photo gallery views
- Ancestry/descendancy charts
- Timeline views
- Direct ancestor search
