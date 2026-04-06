from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Seed initial/taxonomy/news/arsenal/martyrs/documents test data in one go"

    def add_arguments(self, parser):
        parser.add_argument("--count", type=int, default=5, help="Number of records per seed command.")

    def handle(self, *args, **options):
        count = max(1, int(options["count"]))
        call_command("seed_initial_data")
        call_command("seed_taxonomy_test_data", count=count)
        call_command("seed_news_test_data", count=count)
        call_command("seed_achievements_test_data", count=count)
        call_command("seed_arsenal_test_data", count=count)
        call_command("seed_martyrs_test_data", count=count)
        call_command("seed_documents_test_data", count=count)
        call_command("seed_search_test_data")
        self.stdout.write(self.style.SUCCESS(f"All admin test data seeded successfully ({count} each)."))
