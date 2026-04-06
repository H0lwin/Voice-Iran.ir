from django.apps import AppConfig


class LocalizationConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "localization"

    def ready(self):
        # noqa: F401
        from . import signals
