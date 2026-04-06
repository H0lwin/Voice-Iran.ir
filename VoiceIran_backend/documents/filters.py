import django_filters

from documents.models import Document


class DocumentFilterSet(django_filters.FilterSet):
    is_featured = django_filters.BooleanFilter(field_name="is_featured")
    document_type = django_filters.NumberFilter(field_name="document_type_id")
    type_code = django_filters.CharFilter(field_name="document_type__code", lookup_expr="exact")
    slug = django_filters.CharFilter(field_name="slug", lookup_expr="exact")
    published_at_gte = django_filters.IsoDateTimeFilter(field_name="published_at", lookup_expr="gte")
    published_at_lte = django_filters.IsoDateTimeFilter(field_name="published_at", lookup_expr="lte")

    class Meta:
        model = Document
        fields = ["status", "is_featured", "document_type", "type_code", "slug"]
