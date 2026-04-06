import django_filters

from arsenal.models import Weapon


class WeaponFilterSet(django_filters.FilterSet):
    range_km_gte = django_filters.NumberFilter(field_name="range_km", lookup_expr="gte")
    range_km_lte = django_filters.NumberFilter(field_name="range_km", lookup_expr="lte")
    is_featured = django_filters.BooleanFilter(field_name="is_featured")
    category = django_filters.NumberFilter(field_name="category_id")
    slug = django_filters.CharFilter(field_name="slug", lookup_expr="exact")
    category_slug = django_filters.CharFilter(field_name="category__slug", lookup_expr="exact")

    class Meta:
        model = Weapon
        fields = ["status", "is_featured", "category", "slug", "category_slug"]
