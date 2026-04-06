from django.core.management.base import BaseCommand

from documents.models import Document
from martyrs.models import Martyr
from news.models import Post
from search_index.services import sync_synonyms_from_tags, sync_synonyms_from_text
from arsenal.models import Weapon


class Command(BaseCommand):
    help = "Auto-create search synonyms from content titles and active tags"

    def handle(self, *args, **options):
        for post in Post.objects.all():
            sync_synonyms_from_text("fa", post.title_fa or "")
            sync_synonyms_from_text("en", post.title_en or "")
        for weapon in Weapon.objects.all():
            sync_synonyms_from_text("fa", weapon.name_fa or "")
            sync_synonyms_from_text("en", weapon.name_en or "")
        for martyr in Martyr.objects.all():
            sync_synonyms_from_text("fa", martyr.name_fa or "")
            sync_synonyms_from_text("en", martyr.name_en or "")
        for document in Document.objects.all():
            sync_synonyms_from_text("fa", document.title_fa or "")
            sync_synonyms_from_text("en", document.title_en or "")
        config = sync_synonyms_from_tags()
        self.stdout.write(self.style.SUCCESS(f"Search synonyms prepared in config structure ({len(config.get('fa', {}))} fa keys)."))
