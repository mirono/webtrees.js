import pytest
from django.contrib.auth.models import User

from genealogy.models import Fact, Family, Individual, Media, Note, Place, Source, Tree


@pytest.fixture
def user(db):
    return User.objects.create_user(username="testuser", password="testpass123")


@pytest.fixture
def tree(db, user):
    return Tree.objects.create(name="Test Tree", title="My Family", owner=user)


@pytest.fixture
def place(tree):
    return Place.objects.create(tree=tree, name="London, England")


@pytest.fixture
def source(tree):
    return Source.objects.create(tree=tree, xref="S1", title="Parish Records")


@pytest.fixture
def note(tree):
    return Note.objects.create(tree=tree, xref="N1", text="A test note")


@pytest.fixture
def media(tree):
    return Media.objects.create(tree=tree, xref="M1", title="Photo of John")


@pytest.fixture
def individual(tree):
    return Individual.objects.create(
        tree=tree,
        xref="I1",
        given_names="John",
        surname="Smith",
        sex="M",
        birth_date="1 JAN 1900",
        is_living=False,
    )


@pytest.fixture
def individual2(tree):
    return Individual.objects.create(
        tree=tree, xref="I2", given_names="Jane", surname="Doe", sex="F"
    )


@pytest.fixture
def family(tree, individual, individual2):
    return Family.objects.create(
        tree=tree, xref="F1", husband=individual, wife=individual2, marriage_date="15 JUN 1925"
    )


# --- Tree tests ---


class TestTree:
    def test_create_tree(self, tree):
        assert tree.pk is not None
        assert str(tree) == "Test Tree"

    def test_tree_owner(self, tree, user):
        assert tree.owner == user


# --- Individual tests ---


class TestIndividual:
    def test_create_individual(self, individual):
        assert individual.pk is not None
        assert str(individual) == "John Smith"

    def test_full_name(self, individual):
        assert individual.full_name == "John Smith"

    def test_individual_tree_scoped(self, tree, individual):
        assert individual.tree == tree
        assert individual in tree.individuals.all()

    def test_unique_xref_per_tree(self, tree):
        Individual.objects.create(tree=tree, xref="I99", given_names="A", surname="B")
        with pytest.raises(Exception):
            Individual.objects.create(tree=tree, xref="I99", given_names="C", surname="D")

    def test_individual_with_media(self, individual, media):
        individual.media.add(media)
        assert media in individual.media.all()
        assert individual in media.individuals.all()

    def test_individual_with_sources(self, individual, source):
        individual.sources.add(source)
        assert source in individual.sources.all()

    def test_individual_with_notes(self, individual, note):
        individual.notes.add(note)
        assert note in individual.notes.all()


# --- Family tests ---


class TestFamily:
    def test_create_family(self, family, individual, individual2):
        assert family.pk is not None
        assert family.husband == individual
        assert family.wife == individual2
        assert str(family) == "John Smith & Jane Doe"

    def test_family_children(self, tree, family):
        child = Individual.objects.create(tree=tree, xref="I3", given_names="Baby", surname="Smith")
        family.children.add(child)
        assert child in family.children.all()
        assert family in child.child_of_families.all()

    def test_family_no_spouses(self, tree):
        fam = Family.objects.create(tree=tree, xref="F99")
        assert str(fam) == "F99"

    def test_family_with_media(self, family, media):
        family.media.add(media)
        assert media in family.media.all()


# --- Place tests ---


class TestPlace:
    def test_create_place(self, place):
        assert place.pk is not None
        assert str(place) == "London, England"

    def test_place_hierarchy(self, tree, place):
        child_place = Place.objects.create(tree=tree, name="Westminster", parent=place)
        assert child_place.parent == place
        assert child_place in place.children.all()


# --- Source tests ---


class TestSource:
    def test_create_source(self, source):
        assert source.pk is not None
        assert str(source) == "Parish Records"

    def test_source_xref_display(self, tree):
        s = Source.objects.create(tree=tree, xref="S2")
        assert str(s) == "S2"


# --- Note tests ---


class TestNote:
    def test_create_note(self, note):
        assert note.pk is not None
        assert "N1" in str(note)

    def test_note_text_truncated_in_str(self, tree):
        long_text = "A" * 200
        n = Note.objects.create(tree=tree, xref="N2", text=long_text)
        assert len(str(n)) < 200


# --- Media tests ---


class TestMedia:
    def test_create_media(self, media):
        assert media.pk is not None
        assert str(media) == "Photo of John"


# --- Fact tests ---


class TestFact:
    def test_create_individual_fact(self, tree, individual, place, source):
        fact = Fact.objects.create(
            tree=tree,
            individual=individual,
            fact_type="OCCU",
            value="Blacksmith",
            date="ABT 1920",
            place=place,
        )
        fact.sources.add(source)
        assert fact.pk is not None
        assert "Occupation" in str(fact)
        assert fact in individual.facts.all()

    def test_create_family_fact(self, tree, family, place):
        fact = Fact.objects.create(
            tree=tree,
            family=family,
            fact_type="MARR",
            date="15 JUN 1925",
            place=place,
        )
        assert fact in family.facts.all()
        assert "Marriage" in str(fact)

    def test_fact_with_notes_and_media(self, tree, individual, note, media):
        fact = Fact.objects.create(tree=tree, individual=individual, fact_type="BIRT")
        fact.notes.add(note)
        fact.media.add(media)
        assert note in fact.notes.all()
        assert media in fact.media.all()


# --- Multi-generational relationship test ---


class TestGenealogyRelationships:
    def test_three_generation_tree(self, tree):
        """Test a grandparent -> parent -> child lineage."""
        grandpa = Individual.objects.create(tree=tree, xref="I10", given_names="George", surname="Smith", sex="M")
        grandma = Individual.objects.create(tree=tree, xref="I11", given_names="Mary", surname="Jones", sex="F")
        father = Individual.objects.create(tree=tree, xref="I12", given_names="William", surname="Smith", sex="M")
        mother = Individual.objects.create(tree=tree, xref="I13", given_names="Elizabeth", surname="Brown", sex="F")
        child = Individual.objects.create(tree=tree, xref="I14", given_names="James", surname="Smith", sex="M")

        fam1 = Family.objects.create(tree=tree, xref="F10", husband=grandpa, wife=grandma)
        fam1.children.add(father)

        fam2 = Family.objects.create(tree=tree, xref="F11", husband=father, wife=mother)
        fam2.children.add(child)

        assert father in fam1.children.all()
        assert child in fam2.children.all()
        assert fam1 in father.child_of_families.all()
        assert fam2 in father.families_as_husband.all()
        assert tree.individuals.count() == 5
        assert tree.families.count() == 2

    def test_cascade_delete_tree(self, tree):
        """Deleting a tree should cascade to all its records."""
        Individual.objects.create(tree=tree, xref="I20", given_names="A", surname="B")
        Place.objects.create(tree=tree, name="Somewhere")
        Source.objects.create(tree=tree, xref="S20", title="Some source")
        tree.delete()
        assert Individual.objects.count() == 0
        assert Place.objects.count() == 0
        assert Source.objects.count() == 0
