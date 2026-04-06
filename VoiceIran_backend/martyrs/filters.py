import django_filters

from martyrs.models import Martyr


class MartyrFilterSet(django_filters.FilterSet):
    is_featured = django_filters.BooleanFilter(field_name="is_featured")
    unit = django_filters.NumberFilter(field_name="unit_id")
    unit_slug = django_filters.CharFilter(field_name="unit__slug", lookup_expr="exact")
    slug = django_filters.CharFilter(field_name="slug", lookup_expr="exact")
    martyrdom_date_gte = django_filters.DateFilter(field_name="martyrdom_date", lookup_expr="gte")
    martyrdom_date_lte = django_filters.DateFilter(field_name="martyrdom_date", lookup_expr="lte")

    class Meta:
        model = Martyr
        fields = ["status", "is_featured", "unit", "unit_slug", "slug"]
