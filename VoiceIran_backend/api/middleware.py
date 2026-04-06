import time

from django.utils.deprecation import MiddlewareMixin

from core.observability import append_event


class ApiRequestLoggingMiddleware(MiddlewareMixin):
    def process_request(self, request):
        request._api_started_at = time.time()

    def process_response(self, request, response):
        path = getattr(request, "path", "")
        if not path.startswith("/api/"):
            return response

        started = getattr(request, "_api_started_at", None)
        latency_ms = int((time.time() - started) * 1000) if started else 0

        try:
            user = request.user if getattr(request, "user", None) and request.user.is_authenticated else None
            append_event(
                "api_request",
                {
                    "user_id": user.id if user else None,
                    "username": user.username if user else "",
                    "path": path,
                    "method": getattr(request, "method", ""),
                    "status_code": getattr(response, "status_code", 0),
                    "latency_ms": latency_ms,
                    "request_id": request.headers.get("X-Request-Id", ""),
                },
            )
        except Exception:
            pass

        return response
