import json

from django.core.management.base import BaseCommand, CommandError

from core.runtime_configs import (
    get_retention_config,
    get_workflow_config,
    set_retention_config,
    set_workflow_config,
)


class Command(BaseCommand):
    help = "Read/write runtime JSON configs for publishing workflow and compliance retention"

    def add_arguments(self, parser):
        parser.add_argument("--target", choices=["workflow", "retention"], required=True)
        parser.add_argument("--set-json", dest="set_json", default="", help="JSON payload to write config")

    def handle(self, *args, **options):
        target = options["target"]
        set_json = options["set_json"].strip()

        if set_json:
            try:
                payload = json.loads(set_json)
            except Exception as exc:
                raise CommandError(f"Invalid JSON payload: {exc}") from exc
            if target == "workflow":
                set_workflow_config(payload)
            else:
                set_retention_config(payload)
            self.stdout.write(self.style.SUCCESS(f"{target} config updated."))
            return

        payload = get_workflow_config() if target == "workflow" else get_retention_config()
        self.stdout.write(json.dumps(payload, ensure_ascii=False, indent=2))
