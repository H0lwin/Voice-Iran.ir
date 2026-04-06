from django.db.models import Q
from rest_framework.response import Response
from rest_framework.views import APIView

from api.i18n import resolve_language_code
from core.observability import append_search_query_event
from documents.models import Document
from martyrs.models import Martyr
from news.models import Post
from arsenal.models import Weapon


class UnifiedSearchAPIView(APIView):
    permission_classes = []

    def get(self, request, *args, **kwargs):
        query = request.query_params.get("q", "").strip()
        lang = resolve_language_code(request.query_params.get("lang"))

        if not query:
            return Response({"count": 0, "results": []})

        limit = int(request.query_params.get("limit", 10))
        limit = max(1, min(limit, 50))

        post_qs = (
            Post.objects.filter(status=Post.Status.PUBLISHED)
            .filter(
                Q(title_fa__icontains=query)
                | Q(title_en__icontains=query)
                | Q(excerpt_fa__icontains=query)
                | Q(excerpt_en__icontains=query)
            )
            .distinct()[:limit]
        )
        weapon_qs = (
            Weapon.objects.filter(status=Weapon.Status.PUBLISHED)
            .filter(
                Q(name_fa__icontains=query)
                | Q(name_en__icontains=query)
                | Q(description_fa__icontains=query)
                | Q(description_en__icontains=query)
            )
            .distinct()[:limit]
        )
        martyr_qs = (
            Martyr.objects.filter(status=Martyr.Status.PUBLISHED)
            .filter(
                Q(name_fa__icontains=query)
                | Q(name_en__icontains=query)
                | Q(title_fa__icontains=query)
                | Q(title_en__icontains=query)
            )
            .distinct()[:limit]
        )
        document_qs = (
            Document.objects.filter(status=Document.Status.PUBLISHED)
            .filter(
                Q(title_fa__icontains=query)
                | Q(title_en__icontains=query)
                | Q(description_fa__icontains=query)
                | Q(description_en__icontains=query)
            )
            .distinct()[:limit]
        )

        results = []

        for item in post_qs:
            results.append(
                {
                    "type": "posts",
                    "id": item.id,
                    "title": item.title_en if lang == "en" and item.title_en else item.title_fa or item.slug,
                    "category": "news",
                }
            )

        for item in weapon_qs:
            results.append(
                {
                    "type": "weapons",
                    "id": item.id,
                    "title": item.name_en if lang == "en" and item.name_en else item.name_fa or item.slug,
                    "category": item.category.name if item.category else "weapon",
                }
            )

        for item in martyr_qs:
            results.append(
                {
                    "type": "martyrs",
                    "id": item.id,
                    "title": item.name_en if lang == "en" and item.name_en else item.name_fa or item.slug,
                    "category": item.title_en if lang == "en" and item.title_en else item.title_fa or "martyr",
                }
            )

        for item in document_qs:
            results.append(
                {
                    "type": "documents",
                    "id": item.id,
                    "title": item.title_en if lang == "en" and item.title_en else item.title_fa or item.slug,
                    "category": item.document_type.code if item.document_type else "document",
                }
            )

        user = request.user if getattr(request, "user", None) and request.user.is_authenticated else None
        ip_address = request.META.get("HTTP_X_FORWARDED_FOR", "").split(",")[0].strip() or request.META.get(
            "REMOTE_ADDR", ""
        )
        append_search_query_event(
            query=query,
            language=lang,
            result_count=len(results),
            user_id=user.id if user else None,
            username=user.username if user else "",
            ip_address=ip_address,
        )
        return Response({"count": len(results), "results": results[: limit * 4]})
