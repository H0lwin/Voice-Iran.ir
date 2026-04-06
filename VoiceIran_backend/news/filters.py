import django_filters

from news.models import Post


class PostFilterSet(django_filters.FilterSet):
    published_at_gte = django_filters.IsoDateTimeFilter(field_name="published_at", lookup_expr="gte")
    published_at_lte = django_filters.IsoDateTimeFilter(field_name="published_at", lookup_expr="lte")
    is_featured = django_filters.BooleanFilter(field_name="is_featured")
    is_live = django_filters.BooleanFilter(field_name="is_live")
    category = django_filters.CharFilter(field_name="categories__slug", lookup_expr="exact")
    slug = django_filters.CharFilter(field_name="slug", lookup_expr="exact")

    class Meta:
        model = Post
        fields = ["is_featured", "is_live", "status", "category", "slug"]
