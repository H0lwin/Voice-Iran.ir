from __future__ import annotations

import json
from pathlib import Path

from django.conf import settings


CONFIG_DIR = Path(settings.BASE_DIR) / "runtime_data" / "config"
WORKFLOW_FILE = CONFIG_DIR / "publishing_workflow.json"
RETENTION_FILE = CONFIG_DIR / "compliance_retention.json"


DEFAULT_WORKFLOW = {
    "workflows": [
        {
            "name": "default",
            "content_type_label": "generic",
            "is_default": True,
            "is_active": True,
            "steps": [
                {"name": "draft", "order": 1, "required_role": "editor", "is_mandatory": True},
                {"name": "publish", "order": 2, "required_role": "admin", "is_mandatory": True},
            ],
        }
    ]
}

DEFAULT_RETENTION = {
    "rules": [
        {"data_domain": "audit_events", "retention_days": 365, "delete_strategy": "hard_delete", "is_active": True},
        {"data_domain": "search_queries", "retention_days": 180, "delete_strategy": "truncate_ip_hash", "is_active": True},
    ]
}


def _ensure_dir() -> None:
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)


def _read_json(path: Path, default: dict) -> dict:
    _ensure_dir()
    if not path.exists():
        path.write_text(json.dumps(default, ensure_ascii=False, indent=2), encoding="utf-8")
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return default


def _write_json(path: Path, payload: dict) -> None:
    _ensure_dir()
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def get_workflow_config() -> dict:
    return _read_json(WORKFLOW_FILE, DEFAULT_WORKFLOW)


def set_workflow_config(payload: dict) -> None:
    _write_json(WORKFLOW_FILE, payload)


def get_retention_config() -> dict:
    return _read_json(RETENTION_FILE, DEFAULT_RETENTION)


def set_retention_config(payload: dict) -> None:
    _write_json(RETENTION_FILE, payload)
