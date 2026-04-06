from __future__ import annotations

from pathlib import Path
from typing import Iterable

from accounts.models import User
from localization.models import Language


def ensure_languages() -> tuple[Language, Language]:
    fa, _ = Language.objects.get_or_create(
        code="fa",
        defaults={"name": "فارسی", "direction": Language.Direction.RTL, "is_default": True, "is_active": True},
    )
    en, _ = Language.objects.get_or_create(
        code="en",
        defaults={"name": "English", "direction": Language.Direction.LTR, "is_default": False, "is_active": True},
    )
    if not fa.is_default:
        Language.objects.exclude(pk=fa.pk).update(is_default=False)
        fa.is_default = True
        fa.save(update_fields=["is_default"])
    if not fa.is_active:
        fa.is_active = True
        fa.save(update_fields=["is_active"])
    if not en.is_active:
        en.is_active = True
        en.save(update_fields=["is_active"])
    return fa, en


def ensure_seed_user() -> User:
    user, created = User.objects.get_or_create(
        username="seed_admin",
        defaults={
            "email": "seed_admin@local.test",
            "is_staff": True,
            "is_superuser": True,
            "is_active": True,
        },
    )
    if created or not user.check_password("seed123456"):
        user.set_password("seed123456")
        user.save(update_fields=["password"])
    return user


def _external_media_dir() -> Path:
    # backend base dir: D:/code/VoiceIran/VoiceIran
    # external images: D:/code/VoiceIran/public/media/external
    return (Path(__file__).resolve().parents[4] / "public" / "media" / "external").resolve()


def ensure_media_assets(min_count: int = 20) -> list[Path]:
    external_dir = _external_media_dir()
    if not external_dir.exists():
        raise FileNotFoundError(f"External media directory not found: {external_dir}")

    image_paths = sorted(
        [p for p in external_dir.iterdir() if p.is_file() and p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}]
    )
    if not image_paths:
        raise RuntimeError(f"No image files found in: {external_dir}")

    target_count = max(min_count, 5)
    return image_paths[:target_count] if len(image_paths) >= target_count else image_paths


def pick_asset(assets: Iterable[Path], index: int) -> Path:
    assets_list = list(assets)
    if not assets_list:
        raise ValueError("No media assets were provided.")
    return assets_list[index % len(assets_list)]
