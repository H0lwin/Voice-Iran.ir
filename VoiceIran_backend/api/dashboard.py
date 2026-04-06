from __future__ import annotations

from collections import Counter
from datetime import timedelta

from django.db.models import Count
from django.utils import timezone
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from core.observability import read_content_metrics, read_daily_aggregates, recent_events
from documents.models import (
    Document,
    DocumentCollection,
    DocumentFile,
    DocumentType,
)
from martyrs.models import Martyr, MartyrAchievement, MartyrUnit
from news.models import Post
from taxonomy.models import Term


def _status_breakdown(model):
    counts = model.objects.values("status").annotate(total=Count("id"))
    result = {"draft": 0, "review": 0, "published": 0, "archived": 0}
    for row in counts:
        status = row["status"]
        if status in result:
            result[status] = row["total"]
    return result


class AdminDashboardAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        now = timezone.now()
        since = now - timedelta(days=6)

        section_counts = [
            {
                "section": "news",
                "label": "اخبار",
                "total": Post.objects.count(),
            },
            {
                "section": "martyrs",
                "label": "شهدا",
                "total": Martyr.objects.count() + MartyrAchievement.objects.count() + MartyrUnit.objects.count(),
            },
            {
                "section": "documents",
                "label": "مستندات",
                "total": Document.objects.count()
                + DocumentFile.objects.count()
                + DocumentType.objects.count()
                + DocumentCollection.objects.count(),
            },
            {
                "section": "taxonomy",
                "label": "طبقه بندی",
                "total": Term.objects.count(),
            },
        ]

        logs = recent_events("audit", limit=40)
        activities = [
            {
                "id": str(index),
                "actor": item.get("actor_username") or "سیستم",
                "action": item.get("action") or "update",
                "model": item.get("target_type") or "unknown",
                "record_label": item.get("target_id") or "-",
                "timestamp": item.get("ts") or now.isoformat(),
            }
            for index, item in enumerate(logs, start=1)
        ]

        trend_map: dict[str, int] = {}
        aggregate_rows = read_daily_aggregates(limit=7)
        if aggregate_rows:
            for row in aggregate_rows:
                day = str(row.get("date", ""))[5:10]
                trend_map[day] = trend_map.get(day, 0) + int(row.get("api_requests", 0) or 0)
        else:
            for item in logs:
                ts = item.get("ts")
                if not ts:
                    continue
                day = ts[5:10]
                trend_map[day] = trend_map.get(day, 0) + 1
        activity_trend = []
        for offset in range(7):
            day = (since + timedelta(days=offset)).date().isoformat()
            key = day[5:]
            activity_trend.append({"day": key, "count": trend_map.get(key, 0)})

        model_frequency = Counter(item["model"] for item in activities)
        top_models = [{"model": model, "count": count} for model, count in model_frequency.most_common(6)]

        payload = {
            "generated_at": now.isoformat(),
            "totals": {
                "posts": Post.objects.count(),
                "martyrs": Martyr.objects.count(),
                "documents": Document.objects.count(),
            },
            "status_breakdown": {
                "posts": _status_breakdown(Post),
                "martyrs": _status_breakdown(Martyr),
                "documents": _status_breakdown(Document),
            },
            "section_counts": section_counts,
            "activities": activities,
            "activity_trend": activity_trend,
            "top_activity_models": top_models,
            "content_metrics": read_content_metrics(limit=20),
            "daily_aggregates": aggregate_rows,
        }
        return Response(payload)
