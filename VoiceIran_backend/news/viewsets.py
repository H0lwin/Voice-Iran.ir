from rest_framework import filters as drf_filters
from rest_framework.viewsets import ReadOnlyModelViewSet

from api.filters import QueryParamSearchFilter
from api.pagination import StandardResultsSetPagination
from api.permissions import IsEditorOrReadOnly
from news.selectors import get_posts_queryset
from news.serializers import PostSerializer

try:
    from news.filters import PostFilterSet
except Exception:  # pragma: no cover
    PostFilterSet = None


class PostViewSet(ReadOnlyModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [IsEditorOrReadOnly]
    pagination_class = StandardResultsSetPagination
    filterset_class = PostFilterSet
    filter_backends = [QueryParamSearchFilter, drf_filters.OrderingFilter]
    search_fields = ["title_fa", "title_en", "excerpt_fa", "excerpt_en", "summary_fa", "summary_en", "slug"]
    ordering_fields = ["published_at", "created_at", "view_count"]
    ordering = ["-published_at", "-id"]

    def get_queryset(self):
        user = self.request.user
        public_only = not (user.is_authenticated and (user.is_staff or user.is_superuser))
        return get_posts_queryset(public_only=public_only)
