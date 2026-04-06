from rest_framework import serializers

from api.i18n import resolve_language_code
from arsenal.models import Weapon


class WeaponSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    category_slug = serializers.SerializerMethodField()
    range = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    features = serializers.SerializerMethodField()
    specs = serializers.SerializerMethodField()
    status_label = serializers.SerializerMethodField()
    year = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()

    class Meta:
        model = Weapon
        fields = (
            "id",
            "slug",
            "name",
            "type",
            "category",
            "category_slug",
            "range",
            "image",
            "features",
            "specs",
            "status_label",
            "year",
            "description",
            "published_at",
            "is_featured",
        )

    def _lang(self):
        request = self.context.get("request")
        return resolve_language_code(request.query_params.get("lang") if request else None)

    def get_name(self, obj):
        lang = self._lang()
        return obj.name_en if lang == "en" and obj.name_en else obj.name_fa or obj.slug

    def get_type(self, obj):
        lang = self._lang()
        return obj.type_label_en if lang == "en" and obj.type_label_en else obj.type_label_fa

    def get_category(self, obj):
        lang = self._lang()
        if lang == "en" and obj.category_label_en:
            return obj.category_label_en
        if obj.category_label_fa:
            return obj.category_label_fa
        return obj.category.name if obj.category else ""

    def get_range(self, obj):
        return float(obj.range_km) if obj.range_km is not None else None

    def get_category_slug(self, obj):
        return obj.category.slug if obj.category else ""

    def get_image(self, obj):
        if not obj.cover_image:
            return ""
        request = self.context.get("request")
        return request.build_absolute_uri(obj.cover_image.url) if request else obj.cover_image.url

    def get_features(self, obj):
        return [spec.value for spec in obj.specs.filter(is_public=True).order_by("sort_order", "id")[:3] if spec.value]

    def get_specs(self, obj):
        return [
            {"key": spec.key, "value": spec.value, "unit": spec.unit}
            for spec in obj.specs.filter(is_public=True).order_by("sort_order", "id")
        ]

    def get_status_label(self, obj):
        return obj.get_status_display()

    def get_year(self, obj):
        return obj.published_at.year if obj.published_at else None

    def get_description(self, obj):
        lang = self._lang()
        return obj.description_en if lang == "en" and obj.description_en else obj.description_fa
