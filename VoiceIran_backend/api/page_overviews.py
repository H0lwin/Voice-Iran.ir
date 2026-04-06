from django.db.models import Count, Q
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from api.i18n import resolve_language_code
from arsenal.models import Weapon
from arsenal.serializers import WeaponSerializer
from documents.models import Document, DocumentTimelineEvent
from documents.serializers import DocumentSerializer
from martyrs.models import Martyr, MartyrUnit
from martyrs.serializers import MartyrSerializer
from news.models import NewsTrendingTerm, Post
from news.serializers import PostSerializer
from search_index.models import PopularSearchTerm


def _pick(lang: str, fa: str, en: str) -> str:
    return en if lang == "en" and en else fa


class NewsOverviewAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        lang = resolve_language_code(request.query_params.get("lang"))
        query = (request.query_params.get("q") or "").strip()
        category_slug = (request.query_params.get("category") or "").strip()
        queryset = Post.objects.filter(status=Post.Status.PUBLISHED).prefetch_related("categories", "tags")

        if query:
            queryset = queryset.filter(
                Q(title_fa__icontains=query)
                | Q(title_en__icontains=query)
                | Q(excerpt_fa__icontains=query)
                | Q(excerpt_en__icontains=query)
            )

        if category_slug and category_slug != "all":
            queryset = queryset.filter(categories__slug=category_slug)

        queryset = queryset.order_by("-published_at", "-id").distinct()
        featured_post = queryset.filter(is_featured=True).first()
        posts = queryset[:40]

        categories_qs = (
            queryset.values("categories__slug", "categories__name", "categories__name_en")
            .exclude(categories__slug__isnull=True)
            .annotate(count=Count("id"))
            .order_by("-count", "categories__name")
        )
        categories = [{"id": "all", "label": _pick(lang, "همه", "All"), "count": queryset.count()}]
        for row in categories_qs:
            categories.append(
                {
                    "id": row["categories__slug"],
                    "label": _pick(lang, row["categories__name"] or "", row["categories__name_en"] or ""),
                    "count": row["count"],
                }
            )

        trending_qs = PopularSearchTerm.objects.filter(
            is_active=True, term_type=PopularSearchTerm.TermType.NEWS
        ).order_by("-weight", "id")[:8]
        trending = [_pick(lang, term.label_fa, term.label_en) for term in trending_qs]
        if not trending:
            legacy_qs = NewsTrendingTerm.objects.filter(is_active=True).order_by("-weight", "id")[:8]
            trending = [_pick(lang, term.label_fa, term.label_en) for term in legacy_qs]
        if not trending:
            trending = [
                _pick(lang, tag["tags__name"], tag["tags__name_en"])
                for tag in queryset.values("tags__name", "tags__name_en").annotate(count=Count("id")).order_by("-count")[:8]
                if tag["tags__name"]
            ]

        return Response(
            {
                "filters": {"categories": categories},
                "trending_terms": trending,
                "featured": PostSerializer(featured_post, context={"request": request}).data if featured_post else None,
                "items": PostSerializer(posts, many=True, context={"request": request}).data,
            }
        )


class ArsenalOverviewAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        lang = resolve_language_code(request.query_params.get("lang"))
        category_slug = (request.query_params.get("category") or "").strip()
        queryset = Weapon.objects.filter(status=Weapon.Status.PUBLISHED).select_related("category").prefetch_related("specs")
        if category_slug and category_slug != "all":
            queryset = queryset.filter(category__slug=category_slug)

        queryset = queryset.order_by("-published_at", "-id").distinct()
        categories_qs = (
            Weapon.objects.filter(status=Weapon.Status.PUBLISHED)
            .values("category__slug", "category__name", "category__name_en")
            .exclude(category__slug__isnull=True)
            .annotate(count=Count("id"))
            .order_by("-count", "category__name")
        )
        categories = [{"id": "all", "label": _pick(lang, "همه", "All"), "count": queryset.count()}]
        for row in categories_qs:
            categories.append(
                {
                    "id": row["category__slug"],
                    "label": _pick(lang, row["category__name"] or "", row["category__name_en"] or ""),
                    "count": row["count"],
                }
            )

        total_count = queryset.count()
        operational_count = queryset.filter(status=Weapon.Status.PUBLISHED).count()
        max_range = queryset.exclude(range_km__isnull=True).order_by("-range_km").values_list("range_km", flat=True).first() or 0

        return Response(
            {
                "filters": {"categories": categories},
                "stats": {
                    "total": total_count,
                    "operational": operational_count,
                    "max_range": float(max_range) if max_range else 0,
                },
                "items": WeaponSerializer(queryset[:60], many=True, context={"request": request}).data,
            }
        )


class MartyrsOverviewAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        lang = resolve_language_code(request.query_params.get("lang"))
        unit_slug = (request.query_params.get("unit") or "").strip()
        queryset = Martyr.objects.filter(status=Martyr.Status.PUBLISHED).select_related("unit").prefetch_related("achievements")
        if unit_slug and unit_slug != "all":
            queryset = queryset.filter(unit__slug=unit_slug)
        queryset = queryset.order_by("-martyrdom_date", "-published_at", "-id").distinct()

        units = [{"id": "all", "label": _pick(lang, "همه", "All"), "count": queryset.count()}]
        units_qs = MartyrUnit.objects.filter(is_active=True).annotate(
            count=Count("martyrs", filter=Q(martyrs__status=Martyr.Status.PUBLISHED))
        )
        for unit in units_qs:
            units.append(
                {"id": unit.slug, "label": _pick(lang, unit.name, unit.name_en), "count": unit.count}
            )

        featured = queryset.filter(is_featured=True)[:12]
        others = queryset.exclude(id__in=[item.id for item in featured])[:80]
        return Response(
            {
                "filters": {"units": units},
                "featured": MartyrSerializer(featured, many=True, context={"request": request}).data,
                "items": MartyrSerializer(others, many=True, context={"request": request}).data,
            }
        )


class DocumentsOverviewAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        lang = resolve_language_code(request.query_params.get("lang"))
        type_code = (request.query_params.get("type") or "").strip()
        queryset = Document.objects.filter(status=Document.Status.PUBLISHED).select_related("document_type").prefetch_related("collections")
        if type_code and type_code != "all":
            queryset = queryset.filter(document_type__code=type_code)
        queryset = queryset.order_by("-published_at", "-id").distinct()

        doc_type_counts = (
            Document.objects.filter(status=Document.Status.PUBLISHED)
            .values("document_type__code", "document_type__name", "document_type__name_en")
            .annotate(count=Count("id"))
            .order_by("-count")
        )
        types = [{"id": "all", "label": _pick(lang, "همه", "All"), "count": queryset.count()}]
        for row in doc_type_counts:
            if not row["document_type__code"]:
                continue
            types.append(
                {
                    "id": row["document_type__code"],
                    "label": _pick(lang, row["document_type__name"] or "", row["document_type__name_en"] or ""),
                    "count": row["count"],
                }
            )

        featured_docs = queryset.filter(is_featured=True)[:12]
        regular_docs = queryset.exclude(id__in=[item.id for item in featured_docs])[:120]
        timeline = [
            {
                "year": event.year,
                "title": _pick(lang, event.title_fa, event.title_en),
                "description": _pick(lang, event.description_fa, event.description_en),
            }
            for event in DocumentTimelineEvent.objects.filter(is_active=True).order_by("-year", "sort_order", "id")[:20]
        ]

        return Response(
            {
                "filters": {"types": types},
                "featured": DocumentSerializer(featured_docs, many=True, context={"request": request}).data,
                "items": DocumentSerializer(regular_docs, many=True, context={"request": request}).data,
                "timeline": timeline,
            }
        )


class SearchMetaAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        lang = resolve_language_code(request.query_params.get("lang"))
        terms = PopularSearchTerm.objects.filter(
            is_active=True, term_type=PopularSearchTerm.TermType.SEARCH
        ).order_by("-weight", "id")[:20]
        popular_terms = [_pick(lang, term.label_fa, term.label_en) for term in terms]
        if not popular_terms:
            terms = PopularSearchTerm.objects.filter(
                is_active=True, term_type=PopularSearchTerm.TermType.NEWS
            ).order_by("-weight", "id")[:20]
            popular_terms = [_pick(lang, term.label_fa, term.label_en) for term in terms]
        if not popular_terms:
            popular_terms = [
                _pick(lang, term.label_fa, term.label_en)
                for term in NewsTrendingTerm.objects.filter(is_active=True).order_by("-weight", "id")[:20]
            ]
        return Response({"popular_terms": popular_terms})
