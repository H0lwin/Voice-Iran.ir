from rest_framework import filters as drf_filters
from rest_framework.viewsets import ReadOnlyModelViewSet

from api.filters import QueryParamSearchFilter
from api.pagination import StandardResultsSetPagination
from api.permissions import IsEditorOrReadOnly
from martyrs.selectors import get_martyrs_queryset
from martyrs.serializers import MartyrSerializer

try:
    from martyrs.filters import MartyrFilterSet
except Exception:  # pragma: no cover
    MartyrFilterSet = None


class MartyrViewSet(ReadOnlyModelViewSet):
    serializer_class = MartyrSerializer
    permission_classes = [IsEditorOrReadOnly]
    pagination_class = StandardResultsSetPagination
    filterset_class = MartyrFilterSet
    filter_backends = [QueryParamSearchFilter, drf_filters.OrderingFilter]
    search_fields = ["name_fa", "name_en", "title_fa", "title_en", "martyrdom_location", "slug"]
    ordering_fields = ["published_at", "martyrdom_date", "created_at"]
    ordering = ["-published_at", "-id"]

    def get_queryset(self):
        user = self.request.user
        public_only = not (user.is_authenticated and (user.is_staff or user.is_superuser))
        return get_martyrs_queryset(public_only=public_only)
