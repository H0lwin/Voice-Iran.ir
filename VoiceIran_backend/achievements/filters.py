import django_filters

from achievements.models import Achievement


class AchievementFilterSet(django_filters.FilterSet):
    is_featured = django_filters.BooleanFilter(field_name="is_featured")
    target_type = django_filters.CharFilter(field_name="target_type", lookup_expr="exact")
    verification_status = django_filters.CharFilter(field_name="verification_status", lookup_expr="exact")
    slug = django_filters.CharFilter(field_name="slug", lookup_expr="exact")

    class Meta:
        model = Achievement
        fields = ["status", "is_featured", "target_type", "verification_status", "slug"]
