from datetime import date, timedelta

from django.core.files import File
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from core.management.commands.seed_test_data_utils import ensure_media_assets, pick_asset
from martyrs.models import Martyr, MartyrAchievement, MartyrUnit


class Command(BaseCommand):
    help = "Seed test data for martyrs app (5 records per model)"

    def add_arguments(self, parser):
        parser.add_argument("--count", type=int, default=5, help="Number of martyr units/martyrs to seed.")

    @transaction.atomic
    def handle(self, *args, **options):
        count = max(1, int(options["count"]))
        assets = ensure_media_assets(min_count=10)

        units = []
        for i in range(1, count + 1):
            unit, _ = MartyrUnit.objects.update_or_create(
                slug=f"seed-martyr-unit-{i}",
                defaults={
                    "name": f"یگان تست {i}",
                    "name_en": f"Seed Unit {i}",
                    "is_active": True,
                },
            )
            units.append(unit)

        for i in range(1, count + 1):
            martyr, _ = Martyr.objects.update_or_create(
                slug=f"seed-martyr-{i}",
                defaults={
                    "unit": units[(i - 1) % len(units)],
                    "birth_date": date(1978 + i, 1, min(i + 10, 28)),
                    "martyrdom_date": date(2010 + i, 2, min(i + 11, 28)),
                    "martyrdom_location": f"منطقه عملیاتی تست {i}",
                    "name_fa": f"شهید تست {i}",
                    "name_en": f"Seed Martyr {i}",
                    "title_fa": f"فرمانده تست {i}",
                    "title_en": f"Seed Commander {i}",
                    "biography_fa": f"زندگی نامه کامل شهید تست {i}",
                    "biography_en": f"Full biography for seed martyr {i}",
                    "short_bio_fa": f"خلاصه شهید تست {i}",
                    "short_bio_en": f"Seed short bio {i}",
                    "status": Martyr.Status.PUBLISHED if i % 2 else Martyr.Status.REVIEW,
                    "is_featured": i in {1, 3, 5},
                    "published_at": timezone.now() - timedelta(days=i),
                },
            )

            MartyrAchievement.objects.update_or_create(
                martyr=martyr,
                title=f"دستاورد تست {i}",
                defaults={
                    "title_en": f"Seed Achievement {i}",
                    "description": f"توضیحات دستاورد تست {i}",
                    "description_en": f"Description for achievement {i}",
                    "sort_order": i,
                },
            )
            image_path = pick_asset(assets, i + 2)
            with image_path.open("rb") as stream:
                martyr.profile_image.save(image_path.name, File(stream), save=True)

        self.stdout.write(self.style.SUCCESS(f"Martyrs test data seeded ({count} records per model)."))
