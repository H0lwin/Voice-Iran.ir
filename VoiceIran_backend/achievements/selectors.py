from django.db.models import QuerySet

from achievements.models import Achievement


def get_achievements_queryset(public_only: bool = True) -> QuerySet[Achievement]:
    queryset = Achievement.objects.all()
    if public_only:
        queryset = queryset.filter(status=Achievement.Status.PUBLISHED)
    return queryset
