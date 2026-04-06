from django.http import JsonResponse
from django.utils.timezone import now


def api_root(request):
    return JsonResponse(
        {
            "name": "VoiceIran API",
            "version": "v1",
            "status": "ok",
            "timestamp": now().isoformat(),
            "endpoints": {
                "health": "/api/v1/health/",
                "posts": "/api/v1/posts/",
                "achievements": "/api/v1/achievements/",
                "weapons": "/api/v1/weapons/",
                "martyrs": "/api/v1/martyrs/",
                "documents": "/api/v1/documents/",
                "homepage": "/api/v1/homepage/?lang=fa",
                "search": "/api/v1/search/?q=...&lang=fa",
                "docs": "/api/v1/docs/",
                "schema": "/api/v1/schema/",
                "token": "/api/v1/auth/token/",
                "token_refresh": "/api/v1/auth/token/refresh/",
            },
        }
    )


def health_check(request):
    return JsonResponse(
        {
            "status": "ok",
            "service": "voiceiran-backend",
            "timestamp": now().isoformat(),
        }
    )
