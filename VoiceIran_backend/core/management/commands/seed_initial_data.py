from django.core.management.base import BaseCommand

from core.models import HomePageContent, LiveStat
from localization.models import Language


class Command(BaseCommand):
    help = "Seed essential initial data for VoiceIran backend"

    def handle(self, *args, **options):
        fa, _ = Language.objects.get_or_create(
            code="fa",
            defaults={"name": "فارسی", "direction": Language.Direction.RTL, "is_default": True, "is_active": True},
        )
        en, _ = Language.objects.get_or_create(
            code="en",
            defaults={"name": "English", "direction": Language.Direction.LTR, "is_default": False, "is_active": True},
        )

        Language.objects.exclude(pk=fa.pk).update(is_default=False)
        if not fa.is_default:
            fa.is_default = True
            fa.save(update_fields=["is_default"])

        home_defaults = {
            "hero_title_fa": "صدای ایران",
            "hero_title_en": "Voice of Iran",
            "hero_live_badge_fa": "زنده",
            "hero_live_badge_en": "LIVE",
            "hero_description_fa": "روایت مستند از شهدا، اخبار، تسلیحات و آرشیو اسناد.",
            "hero_description_en": "Documented narratives of martyrs, news, weapons, and archive collections.",
            "hero_primary_action_fa": "تماشای گزارش",
            "hero_primary_action_en": "Watch Report",
            "hero_secondary_action_fa": "اطلاعات بیشتر",
            "hero_secondary_action_en": "Learn More",
            "hero_background_image": "/images/placeholder-media.svg",
            "latest_news_title_fa": "آخرین اخبار",
            "latest_news_title_en": "Latest News",
            "live_stats_title_fa": "آمار لحظه‌ای",
            "live_stats_title_en": "Live Stats",
            "operations_label_fa": "عملیات موفق",
            "operations_label_en": "Successful Operations",
            "operations_value": 847,
            "intercepted_label_fa": "اهداف رهگیری‌شده",
            "intercepted_label_en": "Intercepted Targets",
            "intercepted_value": 2341,
            "drills_label_fa": "رزمایش‌ها",
            "drills_label_en": "Drills",
            "drills_value": 156,
            "featured_weapons_title_fa": "تسلیحات ویژه",
            "featured_weapons_title_en": "Featured Weapons",
            "featured_documents_title_fa": "مستندات ویژه",
            "featured_documents_title_en": "Featured Documents",
            "featured_martyrs_title_fa": "شهدای ویژه",
            "featured_martyrs_title_en": "Featured Martyrs",
            "martyrs_quote_fa": "«و لا تحسبن الذین قتلوا فی سبیل الله امواتا بل احیاء»",
            "martyrs_quote_en": '"Do not consider those slain in God\'s way as dead; they are alive."',
            "view_all_label_fa": "مشاهده همه",
            "view_all_label_en": "View all",
            "empty_label_fa": "موردی برای نمایش وجود ندارد.",
            "empty_label_en": "No items are available.",
            "is_active": True,
        }
        existing_home = HomePageContent.objects.filter(is_active=True).order_by("-updated_at", "-id").first()
        if existing_home is None:
            HomePageContent.objects.create(**home_defaults)
        else:
            for key, value in home_defaults.items():
                if not getattr(existing_home, key):
                    setattr(existing_home, key, value)
            existing_home.save()

        live_stats = [
            ("operations", "عملیات موفق", "Successful Operations", 847, "operations", 1),
            ("intercepted", "اهداف رهگیری‌شده", "Intercepted Targets", 2341, "intercepted", 2),
            ("drills", "رزمایش‌ها", "Drills", 156, "drills", 3),
        ]
        for key, fa_label, en_label, value, icon_key, sort_order in live_stats:
            LiveStat.objects.update_or_create(
                key=key,
                defaults={
                    "label_fa": fa_label,
                    "label_en": en_label,
                    "value": value,
                    "icon_key": icon_key,
                    "sort_order": sort_order,
                    "is_active": True,
                },
            )

        self.stdout.write(self.style.SUCCESS("Initial data seeded successfully."))
