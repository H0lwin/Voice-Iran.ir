from rest_framework import filters as drf_filters
from rest_framework.viewsets import ReadOnlyModelViewSet

from api.filters import QueryParamSearchFilter
from api.pagination import StandardResultsSetPagination
from api.permissions import IsEditorOrReadOnly
from arsenal.selectors import get_weapons_queryset
from arsenal.serializers import WeaponSerializer

try:
    from arsenal.filters import WeaponFilterSet
except Exception:  # pragma: no cover
    WeaponFilterSet = None


class WeaponViewSet(ReadOnlyModelViewSet):
    serializer_class = WeaponSerializer
    permission_classes = [IsEditorOrReadOnly]
    pagination_class = StandardResultsSetPagination
    filterset_class = WeaponFilterSet
    filter_backends = [QueryParamSearchFilter, drf_filters.OrderingFilter]
    search_fields = ["name_fa", "name_en", "type_label_fa", "type_label_en", "slug"]
    ordering_fields = ["published_at", "range_km", "created_at"]
    ordering = ["-published_at", "-id"]

    def get_queryset(self):
        user = self.request.user
        public_only = not (user.is_authenticated and (user.is_staff or user.is_superuser))
        return get_weapons_queryset(public_only=public_only)
