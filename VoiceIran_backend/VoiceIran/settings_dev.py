from .settings_base import *  # noqa: F403,F401

DEBUG = True
ALLOWED_HOSTS = ["*", "localhost", "127.0.0.1"]

CSRF_COOKIE_SECURE = False
SESSION_COOKIE_SECURE = False
SECURE_SSL_REDIRECT = False

# Admin Dashboard Frontend URL
ADMIN_FRONTEND_URL = os.getenv("ADMIN_FRONTEND_URL", "http://localhost:3001")

# CORS Settings for Admin Dashboard
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    ADMIN_FRONTEND_URL,
]
CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS.copy()

# Allow credentials for session-based auth
CORS_ALLOW_CREDENTIALS = True

# REST Framework settings for Admin API
REST_FRAMEWORK["DEFAULT_AUTHENTICATION_CLASSES"] = [
    "rest_framework_simplejwt.authentication.JWTAuthentication",
    "rest_framework.authentication.SessionAuthentication",
]
REST_FRAMEWORK["DEFAULT_PERMISSION_CLASSES"] = [
    "rest_framework.permissions.IsAuthenticated",
]

# Simple JWT settings
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
}
