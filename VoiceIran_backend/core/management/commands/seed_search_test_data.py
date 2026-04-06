from django.core.management.base import BaseCommand
from django.db import transaction

from search_index.models import PopularSearchTerm


class Command(BaseCommand):
    help = "Seed test data for search metadata (popular search terms)"

    @transaction.atomic
    def handle(self, *args, **options):
        terms = [
            ("true-promise", "عملیات وعده صادق", "Operation True Promise"),
            ("air-defense", "پدافند هوایی", "Air Defense"),
            ("fattah", "موشک فتاح", "Fattah Missile"),
            ("shahed", "پهپاد شاهد", "Shahed Drone"),
            ("martyr-soleimani", "شهید سلیمانی", "Martyr Soleimani"),
            ("defense-docs", "مستندات دفاعی", "Defense Documents"),
        ]
        for index, (slug, label_fa, label_en) in enumerate(terms, start=1):
            PopularSearchTerm.objects.update_or_create(
                slug=slug,
                defaults={
                    "label_fa": label_fa,
                    "label_en": label_en,
                    "term_type": PopularSearchTerm.TermType.SEARCH,
                    "weight": 100 - index,
                    "is_active": True,
                },
            )

        self.stdout.write(self.style.SUCCESS("Search metadata test data seeded."))
