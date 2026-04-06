from django.core.management.base import BaseCommand
from django.db import transaction

from taxonomy.models import TaxonomyDomain, Term


class Command(BaseCommand):
    help = "Seed test data for taxonomy app (5 records per model)"

    def add_arguments(self, parser):
        parser.add_argument("--count", type=int, default=5, help="Number of records to seed for each taxonomy type.")

    @transaction.atomic
    def handle(self, *args, **options):
        count = max(1, int(options["count"]))
        categories = []
        for i in range(1, count + 1):
            category, _ = Term.objects.update_or_create(
                type=Term.TermType.CATEGORY,
                slug=f"seed-tax-category-{i}",
                defaults={
                    "name": f"دسته تست {i}",
                    "name_en": f"Seed Category {i}",
                    "domain": TaxonomyDomain.NEWS if i <= 3 else TaxonomyDomain.GLOBAL,
                    "parent": categories[0] if i > 1 else None,
                    "is_active": True,
                    "sort_order": i,
                },
            )
            categories.append(category)

        for i in range(1, count + 1):
            Term.objects.update_or_create(
                type=Term.TermType.TAG,
                slug=f"seed-tax-tag-{i}",
                defaults={
                    "name": f"برچسب تست {i}",
                    "name_en": f"Seed Tag {i}",
                    "domain": TaxonomyDomain.NEWS if i <= 3 else TaxonomyDomain.DOCUMENT,
                    "is_active": True,
                },
            )

        for i in range(1, count + 1):
            Term.objects.update_or_create(
                type=Term.TermType.TOPIC,
                slug=f"seed-tax-topic-{i}",
                defaults={
                    "name": f"موضوع تست {i}",
                    "name_en": f"Seed Topic {i}",
                    "description": f"توضیحات موضوع تست {i}",
                    "description_en": f"Description for seed topic {i}",
                    "is_active": True,
                },
            )

        self.stdout.write(self.style.SUCCESS(f"Taxonomy test data seeded ({count} records per model)."))
