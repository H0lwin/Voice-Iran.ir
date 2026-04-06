from __future__ import annotations

import json
import re
from pathlib import Path

from django.conf import settings

from taxonomy.models import Term


def _tokenize(text: str) -> list[str]:
    if not text:
        return []
    tokens = re.findall(r"[A-Za-z\u0600-\u06FF0-9]{3,}", text)
    return [tok.strip().lower() for tok in tokens if tok.strip()]


def _synonyms_config_path() -> Path:
    return Path(settings.BASE_DIR) / "runtime_data" / "config" / "search_synonyms.json"


def _documents_index_path() -> Path:
    return Path(settings.BASE_DIR) / "runtime_data" / "search_index" / "documents.json"


def _read_synonyms_config() -> dict:
    path = _synonyms_config_path()
    if not path.exists():
        return {"fa": {}, "en": {}}
    return json.loads(path.read_text(encoding="utf-8"))


def _read_documents_index() -> list[dict]:
    path = _documents_index_path()
    if not path.exists():
        return []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return []
    return data if isinstance(data, list) else []


def _write_documents_index(rows: list[dict]) -> None:
    path = _documents_index_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")


def upsert_document_index_row(
    *,
    source_type: str,
    source_id: int,
    language_code: str,
    title: str,
    excerpt: str = "",
    body: str = "",
    is_public: bool = True,
) -> None:
    rows = _read_documents_index()
    key = (source_type, int(source_id), language_code)
    updated = False
    for row in rows:
        if (row.get("source_type"), int(row.get("source_id", 0)), row.get("language")) == key:
            row.update(
                {
                    "title": title or "",
                    "excerpt": excerpt or "",
                    "body": body or "",
                    "is_public": bool(is_public),
                }
            )
            updated = True
            break
    if not updated:
        rows.append(
            {
                "source_type": source_type,
                "source_id": int(source_id),
                "language": language_code,
                "title": title or "",
                "excerpt": excerpt or "",
                "body": body or "",
                "is_public": bool(is_public),
            }
        )
    _write_documents_index(rows)


def sync_synonyms_from_text(language_code: str, text: str) -> None:
    # Synonyms are config-driven; this function is kept as a no-op entry point.
    _ = language_code, _tokenize(text)


def sync_synonyms_from_tags() -> dict:
    config = _read_synonyms_config()
    for term in Term.objects.filter(type=Term.TermType.TAG, is_active=True):
        if term.name:
            config.setdefault("fa", {}).setdefault(term.name.lower(), [term.name.lower()])
        if term.name_en:
            config.setdefault("en", {}).setdefault(term.name_en.lower(), [term.name_en.lower()])
    return config
