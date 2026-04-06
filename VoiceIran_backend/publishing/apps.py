from django.apps import AppConfig


class PublishingConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "publishing"

    def ready(self):
        # noqa: F401
        from . import signals
