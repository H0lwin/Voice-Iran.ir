import time

from django.utils.deprecation import MiddlewareMixin

from analytics.tracking import track_pageview
from core.observability import append_access_event


class AccessEventLoggingMiddleware(MiddlewareMixin):
    def process_request(self, request):
        request._access_started_at = time.time()

    def process_response(self, request, response):
        path = getattr(request, "get_full_path", lambda: "")()
        started = getattr(request, "_access_started_at", None)
        response_time_ms = int((time.time() - started) * 1000) if started else 0
        user = getattr(request, "user", None)
        ip_address = request.META.get("HTTP_X_FORWARDED_FOR", "").split(",")[0].strip() or request.META.get(
            "REMOTE_ADDR", ""
        )
        try:
            append_access_event(
                path=path,
                method=getattr(request, "method", ""),
                status_code=getattr(response, "status_code", 0),
                response_time_ms=response_time_ms,
                user_id=getattr(user, "id", None) if getattr(user, "is_authenticated", False) else None,
                username=getattr(user, "username", None) if getattr(user, "is_authenticated", False) else None,
                ip_address=ip_address,
            )
            if (
                str(getattr(request, "method", "")).upper() == "GET"
                and int(getattr(response, "status_code", 0)) < 400
                and path.startswith("/api/v1/")
            ):
                track_pageview(
                    path=path,
                    user_agent=request.META.get("HTTP_USER_AGENT", ""),
                    country=request.headers.get("CF-IPCountry", ""),
                )
        except Exception:
            pass
        return response
