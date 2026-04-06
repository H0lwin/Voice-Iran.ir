from typing import Optional


def resolve_language_code(raw_lang: Optional[str], default: str = "fa") -> str:
    if not raw_lang:
        return default
    code = raw_lang.strip().lower()
    if code in {"fa", "en"}:
        return code
    return default


def get_translation_for_language(obj, lang_code: str):
    # Backward-compatible helper for legacy callers.
    # New models store localized fields directly on the source model.
    class TranslationProxy:
        pass

    proxy = TranslationProxy()
    is_en = lang_code == "en"
    setattr(proxy, "title", getattr(obj, "title_en" if is_en else "title_fa", ""))
    setattr(proxy, "excerpt", getattr(obj, "excerpt_en" if is_en else "excerpt_fa", ""))
    setattr(proxy, "summary", getattr(obj, "summary_en" if is_en else "summary_fa", ""))
    setattr(proxy, "content", getattr(obj, "content_en" if is_en else "content_fa", ""))
    setattr(proxy, "name", getattr(obj, "name_en" if is_en else "name_fa", ""))
    setattr(proxy, "description", getattr(obj, "description_en" if is_en else "description_fa", ""))
    setattr(proxy, "title_label", getattr(obj, "title_en" if is_en else "title_fa", ""))
    return proxy
