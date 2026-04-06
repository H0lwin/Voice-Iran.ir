from rest_framework import filters as drf_filters
from rest_framework.viewsets import ReadOnlyModelViewSet

from achievements.selectors import get_achievements_queryset
from achievements.serializers import AchievementSerializer
from api.filters import QueryParamSearchFilter
from api.pagination import StandardResultsSetPagination
from api.permissions import IsEditorOrReadOnly

try:
    from achievements.filters import AchievementFilterSet
except Exception:  # pragma: no cover
    AchievementFilterSet = None


class AchievementViewSet(ReadOnlyModelViewSet):
    serializer_class = AchievementSerializer
    permission_classes = [IsEditorOrReadOnly]
    pagination_class = StandardResultsSetPagination
    filterset_class = AchievementFilterSet
    filter_backends = [QueryParamSearchFilter, drf_filters.OrderingFilter]
    search_fields = ["title_fa", "title_en", "excerpt_fa", "excerpt_en", "summary_fa", "summary_en", "slug"]
    ordering_fields = ["published_at", "created_at", "view_count", "destroyed_targets_count", "strategic_gain_count"]
    ordering = ["-published_at", "-id"]

    def get_queryset(self):
        user = self.request.user
        public_only = not (user.is_authenticated and (user.is_staff or user.is_superuser))
        return get_achievements_queryset(public_only=public_only)
