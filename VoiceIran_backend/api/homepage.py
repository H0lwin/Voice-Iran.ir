from datetime import timedelta

from django.utils import timezone
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from api.i18n import resolve_language_code
from achievements.selectors import get_achievements_queryset
from achievements.serializers import AchievementSerializer
from arsenal.selectors import get_weapons_queryset
from arsenal.serializers import WeaponSerializer
from core.models import HomePageContent, LiveStat
from documents.selectors import get_documents_queryset
from documents.serializers import DocumentSerializer
from martyrs.selectors import get_martyrs_queryset
from martyrs.serializers import MartyrSerializer
from news.selectors import get_posts_queryset
from news.serializers import PostSerializer


def _pick_lang_text(lang: str, fa_value: str, en_value: str) -> str:
    if lang == "en" and en_value:
        return en_value
    return fa_value or en_value or ""


class HomePageAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        lang = resolve_language_code(request.query_params.get("lang"))
        content = HomePageContent.objects.filter(is_active=True).order_by("-updated_at", "-id").first()
        if content is None:
            content = HomePageContent()

        public_only = not (request.user.is_authenticated and request.user.is_staff)
        posts_qs = get_posts_queryset(public_only=public_only).order_by("-published_at", "-id")
        weapons_qs = get_weapons_queryset(public_only=public_only).order_by("-published_at", "-id")
        achievements_qs = get_achievements_queryset(public_only=public_only).order_by("-published_at", "-id")
        documents_qs = get_documents_queryset(public_only=public_only).order_by("-published_at", "-id")
        martyrs_qs = get_martyrs_queryset(public_only=public_only).order_by("-published_at", "-id")

        posts = posts_qs[:6]
        weapons = weapons_qs[:4]
        achievements = achievements_qs[:4]
        documents = documents_qs[:4]
        martyrs = martyrs_qs[:8]

        featured_weapon = weapons_qs.filter(is_featured=True).first() or weapons_qs.first()
        feature_chips = []
        if featured_weapon:
            feature_chips = [
                spec.value
                for spec in featured_weapon.specs.filter(is_public=True).order_by("sort_order", "id")[:3]
                if spec.value
            ]
            if not feature_chips:
                type_label = featured_weapon.type_label_en if lang == "en" else featured_weapon.type_label_fa
                category_label = featured_weapon.category_label_en if lang == "en" else featured_weapon.category_label_fa
                range_label = (
                    f"{featured_weapon.range_km:g} km" if featured_weapon.range_km is not None and lang == "en" else ""
                )
                if featured_weapon.range_km is not None and lang != "en":
                    range_label = f"برد {featured_weapon.range_km:g} کیلومتر"
                feature_chips = [item for item in [type_label, category_label, range_label] if item][:3]

        quick_access_descriptions = {
            "fa": {
                "news": "خبر جدید",
                "arsenal": "سامانه دفاعی",
                "martyrs": "شهید والامقام",
                "documents": "سند و مستند",
            },
            "en": {
                "news": "new updates",
                "arsenal": "defense systems",
                "martyrs": "martyr profiles",
                "documents": "files & archive",
            },
        }
        desc = quick_access_descriptions["en" if lang == "en" else "fa"]
        news_count = posts_qs.count()
        weapons_count = weapons_qs.count()
        martyrs_count = martyrs_qs.count()
        documents_count = documents_qs.count()
        achievements_count = achievements_qs.count()

        quick_access_items = [
            {"key": "news", "href": "/news", "label": _pick_lang_text(lang, "اخبار", "News"), "count": news_count, "description": desc["news"]},
            {
                "key": "arsenal",
                "href": "/arsenal",
                "label": _pick_lang_text(lang, "تسلیحات", "Arsenal"),
                "count": weapons_count,
                "description": desc["arsenal"],
            },
            {
                "key": "martyrs",
                "href": "/martyrs",
                "label": _pick_lang_text(lang, "شهدا", "Martyrs"),
                "count": martyrs_count,
                "description": desc["martyrs"],
            },
            {
                "key": "documents",
                "href": "/documents",
                "label": _pick_lang_text(lang, "مستندات", "Documents"),
                "count": documents_count,
                "description": desc["documents"],
            },
        ]

        latest_news_items = []
        for index, post in enumerate(posts[:6]):
            latest_news_items.append(
                {
                    **PostSerializer(post, context={"request": request}).data,
                    "is_live": bool(post.published_at and post.published_at >= timezone.now() - timedelta(hours=2)) or index == 0,
                    "category": (
                        (post.categories.first().name_en if lang == "en" else post.categories.first().name)
                        if post.categories.exists()
                        else _pick_lang_text(lang, "خبر", "News")
                    ),
                }
            )

        featured_weapon_item = None
        if featured_weapon:
            featured_weapon_item = {
                **WeaponSerializer(featured_weapon, context={"request": request}).data,
                "features": feature_chips,
            }

        martyr_items = MartyrSerializer(martyrs, many=True, context={"request": request}).data
        achievement_items = AchievementSerializer(achievements, many=True, context={"request": request}).data
        featured_docs_items = DocumentSerializer(documents[:3], many=True, context={"request": request}).data

        live_stats_items = [
            {
                "key": item.key,
                "label": _pick_lang_text(lang, item.label_fa, item.label_en),
                "value": item.value,
                "icon_key": item.icon_key,
            }
            for item in LiveStat.objects.filter(is_active=True).order_by("sort_order", "id")
        ]
        if not live_stats_items:
            live_stats_items = [
                {
                    "key": "operations",
                    "label": _pick_lang_text(lang, content.operations_label_fa, content.operations_label_en),
                    "value": content.operations_value,
                    "icon_key": "operations",
                },
                {
                    "key": "intercepted",
                    "label": _pick_lang_text(lang, content.intercepted_label_fa, content.intercepted_label_en),
                    "value": content.intercepted_value,
                    "icon_key": "intercepted",
                },
                {
                    "key": "drills",
                    "label": _pick_lang_text(lang, content.drills_label_fa, content.drills_label_en),
                    "value": content.drills_value,
                    "icon_key": "drills",
                },
            ]

        return Response(
            {
                "hero": {
                    "live_badge": _pick_lang_text(lang, content.hero_live_badge_fa, content.hero_live_badge_en),
                    "title": _pick_lang_text(lang, content.hero_title_fa, content.hero_title_en),
                    "description": _pick_lang_text(
                        lang,
                        content.hero_description_fa,
                        content.hero_description_en,
                    ),
                    "primary_action_label": _pick_lang_text(
                        lang, content.hero_primary_action_fa, content.hero_primary_action_en
                    ),
                    "secondary_action_label": _pick_lang_text(
                        lang, content.hero_secondary_action_fa, content.hero_secondary_action_en
                    ),
                    "background_image": content.hero_background_image,
                },
                "quick_access": {
                    "items": quick_access_items,
                },
                "live_stats": {
                    "title": _pick_lang_text(lang, content.live_stats_title_fa, content.live_stats_title_en),
                    "items": live_stats_items,
                },
                "sections": {
                    "latest_news": {
                        "title": _pick_lang_text(lang, content.latest_news_title_fa, content.latest_news_title_en),
                        "view_all_label": _pick_lang_text(lang, content.view_all_label_fa, content.view_all_label_en),
                        "items": latest_news_items,
                    },
                    "featured_weapons": {
                        "title": _pick_lang_text(
                            lang,
                            content.featured_weapons_title_fa,
                            content.featured_weapons_title_en,
                        ),
                        "view_all_label": _pick_lang_text(lang, content.view_all_label_fa, content.view_all_label_en),
                        "item": featured_weapon_item,
                    },
                    "latest_achievements": {
                        "title": _pick_lang_text(lang, "آخرین دستاوردها", "Latest Achievements"),
                        "view_all_label": _pick_lang_text(lang, content.view_all_label_fa, content.view_all_label_en),
                        "items": achievement_items,
                    },
                    "featured_documents": {
                        "title": _pick_lang_text(
                            lang,
                            content.featured_documents_title_fa,
                            content.featured_documents_title_en,
                        ),
                        "view_all_label": _pick_lang_text(lang, content.view_all_label_fa, content.view_all_label_en),
                        "items": featured_docs_items,
                    },
                    "featured_martyrs": {
                        "title": _pick_lang_text(
                            lang,
                            content.featured_martyrs_title_fa,
                            content.featured_martyrs_title_en,
                        ),
                        "view_all_label": _pick_lang_text(lang, content.view_all_label_fa, content.view_all_label_en),
                        "quote": _pick_lang_text(lang, content.martyrs_quote_fa, content.martyrs_quote_en),
                        "items": martyr_items,
                    },
                },
                "common": {
                    "empty_label": _pick_lang_text(lang, content.empty_label_fa, content.empty_label_en),
                },
                "counts": {
                    "posts": news_count,
                    "achievements": achievements_count,
                    "weapons": weapons_count,
                    "martyrs": martyrs_count,
                    "documents": documents_count,
                },
            }
        )
