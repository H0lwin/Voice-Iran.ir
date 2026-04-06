from django.contrib.contenttypes.models import ContentType
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from achievements.models import Achievement
from documents.models import Document
from localization.models import Language
from martyrs.models import Martyr
from news.models import Post
from arsenal.models import Weapon
from seo.models import SeoConfig


def _is_published(instance) -> bool:
    status = getattr(instance, "status", None)
    published_value = getattr(getattr(instance.__class__, "Status", None), "PUBLISHED", None)
    if published_value is not None and status != published_value:
        return False
    published_at = getattr(instance, "published_at", None)
    if published_at and published_at > timezone.now():
        return False
    return True


def _default_meta(instance, lang: str) -> tuple[str, str]:
    title_fa = getattr(instance, "title_fa", "") or getattr(instance, "name_fa", "")
    title_en = getattr(instance, "title_en", "") or getattr(instance, "name_en", "")
    summary_fa = getattr(instance, "summary_fa", "") or getattr(instance, "excerpt_fa", "")
    summary_en = getattr(instance, "summary_en", "") or getattr(instance, "excerpt_en", "")
    if lang == "en":
        return (title_en or title_fa or str(instance.pk), summary_en or summary_fa or "")
    return (title_fa or title_en or str(instance.pk), summary_fa or summary_en or "")


def _sync_default_seo(instance) -> None:
    if not _is_published(instance):
        return
    ct = ContentType.objects.get_for_model(instance.__class__)
    for language in Language.objects.filter(is_active=True, code__in=["fa", "en"]):
        meta_title, meta_desc = _default_meta(instance, language.code)
        SeoConfig.objects.get_or_create(
            content_type=ct,
            object_id=instance.pk,
            language=language,
            defaults={"meta_title": meta_title, "meta_description": meta_desc},
        )


@receiver(post_save, sender=Post)
@receiver(post_save, sender=Weapon)
@receiver(post_save, sender=Martyr)
@receiver(post_save, sender=Document)
@receiver(post_save, sender=Achievement)
def ensure_default_seo_config(sender, instance, raw: bool = False, **kwargs):
    if raw:
        return
    _sync_default_seo(instance)
