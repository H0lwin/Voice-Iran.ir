from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

from core.observability import append_audit_event
from documents.models import Document
from localization.models import Language
from martyrs.models import Martyr
from news.models import Post
from search_index.models import SearchDocument
from search_index.services import sync_synonyms_from_text, upsert_document_index_row
from arsenal.models import Weapon


def _upsert_search_doc(source_type: str, source_id: int, language, title: str, excerpt: str = "", body: str = ""):
    upsert_document_index_row(
        source_type=source_type,
        source_id=source_id,
        language_code=language.code,
        title=title,
        excerpt=excerpt,
        body=body,
        is_public=True,
    )
    if not getattr(settings, "SEARCH_INDEX_STORE_DB", False):
        return
    SearchDocument.objects.update_or_create(
        source_type=source_type,
        source_id=source_id,
        language=language,
        defaults={"title": title or "", "excerpt": excerpt or "", "body": body or "", "is_public": True},
    )


def _active_languages():
    return Language.objects.filter(code__in=["fa", "en"])


@receiver(post_save, sender=Post)
def sync_post_to_search(sender, instance: Post, **kwargs):
    for language in _active_languages():
        title = instance.title_en if language.code == "en" and instance.title_en else instance.title_fa
        excerpt = instance.excerpt_en if language.code == "en" and instance.excerpt_en else instance.excerpt_fa
        body = instance.content_en if language.code == "en" and instance.content_en else instance.content_fa
        _upsert_search_doc(
            source_type=SearchDocument.SourceType.POST,
            source_id=instance.id,
            language=language,
            title=title,
            excerpt=excerpt,
            body=body,
        )
    sync_synonyms_from_text("fa", instance.title_fa or "")
    sync_synonyms_from_text("en", instance.title_en or "")


@receiver(post_save, sender=Weapon)
def sync_weapon_to_search(sender, instance: Weapon, **kwargs):
    for language in _active_languages():
        title = instance.name_en if language.code == "en" and instance.name_en else instance.name_fa
        excerpt = instance.summary_en if language.code == "en" and instance.summary_en else instance.summary_fa
        body = instance.description_en if language.code == "en" and instance.description_en else instance.description_fa
        _upsert_search_doc(
            source_type=SearchDocument.SourceType.WEAPON,
            source_id=instance.id,
            language=language,
            title=title,
            excerpt=excerpt,
            body=body,
        )
    sync_synonyms_from_text("fa", instance.name_fa or "")
    sync_synonyms_from_text("en", instance.name_en or "")


@receiver(post_save, sender=Martyr)
def sync_martyr_to_search(sender, instance: Martyr, **kwargs):
    for language in _active_languages():
        title = instance.name_en if language.code == "en" and instance.name_en else instance.name_fa
        excerpt = instance.short_bio_en if language.code == "en" and instance.short_bio_en else instance.short_bio_fa
        body = instance.biography_en if language.code == "en" and instance.biography_en else instance.biography_fa
        _upsert_search_doc(
            source_type=SearchDocument.SourceType.MARTYR,
            source_id=instance.id,
            language=language,
            title=title,
            excerpt=excerpt,
            body=body,
        )
    sync_synonyms_from_text("fa", instance.name_fa or "")
    sync_synonyms_from_text("en", instance.name_en or "")


@receiver(post_save, sender=Document)
def sync_document_to_search(sender, instance: Document, **kwargs):
    for language in _active_languages():
        title = instance.title_en if language.code == "en" and instance.title_en else instance.title_fa
        excerpt = instance.summary_en if language.code == "en" and instance.summary_en else instance.summary_fa
        body = instance.description_en if language.code == "en" and instance.description_en else instance.description_fa
        _upsert_search_doc(
            source_type=SearchDocument.SourceType.DOCUMENT,
            source_id=instance.id,
            language=language,
            title=title,
            excerpt=excerpt,
            body=body,
        )
    sync_synonyms_from_text("fa", instance.title_fa or "")
    sync_synonyms_from_text("en", instance.title_en or "")


@receiver(post_save, sender=Post)
@receiver(post_save, sender=Weapon)
@receiver(post_save, sender=Martyr)
@receiver(post_save, sender=Document)
def audit_content_changes(sender, instance, created, **kwargs):
    append_audit_event(
        action="created" if created else "updated",
        target_type=sender.__name__,
        target_id=str(instance.pk),
        actor_id=None,
        actor_username="",
        metadata={"source": "signal"},
    )
