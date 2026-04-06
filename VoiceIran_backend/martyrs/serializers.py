from rest_framework import serializers

from api.i18n import resolve_language_code
from martyrs.models import Martyr


class MartyrSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    title = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    unit_label = serializers.SerializerMethodField()
    unit_slug = serializers.SerializerMethodField()
    biography = serializers.SerializerMethodField()
    short_bio = serializers.SerializerMethodField()
    achievements = serializers.SerializerMethodField()

    class Meta:
        model = Martyr
        fields = (
            "id",
            "slug",
            "name",
            "title",
            "martyrdom_date",
            "birth_date",
            "martyrdom_location",
            "image",
            "unit_label",
            "unit_slug",
            "biography",
            "short_bio",
            "achievements",
            "published_at",
            "is_featured",
        )

    def _lang(self):
        request = self.context.get("request")
        return resolve_language_code(request.query_params.get("lang") if request else None)

    def get_name(self, obj):
        lang = self._lang()
        return obj.name_en if lang == "en" and obj.name_en else obj.name_fa or obj.slug

    def get_title(self, obj):
        lang = self._lang()
        return obj.title_en if lang == "en" and obj.title_en else obj.title_fa

    def get_image(self, obj):
        if not obj.profile_image:
            return ""
        request = self.context.get("request")
        return request.build_absolute_uri(obj.profile_image.url) if request else obj.profile_image.url

    def get_unit_label(self, obj):
        if not obj.unit:
            return ""
        lang = self._lang()
        return obj.unit.name_en if lang == "en" and obj.unit.name_en else obj.unit.name

    def get_unit_slug(self, obj):
        return obj.unit.slug if obj.unit else ""

    def get_biography(self, obj):
        lang = self._lang()
        return obj.biography_en if lang == "en" and obj.biography_en else obj.biography_fa

    def get_short_bio(self, obj):
        lang = self._lang()
        return obj.short_bio_en if lang == "en" and obj.short_bio_en else obj.short_bio_fa

    def get_achievements(self, obj):
        lang = self._lang()
        values = []
        for achievement in obj.achievements.all():
            text = achievement.title_en if lang == "en" and achievement.title_en else achievement.title
            if text:
                values.append(text)
        return values
