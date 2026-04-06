from .settings_dev import *  # noqa: F403,F401

# Keep tests runnable before creating real migrations for local apps.
MIGRATION_MODULES = {
    "accounts": None,
    "analytics": None,
    "api": None,
    "arsenal": None,
    "core": None,
    "documents": None,
    "localization": None,
    "martyrs": None,
    "news": None,
    "notifications": None,
    "publishing": None,
    "search_index": None,
    "seo": None,
    "taxonomy": None,
}
