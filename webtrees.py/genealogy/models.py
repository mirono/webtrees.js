"""
Core genealogy models for the webtrees Django application.

Models mirror the GEDCOM 5.5.1 data model:
- Tree: a genealogy database (equivalent to a GEDCOM file)
- Individual: a person (INDI record)
- Family: a family group linking spouses and children (FAM record)
- Place: a geographic location
- Source: a source of information (SOUR record)
- Media: a multimedia object — photo, document, etc. (OBJE record)
- Note: a shared note (NOTE record)
- Fact: an event or attribute attached to an Individual or Family (EVEN/ATTR)
"""

from django.conf import settings
from django.db import models


class Tree(models.Model):
    """A genealogy tree / family file. Equivalent to a single GEDCOM file."""

    name = models.CharField(max_length=255)
    title = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="trees",
    )

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Place(models.Model):
    """A geographic place, potentially hierarchical (city > county > state > country)."""

    tree = models.ForeignKey(Tree, on_delete=models.CASCADE, related_name="places")
    name = models.CharField(max_length=512, help_text="Full place name, comma-separated hierarchy")
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    parent = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True, related_name="children"
    )

    class Meta:
        ordering = ["name"]
        indexes = [
            models.Index(fields=["tree", "name"]),
        ]

    def __str__(self):
        return self.name


class Source(models.Model):
    """A source of genealogical information (GEDCOM SOUR record)."""

    tree = models.ForeignKey(Tree, on_delete=models.CASCADE, related_name="sources")
    xref = models.CharField(max_length=50, help_text="GEDCOM cross-reference identifier (e.g. S1)")
    title = models.CharField(max_length=512, blank=True)
    author = models.CharField(max_length=512, blank=True)
    publisher = models.CharField(max_length=512, blank=True)
    publication = models.TextField(blank=True, help_text="Publication facts")
    text = models.TextField(blank=True, help_text="Source text / transcription")
    repository_name = models.CharField(max_length=512, blank=True)
    gedcom_data = models.TextField(blank=True, help_text="Raw GEDCOM for this record")

    class Meta:
        unique_together = [("tree", "xref")]
        ordering = ["title"]

    def __str__(self):
        return self.title or self.xref


class Note(models.Model):
    """A shared note record (GEDCOM NOTE record)."""

    tree = models.ForeignKey(Tree, on_delete=models.CASCADE, related_name="notes")
    xref = models.CharField(max_length=50, help_text="GEDCOM cross-reference identifier (e.g. N1)")
    text = models.TextField()
    gedcom_data = models.TextField(blank=True, help_text="Raw GEDCOM for this record")

    class Meta:
        unique_together = [("tree", "xref")]

    def __str__(self):
        return f"Note {self.xref}: {self.text[:50]}"


class Media(models.Model):
    """A multimedia object — photo, document, audio, video (GEDCOM OBJE record)."""

    tree = models.ForeignKey(Tree, on_delete=models.CASCADE, related_name="media")
    xref = models.CharField(max_length=50, help_text="GEDCOM cross-reference identifier (e.g. M1)")
    title = models.CharField(max_length=512, blank=True)
    file_path = models.CharField(max_length=1024, blank=True, help_text="Relative path to media file")
    mime_type = models.CharField(max_length=100, blank=True)
    file = models.FileField(upload_to="genealogy/media/%Y/%m/", blank=True)
    gedcom_data = models.TextField(blank=True, help_text="Raw GEDCOM for this record")

    class Meta:
        unique_together = [("tree", "xref")]
        verbose_name_plural = "media"
        ordering = ["title"]

    def __str__(self):
        return self.title or self.xref


class Individual(models.Model):
    """A person in the genealogy (GEDCOM INDI record)."""

    SEX_CHOICES = [
        ("M", "Male"),
        ("F", "Female"),
        ("U", "Unknown"),
        ("X", "Intersex"),
    ]

    tree = models.ForeignKey(Tree, on_delete=models.CASCADE, related_name="individuals")
    xref = models.CharField(max_length=50, help_text="GEDCOM cross-reference identifier (e.g. I1)")
    given_names = models.CharField(max_length=512, blank=True)
    surname = models.CharField(max_length=255, blank=True)
    sex = models.CharField(max_length=1, choices=SEX_CHOICES, default="U")
    birth_date = models.CharField(max_length=100, blank=True, help_text="GEDCOM date string")
    birth_place = models.ForeignKey(
        Place, on_delete=models.SET_NULL, null=True, blank=True, related_name="births"
    )
    death_date = models.CharField(max_length=100, blank=True, help_text="GEDCOM date string")
    death_place = models.ForeignKey(
        Place, on_delete=models.SET_NULL, null=True, blank=True, related_name="deaths"
    )
    is_living = models.BooleanField(default=True)
    media = models.ManyToManyField(Media, blank=True, related_name="individuals")
    notes = models.ManyToManyField(Note, blank=True, related_name="individuals")
    sources = models.ManyToManyField(Source, blank=True, related_name="individuals")
    gedcom_data = models.TextField(blank=True, help_text="Raw GEDCOM for this record")

    class Meta:
        unique_together = [("tree", "xref")]
        ordering = ["surname", "given_names"]
        indexes = [
            models.Index(fields=["tree", "surname"]),
            models.Index(fields=["tree", "xref"]),
        ]

    def __str__(self):
        return f"{self.given_names} {self.surname}".strip() or self.xref

    @property
    def full_name(self):
        return f"{self.given_names} {self.surname}".strip()


class Family(models.Model):
    """A family group linking two spouses and their children (GEDCOM FAM record)."""

    tree = models.ForeignKey(Tree, on_delete=models.CASCADE, related_name="families")
    xref = models.CharField(max_length=50, help_text="GEDCOM cross-reference identifier (e.g. F1)")
    husband = models.ForeignKey(
        Individual, on_delete=models.SET_NULL, null=True, blank=True, related_name="families_as_husband"
    )
    wife = models.ForeignKey(
        Individual, on_delete=models.SET_NULL, null=True, blank=True, related_name="families_as_wife"
    )
    children = models.ManyToManyField(Individual, blank=True, related_name="child_of_families")
    marriage_date = models.CharField(max_length=100, blank=True, help_text="GEDCOM date string")
    marriage_place = models.ForeignKey(
        Place, on_delete=models.SET_NULL, null=True, blank=True, related_name="marriages"
    )
    divorce_date = models.CharField(max_length=100, blank=True, help_text="GEDCOM date string")
    media = models.ManyToManyField(Media, blank=True, related_name="families")
    notes = models.ManyToManyField(Note, blank=True, related_name="families")
    sources = models.ManyToManyField(Source, blank=True, related_name="families")
    gedcom_data = models.TextField(blank=True, help_text="Raw GEDCOM for this record")

    class Meta:
        unique_together = [("tree", "xref")]
        verbose_name_plural = "families"
        ordering = ["xref"]

    def __str__(self):
        parts = []
        if self.husband:
            parts.append(str(self.husband))
        if self.wife:
            parts.append(str(self.wife))
        return " & ".join(parts) if parts else self.xref


class Fact(models.Model):
    """An event or attribute attached to an Individual or Family (GEDCOM EVEN/ATTR).

    Examples: birth, death, marriage, census, occupation, residence, baptism, burial, etc.
    """

    FACT_TYPE_CHOICES = [
        # Individual events
        ("BIRT", "Birth"),
        ("CHR", "Christening"),
        ("DEAT", "Death"),
        ("BURI", "Burial"),
        ("CREM", "Cremation"),
        ("ADOP", "Adoption"),
        ("BAPM", "Baptism"),
        ("BARM", "Bar Mitzvah"),
        ("BASM", "Bat Mitzvah"),
        ("CENS", "Census"),
        ("CONF", "Confirmation"),
        ("EMIG", "Emigration"),
        ("FCOM", "First Communion"),
        ("GRAD", "Graduation"),
        ("IMMI", "Immigration"),
        ("NATU", "Naturalization"),
        ("ORDN", "Ordination"),
        ("PROB", "Probate"),
        ("RETI", "Retirement"),
        ("WILL", "Will"),
        ("EVEN", "Event"),
        # Individual attributes
        ("CAST", "Caste"),
        ("DSCR", "Physical Description"),
        ("EDUC", "Education"),
        ("IDNO", "ID Number"),
        ("NATI", "Nationality"),
        ("NCHI", "Number of Children"),
        ("NMR", "Number of Marriages"),
        ("OCCU", "Occupation"),
        ("PROP", "Property"),
        ("RELI", "Religion"),
        ("RESI", "Residence"),
        ("SSN", "Social Security Number"),
        ("TITL", "Title"),
        # Family events
        ("ANUL", "Annulment"),
        ("DIV", "Divorce"),
        ("DIVF", "Divorce Filed"),
        ("ENGA", "Engagement"),
        ("MARB", "Marriage Bann"),
        ("MARC", "Marriage Contract"),
        ("MARL", "Marriage License"),
        ("MARR", "Marriage"),
        ("MARS", "Marriage Settlement"),
    ]

    tree = models.ForeignKey(Tree, on_delete=models.CASCADE, related_name="facts")
    individual = models.ForeignKey(
        Individual, on_delete=models.CASCADE, null=True, blank=True, related_name="facts"
    )
    family = models.ForeignKey(
        Family, on_delete=models.CASCADE, null=True, blank=True, related_name="facts"
    )
    fact_type = models.CharField(max_length=10, choices=FACT_TYPE_CHOICES)
    value = models.CharField(max_length=512, blank=True, help_text="Fact value (e.g. occupation name)")
    date = models.CharField(max_length=100, blank=True, help_text="GEDCOM date string")
    place = models.ForeignKey(
        Place, on_delete=models.SET_NULL, null=True, blank=True, related_name="facts"
    )
    sources = models.ManyToManyField(Source, blank=True, related_name="facts")
    notes = models.ManyToManyField(Note, blank=True, related_name="facts")
    media = models.ManyToManyField(Media, blank=True, related_name="facts")
    gedcom_data = models.TextField(blank=True, help_text="Raw GEDCOM snippet for this fact")

    class Meta:
        ordering = ["fact_type", "date"]
        indexes = [
            models.Index(fields=["tree", "fact_type"]),
            models.Index(fields=["individual", "fact_type"]),
        ]

    def __str__(self):
        target = self.individual or self.family or "?"
        return f"{self.get_fact_type_display()} - {target}"
