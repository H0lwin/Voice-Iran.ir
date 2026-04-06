from datetime import timedelta

from django.core.files import File
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from achievements.models import Achievement
from core.management.commands.seed_test_data_utils import ensure_media_assets, pick_asset


class Command(BaseCommand):
    help = "Seed test data for achievements app"

    def add_arguments(self, parser):
        parser.add_argument("--count", type=int, default=6, help="Number of achievements to seed.")

    @transaction.atomic
    def handle(self, *args, **options):
        count = max(1, int(options["count"]))
        assets = ensure_media_assets(min_count=12)
        now = timezone.now()
        target_types = [
            Achievement.TargetType.DRONE,
            Achievement.TargetType.MISSILE,
            Achievement.TargetType.AIRCRAFT,
            Achievement.TargetType.SHIP,
            Achievement.TargetType.INFRASTRUCTURE,
        ]
        verification = [
            Achievement.VerificationStatus.OFFICIAL,
            Achievement.VerificationStatus.DOCUMENTED,
            Achievement.VerificationStatus.CLAIMED,
        ]

        for i in range(1, count + 1):
            item, _ = Achievement.objects.update_or_create(
                slug=f"seed-achievement-{i}",
                defaults={
                    "status": Achievement.Status.PUBLISHED if i % 2 else Achievement.Status.REVIEW,
                    "title_fa": f"دستاورد عملیاتی شماره {i}",
                    "title_en": f"Operational Achievement {i}",
                    "excerpt_fa": f"خلاصه کوتاه دستاورد شماره {i}",
                    "excerpt_en": f"Short excerpt for achievement {i}",
                    "summary_fa": f"خلاصه تحلیلی دستاورد شماره {i}",
                    "summary_en": f"Analytical summary for achievement {i}",
                    "content_fa": f"<p>شرح کامل دستاورد شماره {i} و نتایج عملیاتی آن.</p>",
                    "content_en": f"<p>Full description of achievement {i} and its operational outcomes.</p>",
                    "target_type": target_types[(i - 1) % len(target_types)],
                    "region_fa": f"منطقه عملیاتی {i}",
                    "region_en": f"Operational Region {i}",
                    "destroyed_targets_count": i * 3,
                    "strategic_gain_count": i * 2,
                    "verification_status": verification[(i - 1) % len(verification)],
                    "is_featured": i in {1, 2, 4},
                    "published_at": now - timedelta(days=i),
                    "view_count": i * 150,
                },
            )
            image_path = pick_asset(assets, i + 5)
            with image_path.open("rb") as stream:
                item.cover_image.save(image_path.name, File(stream), save=True)

        self.stdout.write(self.style.SUCCESS(f"Achievements test data seeded ({count} records)."))
