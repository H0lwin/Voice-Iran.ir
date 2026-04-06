from rest_framework import filters as drf_filters
from rest_framework.viewsets import ReadOnlyModelViewSet

from api.filters import QueryParamSearchFilter
from api.pagination import StandardResultsSetPagination
from api.permissions import IsEditorOrReadOnly
from documents.selectors import get_documents_queryset
from documents.serializers import DocumentSerializer

try:
    from documents.filters import DocumentFilterSet
except Exception:  # pragma: no cover
    DocumentFilterSet = None


class DocumentViewSet(ReadOnlyModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [IsEditorOrReadOnly]
    pagination_class = StandardResultsSetPagination
    filterset_class = DocumentFilterSet
    filter_backends = [QueryParamSearchFilter, drf_filters.OrderingFilter]
    search_fields = ["title_fa", "title_en", "description_fa", "description_en", "slug"]
    ordering_fields = ["published_at", "view_count", "download_count", "created_at"]
    ordering = ["-published_at", "-id"]

    def get_queryset(self):
        user = self.request.user
        public_only = not (user.is_authenticated and (user.is_staff or user.is_superuser))
        return get_documents_queryset(public_only=public_only)
