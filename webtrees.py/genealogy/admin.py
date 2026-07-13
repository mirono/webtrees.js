from django.contrib import admin

from .models import Fact, Family, Individual, Media, Note, Place, Source, Tree


@admin.register(Tree)
class TreeAdmin(admin.ModelAdmin):
    list_display = ("name", "title", "owner", "created_at")
    search_fields = ("name", "title")


@admin.register(Place)
class PlaceAdmin(admin.ModelAdmin):
    list_display = ("name", "tree", "latitude", "longitude")
    list_filter = ("tree",)
    search_fields = ("name",)


@admin.register(Source)
class SourceAdmin(admin.ModelAdmin):
    list_display = ("xref", "title", "author", "tree")
    list_filter = ("tree",)
    search_fields = ("title", "author", "xref")


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ("xref", "tree", "text_preview")
    list_filter = ("tree",)

    @admin.display(description="Text")
    def text_preview(self, obj):
        return obj.text[:80] if obj.text else ""


@admin.register(Media)
class MediaAdmin(admin.ModelAdmin):
    list_display = ("xref", "title", "mime_type", "tree")
    list_filter = ("tree", "mime_type")
    search_fields = ("title", "xref")


@admin.register(Individual)
class IndividualAdmin(admin.ModelAdmin):
    list_display = ("xref", "given_names", "surname", "sex", "birth_date", "is_living", "tree")
    list_filter = ("tree", "sex", "is_living")
    search_fields = ("given_names", "surname", "xref")


@admin.register(Family)
class FamilyAdmin(admin.ModelAdmin):
    list_display = ("xref", "husband", "wife", "marriage_date", "tree")
    list_filter = ("tree",)
    search_fields = ("xref",)


@admin.register(Fact)
class FactAdmin(admin.ModelAdmin):
    list_display = ("fact_type", "individual", "family", "date", "value", "tree")
    list_filter = ("tree", "fact_type")
    search_fields = ("value",)
