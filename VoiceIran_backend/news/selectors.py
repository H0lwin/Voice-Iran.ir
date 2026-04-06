from django.db.models import QuerySet

from news.models import Post


def get_posts_queryset(public_only: bool = True) -> QuerySet[Post]:
    queryset = Post.objects.select_related("author").prefetch_related("categories", "tags")
    if public_only:
        queryset = queryset.filter(status=Post.Status.PUBLISHED)
    return queryset
