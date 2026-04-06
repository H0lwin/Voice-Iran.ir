from __future__ import annotations

import hashlib
import json
from datetime import date, datetime, timedelta
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from django.conf import settings
from django.utils import timezone

OBS_DIR = Path(settings.BASE_DIR) / "runtime_data" / "observability"
STREAM_ACCESS = "access"
STREAM_AUDIT = "audit"
STREAM_ADMIN_SESSION = "admin_session"
STREAM_SEARCH_QUERY = "search_query"

DAILY_AGG_FILE = OBS_DIR / "daily_aggregates.json"
CONTENT_METRICS_FILE = OBS_DIR / "content_metrics.json"


def _stream_path(stream: str) -> Path:
    OBS_DIR.mkdir(parents=True, exist_ok=True)
    return OBS_DIR / f"{stream}.jsonl"


def _safe_line_json(data: dict) -> str:
    return json.dumps(data, ensure_ascii=False, separators=(",", ":"))


def append_event(stream: str, payload: dict) -> None:
    event = {"ts": timezone.now().isoformat(), **payload}
    path = _stream_path(stream)
    with path.open("a", encoding="utf-8") as handle:
        handle.write(_safe_line_json(event))
        handle.write("\n")


def iter_events(stream: str):
    path = _stream_path(stream)
    if not path.exists():
        return
    with path.open("r", encoding="utf-8") as handle:
        for line in handle:
            raw = line.strip()
            if not raw:
                continue
            try:
                yield json.loads(raw)
            except json.JSONDecodeError:
                continue


def recent_events(stream: str, limit: int = 20) -> list[dict]:
    events = list(iter_events(stream) or [])
    events.sort(key=lambda item: item.get("ts", ""), reverse=True)
    return events[:limit]


def _parse_day(iso_ts: str) -> date | None:
    try:
        return datetime.fromisoformat(iso_ts).date()
    except Exception:
        return None


def _language_from_path(path: str) -> str:
    parsed = urlparse(path or "")
    lang_values = parse_qs(parsed.query).get("lang", [])
    if not lang_values:
        return "fa"
    return (lang_values[0] or "fa").strip().lower()


def _extract_content_ref(path: str) -> tuple[str, str] | None:
    # expects patterns like /api/v1/posts/123/
    base_path = urlparse(path).path
    segments = [seg for seg in base_path.split("/") if seg]
    if len(segments) < 4:
        return None
    if segments[0] != "api" or segments[1] != "v1":
        return None
    resource = segments[2]
    obj_id = segments[3]
    resource_map = {
        "posts": "post",
        "weapons": "weapon",
        "martyrs": "martyr",
        "documents": "document",
    }
    if resource not in resource_map:
        return None
    if not obj_id.isdigit():
        return None
    return resource_map[resource], obj_id


def append_access_event(
    *,
    path: str,
    method: str,
    status_code: int,
    response_time_ms: int,
    user_id: int | None,
    username: str | None,
    ip_address: str,
) -> None:
    ip_hash = hashlib.sha256((ip_address or "").encode("utf-8")).hexdigest()[:24]
    append_event(
        STREAM_ACCESS,
        {
            "path": path,
            "method": method,
            "status_code": status_code,
            "response_time_ms": response_time_ms,
            "user_id": user_id,
            "username": username or "",
            "ip_hash": ip_hash,
            "language": _language_from_path(path),
        },
    )


def append_audit_event(
    *,
    action: str,
    target_type: str,
    target_id: str,
    actor_id: int | None = None,
    actor_username: str | None = None,
    metadata: dict | None = None,
) -> None:
    append_event(
        STREAM_AUDIT,
        {
            "action": action,
            "target_type": target_type,
            "target_id": target_id,
            "actor_id": actor_id,
            "actor_username": actor_username or "",
            "metadata": metadata or {},
        },
    )


def append_admin_session_event(
    *,
    action: str,
    user_id: int | None,
    username: str | None,
    ip_address: str = "",
    user_agent: str = "",
    is_successful: bool = True,
) -> None:
    append_event(
        STREAM_ADMIN_SESSION,
        {
            "action": action,
            "user_id": user_id,
            "username": username or "",
            "ip_address": ip_address,
            "user_agent": user_agent[:500],
            "is_successful": is_successful,
        },
    )


def append_search_query_event(
    *,
    query: str,
    language: str,
    result_count: int,
    user_id: int | None,
    username: str | None,
    ip_address: str,
) -> None:
    ip_hash = hashlib.sha256((ip_address or "").encode("utf-8")).hexdigest()[:24]
    append_event(
        STREAM_SEARCH_QUERY,
        {
            "query": query[:255],
            "language": language,
            "result_count": int(result_count),
            "user_id": user_id,
            "username": username or "",
            "ip_hash": ip_hash,
        },
    )


def _empty_daily_row(day: date, language: str) -> dict:
    return {
        "date": day.isoformat(),
        "language": language,
        "total_views": 0,
        "unique_visitors": 0,
        "api_requests": 0,
        "errors": 0,
    }


def build_aggregates(days: int = 30) -> dict:
    start_day = timezone.now().date() - timedelta(days=max(1, days) - 1)
    daily: dict[tuple[str, str], dict] = {}
    daily_visitors: dict[tuple[str, str], set[str]] = {}
    content_metrics: dict[tuple[str, str, str], dict] = {}

    for event in iter_events(STREAM_ACCESS) or []:
        day = _parse_day(event.get("ts", ""))
        if not day or day < start_day:
            continue
        lang = event.get("language") or "fa"
        key = (day.isoformat(), lang)
        if key not in daily:
            daily[key] = _empty_daily_row(day, lang)
            daily_visitors[key] = set()

        row = daily[key]
        row["api_requests"] += 1
        status_code = int(event.get("status_code", 0) or 0)
        if status_code >= 500:
            row["errors"] += 1
        if status_code < 400 and str(event.get("method", "")).upper() == "GET":
            row["total_views"] += 1

        ip_hash = event.get("ip_hash")
        if ip_hash:
            daily_visitors[key].add(str(ip_hash))

        content_ref = _extract_content_ref(str(event.get("path", "")))
        if not content_ref:
            continue
        source_type, source_id = content_ref
        ckey = (day.isoformat(), source_type, source_id)
        if ckey not in content_metrics:
            content_metrics[ckey] = {
                "date": day.isoformat(),
                "source_type": source_type,
                "source_id": source_id,
                "views": 0,
                "downloads": 0,
                "shares": 0,
                "avg_read_time": 0.0,
                "_rt_sum": 0,
                "_rt_count": 0,
            }
        c_row = content_metrics[ckey]
        c_row["views"] += 1
        response_time_ms = int(event.get("response_time_ms", 0) or 0)
        c_row["_rt_sum"] += max(response_time_ms, 0)
        c_row["_rt_count"] += 1
        if "download" in str(event.get("path", "")).lower():
            c_row["downloads"] += 1

    daily_rows = []
    for key, row in daily.items():
        row["unique_visitors"] = len(daily_visitors.get(key, set()))
        daily_rows.append(row)
    daily_rows.sort(key=lambda item: (item["date"], item["language"]))

    content_rows = []
    for row in content_metrics.values():
        if row["_rt_count"] > 0:
            row["avg_read_time"] = round(row["_rt_sum"] / row["_rt_count"] / 1000, 2)
        row.pop("_rt_sum", None)
        row.pop("_rt_count", None)
        content_rows.append(row)
    content_rows.sort(key=lambda item: (item["date"], item["source_type"], item["source_id"]))

    OBS_DIR.mkdir(parents=True, exist_ok=True)
    DAILY_AGG_FILE.write_text(_safe_line_json({"rows": daily_rows}), encoding="utf-8")
    CONTENT_METRICS_FILE.write_text(_safe_line_json({"rows": content_rows}), encoding="utf-8")
    return {"daily_aggregates": daily_rows, "content_metrics": content_rows}


def read_daily_aggregates(limit: int = 30) -> list[dict]:
    if DAILY_AGG_FILE.exists():
        try:
            payload = json.loads(DAILY_AGG_FILE.read_text(encoding="utf-8"))
            rows = payload.get("rows", [])
            return rows[-limit:]
        except Exception:
            return []
    return []


def read_content_metrics(limit: int = 100) -> list[dict]:
    if CONTENT_METRICS_FILE.exists():
        try:
            payload = json.loads(CONTENT_METRICS_FILE.read_text(encoding="utf-8"))
            rows = payload.get("rows", [])
            return rows[-limit:]
        except Exception:
            return []
    return []
