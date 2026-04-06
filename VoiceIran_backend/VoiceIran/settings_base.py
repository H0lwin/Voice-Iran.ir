import os
from datetime import timedelta
from importlib.util import find_spec
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


def _module_available(module_name: str) -> bool:
    return find_spec(module_name) is not None


def _env_bool(name: str, default: bool = False) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-insecure-change-me")
DEBUG = _env_bool("DJANGO_DEBUG", default=False)
ALLOWED_HOSTS = [h.strip() for h in os.getenv("DJANGO_ALLOWED_HOSTS", "").split(",") if h.strip()]

THIRD_PARTY_APPS = []
if _module_available("rest_framework"):
    THIRD_PARTY_APPS.append("rest_framework")
if _module_available("corsheaders"):
    THIRD_PARTY_APPS.append("corsheaders")
if _module_available("django_filters"):
    THIRD_PARTY_APPS.append("django_filters")
if _module_available("drf_spectacular"):
    THIRD_PARTY_APPS.append("drf_spectacular")
if _module_available("simple_history"):
    THIRD_PARTY_APPS.append("simple_history")
if _module_available("django_celery_beat"):
    THIRD_PARTY_APPS.append("django_celery_beat")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.sitemaps",
    "django.contrib.staticfiles",
    *THIRD_PARTY_APPS,
    "core",
    "accounts",
    "localization",
    "news",
    "arsenal",
    "martyrs",
    "documents",
    "achievements",
    "taxonomy",
    "seo",
    "search_index",
    "publishing",
    "api",
    "analytics",
    "notifications",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    *(["corsheaders.middleware.CorsMiddleware"] if _module_available("corsheaders") else []),
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    *(["simple_history.middleware.HistoryRequestMiddleware"] if _module_available("simple_history") else []),
    "core.middleware.AccessEventLoggingMiddleware",
    "api.middleware.ApiRequestLoggingMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "VoiceIran.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "VoiceIran.wsgi.application"
ASGI_APPLICATION = "VoiceIran.asgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / os.getenv("SQLITE_DB_NAME", "db.sqlite3"),
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "fa"
LANGUAGES = [("fa", "Persian"), ("en", "English")]
TIME_ZONE = "Asia/Tehran"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
AUTH_USER_MODEL = "accounts.User"

API_PREFIX = "api/v1"

_auth_classes = ["rest_framework.authentication.SessionAuthentication"]
if _module_available("rest_framework_simplejwt"):
    _auth_classes.insert(0, "rest_framework_simplejwt.authentication.JWTAuthentication")

_filter_backends = [
    "rest_framework.filters.SearchFilter",
    "rest_framework.filters.OrderingFilter",
]
if _module_available("django_filters"):
    _filter_backends.insert(0, "django_filters.rest_framework.DjangoFilterBackend")

REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": (
        "drf_spectacular.openapi.AutoSchema"
        if _module_available("drf_spectacular")
        else "rest_framework.schemas.openapi.AutoSchema"
    ),
    "DEFAULT_AUTHENTICATION_CLASSES": tuple(_auth_classes),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticatedOrReadOnly",),
    "DEFAULT_FILTER_BACKENDS": tuple(_filter_backends),
    "DEFAULT_PAGINATION_CLASS": "api.pagination.StandardResultsSetPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_THROTTLE_CLASSES": (
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ),
    "DEFAULT_THROTTLE_RATES": {"anon": "120/min", "user": "600/min"},
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

SPECTACULAR_SETTINGS = {
    "TITLE": "VoiceIran API",
    "DESCRIPTION": "API services for VoiceIran platform",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
}

_default_frontend_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ALLOWED_ORIGINS", ",".join(_default_frontend_origins)).split(",")
    if origin.strip()
]
CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS.copy()

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# When False, analytics tracking only increments source-model counters
# (e.g. view_count) and does not persist per-view rows in analytics.PageView.
ANALYTICS_STORE_PAGEVIEWS = _env_bool("ANALYTICS_STORE_PAGEVIEWS", default=False)

# When False, search signals only maintain runtime_data/search_index/documents.json
# and skip search_index.SearchDocument DB writes.
SEARCH_INDEX_STORE_DB = _env_bool("SEARCH_INDEX_STORE_DB", default=False)
