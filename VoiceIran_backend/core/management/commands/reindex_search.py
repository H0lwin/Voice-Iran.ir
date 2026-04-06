from django.core.management.base import BaseCommand

from documents.models import Document
from localization.models import Language
from martyrs.models import Martyr
from news.models import Post
from search_index.models import SearchDocument
from arsenal.models import Weapon


class Command(BaseCommand):
    help = "Rebuild search_index.SearchDocument from translation tables"

    def handle(self, *args, **options):
        SearchDocument.objects.all().delete()

        langs = list(Language.objects.filter(code__in=["fa", "en"]))

        for post in Post.objects.all():
            for language in langs:
                SearchDocument.objects.create(
                    source_type=SearchDocument.SourceType.POST,
                    source_id=post.id,
                    language=language,
                    title=post.title_en if language.code == "en" and post.title_en else post.title_fa,
                    excerpt=post.excerpt_en if language.code == "en" and post.excerpt_en else post.excerpt_fa,
                    body=post.content_en if language.code == "en" and post.content_en else post.content_fa,
                    is_public=True,
                )

        for weapon in Weapon.objects.all():
            for language in langs:
                SearchDocument.objects.create(
                    source_type=SearchDocument.SourceType.WEAPON,
                    source_id=weapon.id,
                    language=language,
                    title=weapon.name_en if language.code == "en" and weapon.name_en else weapon.name_fa,
                    excerpt=weapon.summary_en if language.code == "en" and weapon.summary_en else weapon.summary_fa,
                    body=weapon.description_en if language.code == "en" and weapon.description_en else weapon.description_fa,
                    is_public=True,
                )

        for martyr in Martyr.objects.all():
            for language in langs:
                SearchDocument.objects.create(
                    source_type=SearchDocument.SourceType.MARTYR,
                    source_id=martyr.id,
                    language=language,
                    title=martyr.name_en if language.code == "en" and martyr.name_en else martyr.name_fa,
                    excerpt=martyr.short_bio_en if language.code == "en" and martyr.short_bio_en else martyr.short_bio_fa,
                    body=martyr.biography_en if language.code == "en" and martyr.biography_en else martyr.biography_fa,
                    is_public=True,
                )

        for document in Document.objects.all():
            for language in langs:
                SearchDocument.objects.create(
                    source_type=SearchDocument.SourceType.DOCUMENT,
                    source_id=document.id,
                    language=language,
                    title=document.title_en if language.code == "en" and document.title_en else document.title_fa,
                    excerpt=document.summary_en if language.code == "en" and document.summary_en else document.summary_fa,
                    body=document.description_en if language.code == "en" and document.description_en else document.description_fa,
                    is_public=True,
                )

        self.stdout.write(self.style.SUCCESS("Search index rebuilt successfully."))
