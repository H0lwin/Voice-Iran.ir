from django.db.models import QuerySet

from arsenal.models import Weapon


def get_weapons_queryset(public_only: bool = True) -> QuerySet[Weapon]:
    queryset = Weapon.objects.select_related("category").prefetch_related("specs")
    if public_only:
        queryset = queryset.filter(status=Weapon.Status.PUBLISHED)
    return queryset
