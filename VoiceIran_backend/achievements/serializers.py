from rest_framework import serializers

from achievements.models import Achievement
from api.i18n import resolve_language_code


class AchievementSerializer(serializers.ModelSerializer):
    title = serializers.SerializerMethodField()
    excerpt = serializers.SerializerMethodField()
    summary = serializers.SerializerMethodField()
    content = serializers.SerializerMethodField()
    region = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    martyr_name = serializers.SerializerMethodField()
    target_type_label = serializers.SerializerMethodField()
    verification_status_label = serializers.SerializerMethodField()

    class Meta:
        model = Achievement
        fields = (
            "id",
            "slug",
            "title",
            "excerpt",
            "summary",
            "content",
            "region",
            "image",
            "martyr",
            "martyr_name",
            "target_type",
            "target_type_label",
            "verification_status",
            "verification_status_label",
            "destroyed_targets_count",
            "strategic_gain_count",
            "is_featured",
            "published_at",
            "view_count",
        )

    def _lang(self):
        request = self.context.get("request")
        return resolve_language_code(request.query_params.get("lang") if request else None)

    def get_title(self, obj):
        lang = self._lang()
        return obj.title_en if lang == "en" and obj.title_en else obj.title_fa or obj.slug

    def get_excerpt(self, obj):
        lang = self._lang()
        return obj.excerpt_en if lang == "en" and obj.excerpt_en else obj.excerpt_fa

    def get_summary(self, obj):
        lang = self._lang()
        return obj.summary_en if lang == "en" and obj.summary_en else obj.summary_fa

    def get_content(self, obj):
        lang = self._lang()
        return obj.content_en if lang == "en" and obj.content_en else obj.content_fa

    def get_region(self, obj):
        lang = self._lang()
        return obj.region_en if lang == "en" and obj.region_en else obj.region_fa

    def get_image(self, obj):
        if not obj.cover_image:
            return ""
        request = self.context.get("request")
        return request.build_absolute_uri(obj.cover_image.url) if request else obj.cover_image.url

    def get_target_type_label(self, obj):
        if obj.target_type == Achievement.TargetType.DRONE:
            return "Drone" if self._lang() == "en" else "پهپاد"
        if obj.target_type == Achievement.TargetType.MISSILE:
            return "Missile" if self._lang() == "en" else "موشک"
        if obj.target_type == Achievement.TargetType.AIRCRAFT:
            return "Aircraft" if self._lang() == "en" else "هواپیما"
        if obj.target_type == Achievement.TargetType.SHIP:
            return "Ship" if self._lang() == "en" else "کشتی"
        return "Infrastructure" if self._lang() == "en" else "زیرساخت"

    def get_martyr_name(self, obj):
        if not obj.martyr_id:
            return ""
        lang = self._lang()
        if lang == "en" and obj.martyr.name_en:
            return obj.martyr.name_en
        return obj.martyr.name_fa or obj.martyr.slug

    def get_verification_status_label(self, obj):
        if obj.verification_status == Achievement.VerificationStatus.OFFICIAL:
            return "Official" if self._lang() == "en" else "رسمی"
        if obj.verification_status == Achievement.VerificationStatus.DOCUMENTED:
            return "Documented" if self._lang() == "en" else "مستند"
        return "Claimed" if self._lang() == "en" else "ادعایی"
