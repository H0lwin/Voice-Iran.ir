from django.core.management.base import BaseCommand

from arsenal.models import Weapon
from documents.models import Document
from localization.models import Language, UnifiedTranslation
from martyrs.models import Martyr
from news.models import Post
from taxonomy.models import Term


class Command(BaseCommand):
    help = "Sync current content models into unified taxonomy/translation models"

    def handle(self, *args, **options):
        self._sync_terms()
        self._sync_translations()
        self.stdout.write(self.style.SUCCESS("Unified models synced successfully."))

    def _sync_terms(self):
        self.stdout.write(self.style.SUCCESS(f"Unified terms already active in taxonomy.Term ({Term.objects.count()} records)."))

    def _sync_translations(self):
        langs = list(Language.objects.filter(code__in=["fa", "en"]))
        for post in Post.objects.all():
            for language in langs:
                is_en = language.code == "en"
                UnifiedTranslation.objects.update_or_create(
                    source_type="news.post",
                    source_id=post.id,
                    language=language,
                    defaults={
                        "title": post.title_en if is_en else post.title_fa,
                        "excerpt": post.excerpt_en if is_en else post.excerpt_fa,
                        "summary": post.summary_en if is_en else post.summary_fa,
                        "content": post.content_en if is_en else post.content_fa,
                        "extra": {
                            "reading_time_minutes": post.reading_time_minutes,
                            "meta_title": post.meta_title_en if is_en else post.meta_title_fa,
                            "meta_description": post.meta_description_en if is_en else post.meta_description_fa,
                        },
                    },
                )
        for weapon in Weapon.objects.all():
            for language in langs:
                is_en = language.code == "en"
                UnifiedTranslation.objects.update_or_create(
                    source_type="arsenal.weapon",
                    source_id=weapon.id,
                    language=language,
                    defaults={
                        "title": weapon.name_en if is_en else weapon.name_fa,
                        "summary": weapon.summary_en if is_en else weapon.summary_fa,
                        "content": weapon.description_en if is_en else weapon.description_fa,
                        "extra": {
                            "type_label": weapon.type_label_en if is_en else weapon.type_label_fa,
                            "category_label": weapon.category_label_en if is_en else weapon.category_label_fa,
                        },
                    },
                )
        for martyr in Martyr.objects.all():
            for language in langs:
                is_en = language.code == "en"
                UnifiedTranslation.objects.update_or_create(
                    source_type="martyrs.martyr",
                    source_id=martyr.id,
                    language=language,
                    defaults={
                        "title": martyr.name_en if is_en else martyr.name_fa,
                        "excerpt": martyr.short_bio_en if is_en else martyr.short_bio_fa,
                        "content": martyr.biography_en if is_en else martyr.biography_fa,
                        "extra": {"title": martyr.title_en if is_en else martyr.title_fa},
                    },
                )
        for document in Document.objects.all():
            for language in langs:
                is_en = language.code == "en"
                UnifiedTranslation.objects.update_or_create(
                    source_type="documents.document",
                    source_id=document.id,
                    language=language,
                    defaults={
                        "title": document.title_en if is_en else document.title_fa,
                        "summary": document.summary_en if is_en else document.summary_fa,
                        "content": document.description_en if is_en else document.description_fa,
                    },
                )
