from django.db import models


class Language(models.Model):
    class Direction(models.TextChoices):
        RTL = "rtl", "راست به چپ"
        LTR = "ltr", "چپ به راست"

    code = models.CharField("کد زبان", max_length=5, unique=True)
    name = models.CharField("نام زبان", max_length=80)
    is_default = models.BooleanField("پیش فرض", default=False)
    is_active = models.BooleanField("فعال", default=True)
    direction = models.CharField("جهت نوشتار", max_length=3, choices=Direction.choices, default=Direction.RTL)
    date_format = models.CharField("فرمت تاریخ", max_length=64, default="%Y-%m-%d")
    number_format = models.CharField("فرمت عدد", max_length=64, default="#,##0.###")
    calendar_system = models.CharField("نوع تقویم", max_length=32, default="gregorian")
    fallback_language = models.ForeignKey(
        "self",
        verbose_name="زبان جایگزین",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="fallback_for_languages",
    )
    created_at = models.DateTimeField("زمان ایجاد", auto_now_add=True)

    class Meta:
        verbose_name = "زبان"
        verbose_name_plural = "زبان ها"

    def __str__(self) -> str:
        return f"{self.name} ({self.code})"


class LanguageConfig(models.Model):
    """
    Deprecated compatibility model.
    Use fields on Language directly.
    """
    language = models.OneToOneField(
        Language,
        verbose_name="زبان",
        on_delete=models.CASCADE,
        related_name="language_config",
    )
    date_format = models.CharField("فرمت تاریخ", max_length=64, default="%Y-%m-%d")
    number_format = models.CharField("فرمت عدد", max_length=64, default="#,##0.###")
    calendar_system = models.CharField("نوع تقویم", max_length=32, default="gregorian")
    fallback_language = models.ForeignKey(
        Language,
        verbose_name="زبان جایگزین",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="fallback_for",
    )

    class Meta:
        verbose_name = "پیکربندی زبان"
        verbose_name_plural = "پیکربندی‌های زبان"


class UnifiedTranslation(models.Model):
    source_type = models.CharField("نوع منبع", max_length=40)
    source_id = models.PositiveBigIntegerField("شناسه منبع")
    language = models.ForeignKey(
        Language,
        verbose_name="زبان",
        on_delete=models.CASCADE,
        related_name="unified_translations",
    )
    title = models.CharField("عنوان", max_length=255, blank=True)
    excerpt = models.TextField("خلاصه کوتاه", blank=True)
    summary = models.TextField("خلاصه", blank=True)
    content = models.TextField("متن", blank=True)
    extra = models.JSONField("فیلدهای اضافی", default=dict, blank=True)
    updated_at = models.DateTimeField("زمان بروزرسانی", auto_now=True)

    class Meta:
        verbose_name = "ترجمه یکپارچه"
        verbose_name_plural = "ترجمه‌های یکپارچه"
        constraints = [
            models.UniqueConstraint(
                fields=["source_type", "source_id", "language"],
                name="uq_unified_translation_source_language",
            )
        ]
        indexes = [models.Index(fields=["source_type", "source_id"])]
