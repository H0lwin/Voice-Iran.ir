from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models


class SeoConfig(models.Model):
    content_type = models.ForeignKey(ContentType, verbose_name="نوع محتوا", on_delete=models.CASCADE)
    object_id = models.PositiveBigIntegerField("شناسه محتوا")
    content_object = GenericForeignKey("content_type", "object_id")
    language = models.ForeignKey(
        "localization.Language",
        verbose_name="زبان",
        on_delete=models.CASCADE,
        related_name="seo_meta_records",
    )
    meta_title = models.CharField("عنوان متا", max_length=255)
    meta_description = models.TextField("توضیحات متا", blank=True)
    canonical_url = models.URLField("لینک canonical", blank=True)
    og_title = models.CharField("عنوان OG", max_length=255, blank=True)
    og_description = models.TextField("توضیحات OG", blank=True)
    og_image = models.ImageField("تصویر OG", upload_to="seo/og/%Y/%m/%d/", null=True, blank=True)
    robots = models.CharField("دستور robots", max_length=120, default="index,follow")
    include_in_sitemap = models.BooleanField("نمایش در سایت‌مپ", default=True)
    changefreq = models.CharField("تناوب تغییر", max_length=16, default="weekly")
    priority = models.DecimalField("اولویت", max_digits=3, decimal_places=2, default=0.5)
    lastmod = models.DateTimeField("زمان آخرین تغییر", null=True, blank=True)
    schema_json = models.JSONField("داده ساختاریافته", default=dict, blank=True)
    updated_at = models.DateTimeField("زمان بروزرسانی", auto_now=True)

    class Meta:
        verbose_name = "پیکربندی سئو"
        verbose_name_plural = "پیکربندی‌های سئو"
        constraints = [
            models.UniqueConstraint(
                fields=["content_type", "object_id", "language"],
                name="uq_seoconfig_content_lang",
            )
        ]


class SeoRule(models.Model):
    pattern = models.CharField("الگوی مسیر", max_length=255)
    language = models.ForeignKey(
        "localization.Language",
        verbose_name="زبان",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="seo_rules",
    )
    title_template = models.CharField("الگوی عنوان", max_length=255, blank=True)
    description_template = models.TextField("الگوی توضیحات", blank=True)
    is_active = models.BooleanField("فعال", default=True)
    priority = models.PositiveSmallIntegerField("اولویت", default=100)

    class Meta:
        verbose_name = "قانون سئو"
        verbose_name_plural = "قوانین سئو"


class RedirectRule(models.Model):
    from_path = models.CharField("مسیر مبدا", max_length=255, unique=True)
    to_path = models.CharField("مسیر مقصد", max_length=255)
    status_code = models.PositiveSmallIntegerField("کد وضعیت", default=301)
    is_active = models.BooleanField("فعال", default=True)
    created_at = models.DateTimeField("زمان ایجاد", auto_now_add=True)

    class Meta:
        verbose_name = "قانون ریدایرکت"
        verbose_name_plural = "قوانین ریدایرکت"
