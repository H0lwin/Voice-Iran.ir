from django.core.management.base import BaseCommand

from core.observability import build_aggregates


class Command(BaseCommand):
    help = "Build daily analytics aggregates and content metrics from observability logs"

    def add_arguments(self, parser):
        parser.add_argument("--days", type=int, default=30, help="How many recent days to aggregate")

    def handle(self, *args, **options):
        days = max(1, int(options["days"]))
        result = build_aggregates(days=days)
        self.stdout.write(
            self.style.SUCCESS(
                f"Aggregated {len(result['daily_aggregates'])} daily rows and {len(result['content_metrics'])} content rows."
            )
        )
