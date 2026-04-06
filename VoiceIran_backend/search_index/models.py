from django.db import models


class SearchDocument(models.Model):
    class SourceType(models.TextChoices):
        POST = "post", "خبر"
        WEAPON = "weapon", "تسلیح"
        MARTYR = "martyr", "شهید"
        DOCUMENT = "document", "مستند"

    source_type = models.CharField("نوع منبع", max_length=20, choices=SourceType.choices)
    source_id = models.PositiveBigIntegerField("شناسه منبع")
    language = models.ForeignKey(
        "localization.Language",
        verbose_name="زبان",
        on_delete=models.CASCADE,
        related_name="search_documents",
    )
    title = models.CharField("عنوان", max_length=255)
    excerpt = models.TextField("خلاصه", blank=True)
    body = models.TextField("متن", blank=True)
    category = models.CharField("دسته", max_length=120, blank=True)
    tags = models.JSONField("برچسب ها", default=list, blank=True)
    published_at = models.DateTimeField("زمان انتشار", null=True, blank=True)
    is_public = models.BooleanField("عمومی", default=True)
    updated_at = models.DateTimeField("زمان بروزرسانی", auto_now=True)

    class Meta:
        verbose_name = "سند جستجو"
        verbose_name_plural = "اسناد جستجو"
        indexes = [
            models.Index(fields=["source_type", "source_id", "language"]),
            models.Index(fields=["is_public", "published_at"]),
        ]


class PopularSearchTerm(models.Model):
    class TermType(models.TextChoices):
        NEWS = "news", "ترند اخبار"
        SEARCH = "search", "جستجوی محبوب"

    slug = models.SlugField("اسلاگ", max_length=160, unique=True)
    label_fa = models.CharField("عبارت فارسی", max_length=120)
    label_en = models.CharField("عبارت انگلیسی", max_length=120, blank=True)
    term_type = models.CharField("نوع عبارت", max_length=16, choices=TermType.choices, default=TermType.SEARCH)
    weight = models.PositiveIntegerField("وزن", default=0)
    is_active = models.BooleanField("فعال", default=True)
    created_at = models.DateTimeField("زمان ایجاد", auto_now_add=True)
    updated_at = models.DateTimeField("زمان بروزرسانی", auto_now=True)

    class Meta:
        verbose_name = "عبارت جستجوی پرطرفدار"
        verbose_name_plural = "عبارات جستجوی پرطرفدار"
        ordering = ["-weight", "id"]

    def __str__(self) -> str:
        return self.label_fa
