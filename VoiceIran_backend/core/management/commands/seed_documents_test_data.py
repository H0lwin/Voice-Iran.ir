from datetime import timedelta

from django.core.files import File
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from core.management.commands.seed_test_data_utils import ensure_languages, ensure_media_assets, pick_asset
from documents.models import (
    Document,
    DocumentCollection,
    DocumentFile,
    DocumentTimelineEvent,
    DocumentType,
)


class Command(BaseCommand):
    help = "Seed test data for documents app (5 records per model)"

    def add_arguments(self, parser):
        parser.add_argument(
            "--count",
            type=int,
            default=5,
            help="Number of collections/documents/files to seed (max practical value is bounded by predefined document types).",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        count = max(1, int(options["count"]))
        fa, _ = ensure_languages()
        assets = ensure_media_assets(min_count=10)
        now = timezone.now()

        type_codes = [
            ("seed-video", "ویدیو"),
            ("seed-pdf", "پی دی اف"),
            ("seed-image", "تصویر"),
            ("seed-audio", "صوت"),
            ("seed-archive", "آرشیو"),
        ]
        doc_types = []
        for i, (code, name) in enumerate(type_codes, start=1):
            doc_type, _ = DocumentType.objects.update_or_create(
                code=code,
                defaults={
                    "name": f"{name} تست {i}",
                    "name_en": f"Seed Type {i}",
                    "is_active": True,
                },
            )
            doc_types.append(doc_type)

        collections = []
        for i in range(1, count + 1):
            collection, _ = DocumentCollection.objects.update_or_create(
                slug=f"seed-doc-collection-{i}",
                defaults={
                    "title": f"مجموعه مستند تست {i}",
                    "title_en": f"Seed Collection {i}",
                    "description": f"توضیحات مجموعه تست {i}",
                    "description_en": f"Seed collection description {i}",
                    "is_public": True,
                },
            )
            collections.append(collection)

        roles = [
            DocumentFile.FileRole.PRIMARY,
            DocumentFile.FileRole.PREVIEW,
            DocumentFile.FileRole.ATTACHMENT,
            DocumentFile.FileRole.SUBTITLE,
            DocumentFile.FileRole.PRIMARY,
        ]
        for i in range(1, count + 1):
            document, _ = Document.objects.update_or_create(
                slug=f"seed-document-{i}",
                defaults={
                    "document_type": doc_types[(i - 1) % len(doc_types)],
                    "status": Document.Status.PUBLISHED if i % 2 else Document.Status.REVIEW,
                    "published_at": now - timedelta(days=i),
                    "view_count": i * 60,
                    "download_count": i * 20,
                    "duration_seconds": i * 300,
                    "page_count": i * 12,
                    "item_count": i * 2,
                    "title_fa": f"مستند تست {i}",
                    "title_en": f"Seed Document {i}",
                    "description_fa": f"توضیحات مستند تست {i}",
                    "description_en": f"Seed document description {i}",
                    "summary_fa": f"خلاصه مستند تست {i}",
                    "summary_en": f"Seed document summary {i}",
                    "is_featured": i in {1, 5},
                },
            )
            document.collections.set([collections[(i - 1) % len(collections)]])
            thumbnail_path = pick_asset(assets, i + 8)
            with thumbnail_path.open("rb") as stream:
                document.thumbnail.save(thumbnail_path.name, File(stream), save=True)

            doc_file, _ = DocumentFile.objects.update_or_create(
                document=document,
                sort_order=i,
                defaults={
                    "file_role": roles[(i - 1) % len(roles)],
                    "language": fa,
                    "is_primary": roles[(i - 1) % len(roles)] == DocumentFile.FileRole.PRIMARY,
                },
            )
            file_path = pick_asset(assets, i + 12)
            with file_path.open("rb") as stream:
                doc_file.file.save(file_path.name, File(stream), save=True)

        timeline_events = [
            (1402, "عملیات وعده صادق", "Operation True Promise"),
            (1401, "رونمایی از موشک فتاح", "Fattah Missile Unveiling"),
            (1400, "معرفی شاهد ۱۳۶", "Shahed 136 Introduction"),
            (1398, "سرنگونی پهپاد آمریکایی", "US Drone Interception"),
            (1396, "حمله موشکی به داعش", "Anti-ISIS Missile Strike"),
        ]
        for index, (year, title_fa, title_en) in enumerate(timeline_events, start=1):
            DocumentTimelineEvent.objects.update_or_create(
                year=year,
                sort_order=index,
                defaults={
                    "title_fa": title_fa,
                    "title_en": title_en,
                    "description_fa": f"رویداد ثبت شده در سال {year}",
                    "description_en": f"Recorded event in {year}",
                    "is_active": True,
                },
            )

        self.stdout.write(self.style.SUCCESS(f"Documents test data seeded ({count} records per model)."))
