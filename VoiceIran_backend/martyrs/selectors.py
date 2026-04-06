from django.db.models import QuerySet

from martyrs.models import Martyr


def get_martyrs_queryset(public_only: bool = True) -> QuerySet[Martyr]:
    queryset = Martyr.objects.select_related("unit").prefetch_related("achievements")
    if public_only:
        queryset = queryset.filter(status=Martyr.Status.PUBLISHED)
    return queryset
