from django.db.models.signals import post_save
from django.dispatch import receiver

from localization.models import Language, LanguageConfig


@receiver(post_save, sender=Language)
def ensure_language_configs(sender, instance: Language, created: bool, **kwargs):
    defaults = {
        "date_format": instance.date_format,
        "number_format": instance.number_format,
        "calendar_system": instance.calendar_system,
        "fallback_language": instance.fallback_language,
    }
    cfg, cfg_created = LanguageConfig.objects.get_or_create(language=instance, defaults=defaults)
    if not created and not cfg_created:
        # Keep deprecated table in sync for backward compatibility.
        changed = False
        for key, value in defaults.items():
            if getattr(cfg, key) != value:
                setattr(cfg, key, value)
                changed = True
        if changed:
            cfg.save(update_fields=["date_format", "number_format", "calendar_system", "fallback_language"])
    if created and cfg_created:
        # One-time backfill from legacy config defaults.
        Language.objects.filter(pk=instance.pk).update(
            date_format=cfg.date_format,
            number_format=cfg.number_format,
            calendar_system=cfg.calendar_system,
            fallback_language=cfg.fallback_language,
        )
