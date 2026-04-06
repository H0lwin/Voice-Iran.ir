from rest_framework import serializers

from api.i18n import resolve_language_code
from documents.models import Document


class DocumentSerializer(serializers.ModelSerializer):
    title = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()
    thumbnail = serializers.SerializerMethodField()
    summary = serializers.SerializerMethodField()
    type_label = serializers.SerializerMethodField()
    primary_file_url = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = (
            "id",
            "slug",
            "title",
            "description",
            "summary",
            "type",
            "type_label",
            "thumbnail",
            "published_at",
            "view_count",
            "download_count",
            "duration_seconds",
            "page_count",
            "item_count",
            "primary_file_url",
            "is_featured",
        )

    def _lang(self):
        request = self.context.get("request")
        return resolve_language_code(request.query_params.get("lang") if request else None)

    def get_title(self, obj):
        lang = self._lang()
        return obj.title_en if lang == "en" and obj.title_en else obj.title_fa or obj.slug

    def get_description(self, obj):
        lang = self._lang()
        return obj.description_en if lang == "en" and obj.description_en else obj.description_fa

    def get_type(self, obj):
        return obj.document_type.code if obj.document_type else ""

    def get_type_label(self, obj):
        if not obj.document_type:
            return ""
        lang = self._lang()
        return obj.document_type.name_en if lang == "en" and obj.document_type.name_en else obj.document_type.name

    def get_thumbnail(self, obj):
        if not obj.thumbnail:
            return ""
        request = self.context.get("request")
        return request.build_absolute_uri(obj.thumbnail.url) if request else obj.thumbnail.url

    def get_summary(self, obj):
        lang = self._lang()
        return obj.summary_en if lang == "en" and obj.summary_en else obj.summary_fa

    def get_primary_file_url(self, obj):
        primary_file = obj.files.filter(is_primary=True).order_by("sort_order", "id").first()
        if not primary_file:
            primary_file = obj.files.order_by("sort_order", "id").first()
        if not primary_file:
            return ""
        request = self.context.get("request")
        return request.build_absolute_uri(primary_file.file.url) if request else primary_file.file.url
