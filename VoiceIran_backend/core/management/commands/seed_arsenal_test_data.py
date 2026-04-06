from datetime import timedelta

from django.core.files import File
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from arsenal.models import Weapon, WeaponSpecification
from core.management.commands.seed_test_data_utils import ensure_media_assets, pick_asset
from taxonomy.models import TaxonomyDomain, Term


class Command(BaseCommand):
    help = "Seed test data for arsenal app (5 records per model)"

    def add_arguments(self, parser):
        parser.add_argument("--count", type=int, default=5, help="Number of weapon records to seed.")

    @transaction.atomic
    def handle(self, *args, **options):
        count = max(1, int(options["count"]))
        assets = ensure_media_assets(min_count=10)
        now = timezone.now()

        categories = []
        for i in range(1, count + 1):
            category, _ = Term.objects.update_or_create(
                type=Term.TermType.CATEGORY,
                slug=f"seed-weapon-category-{i}",
                defaults={
                    "name": f"دسته تسلیحات تست {i}",
                    "name_en": f"Seed Weapon Category {i}",
                    "domain": TaxonomyDomain.WEAPON,
                    "is_active": True,
                    "sort_order": i,
                },
            )
            categories.append(category)

        for i in range(1, count + 1):
            weapon, _ = Weapon.objects.update_or_create(
                slug=f"seed-weapon-{i}",
                defaults={
                    "status": Weapon.Status.PUBLISHED if i % 2 else Weapon.Status.REVIEW,
                    "category": categories[(i - 1) % len(categories)],
                    "range_km": 50 + (i * 25),
                    "name_fa": f"تسلیح تست {i}",
                    "name_en": f"Seed Weapon {i}",
                    "type_label_fa": f"نوع تست {i}",
                    "type_label_en": f"Seed Type {i}",
                    "category_label_fa": f"دسته تست {i}",
                    "category_label_en": f"Seed Category {i}",
                    "description_fa": f"توضیحات کامل تسلیح تست {i}",
                    "description_en": f"Detailed description for seed weapon {i}",
                    "summary_fa": f"خلاصه تسلیح تست {i}",
                    "summary_en": f"Seed summary for weapon {i}",
                    "is_featured": i in {1, 3, 5},
                    "published_at": now - timedelta(days=i),
                },
            )
            image_path = pick_asset(assets, i + 4)
            with image_path.open("rb") as stream:
                weapon.cover_image.save(image_path.name, File(stream), save=True)

            WeaponSpecification.objects.update_or_create(
                weapon=weapon,
                key="speed",
                sort_order=1,
                defaults={
                    "value": f"{6 + i}",
                    "unit": "mach",
                    "is_public": True,
                },
            )
            WeaponSpecification.objects.update_or_create(
                weapon=weapon,
                key="warhead",
                sort_order=2,
                defaults={
                    "value": f"{200 + (i * 25)}",
                    "unit": "kg",
                    "is_public": True,
                },
            )
            WeaponSpecification.objects.update_or_create(
                weapon=weapon,
                key="guidance",
                sort_order=3,
                defaults={
                    "value": "INS/GNSS",
                    "unit": "",
                    "is_public": True,
                },
            )

        self.stdout.write(self.style.SUCCESS(f"Arsenal test data seeded ({count} records per model)."))
