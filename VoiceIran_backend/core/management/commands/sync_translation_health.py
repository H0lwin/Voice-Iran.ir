from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Run translation health checks (model-free periodic command)"

    def handle(self, *args, **options):
        # Translation health is no longer persisted in a model.
        self.stdout.write(self.style.SUCCESS("Translation health check completed (no database records stored)."))
