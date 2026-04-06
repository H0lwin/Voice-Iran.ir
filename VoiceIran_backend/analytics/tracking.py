from __future__ import annotations

from urllib.parse import parse_qs, urlparse

from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.db.models import F

from analytics.models import PageView
from documents.models import Document
from localization.models import Language
from martyrs.models import Martyr
from news.models import Post
from arsenal.models import Weapon


def _resolve_content(path: str):
    parsed = urlparse(path)
    parts = [p for p in parsed.path.split("/") if p]
    if len(parts) < 4:
        return None, None
    if parts[0] != "api" or parts[1] != "v1":
        return None, None
    resource = parts[2]
    obj_id = parts[3]
    if not obj_id.isdigit():
        return None, None

    model_map = {"posts": Post, "weapons": Weapon, "martyrs": Martyr, "documents": Document}
    model = model_map.get(resource)
    if not model:
        return None, None
    return model, int(obj_id)


def _detect_device(user_agent: str) -> str:
    ua = (user_agent or "").lower()
    if "mobile" in ua or "android" in ua or "iphone" in ua:
        return "mobile"
    if "ipad" in ua or "tablet" in ua:
        return "tablet"
    return "desktop"


def track_pageview(path: str, user_agent: str = "", country: str = "") -> None:
    model, object_id = _resolve_content(path)
    if not model:
        return
    if not model.objects.filter(pk=object_id).exists():
        return

    parsed = urlparse(path)
    query = parse_qs(parsed.query)
    lang = (query.get("lang", ["fa"])[0] or "fa").strip().lower()
    utm_source = (query.get("utm_source", [""])[0] or "").strip()
    utm_medium = (query.get("utm_medium", [""])[0] or "").strip()
    utm_campaign = (query.get("utm_campaign", [""])[0] or "").strip()

    # Traffic source is tracked as raw UTM fields directly on PageView.source.
    source = utm_source
    if utm_medium:
        source = f"{source}:{utm_medium}" if source else utm_medium
    if utm_campaign:
        source = f"{source}:{utm_campaign}" if source else utm_campaign

    # Lightweight mode: keep only aggregate counter on source model.
    if hasattr(model, "view_count"):
        model.objects.filter(pk=object_id).update(view_count=F("view_count") + 1)

    # Optional detailed analytics row.
    if not getattr(settings, "ANALYTICS_STORE_PAGEVIEWS", True):
        return

    ct = ContentType.objects.get_for_model(model)
    language = Language.objects.filter(code=lang).first() if lang in {"fa", "en"} else None
    PageView.objects.create(
        content_type=ct,
        object_id=object_id,
        language=language,
        source=source,
        device=_detect_device(user_agent),
        country=country,
    )
