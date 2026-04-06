from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models


class PageView(models.Model):
    content_type = models.ForeignKey(ContentType, verbose_name="نوع محتوا", on_delete=models.CASCADE)
    object_id = models.PositiveBigIntegerField("شناسه محتوا")
    content_object = GenericForeignKey("content_type", "object_id")
    language = models.ForeignKey(
        "localization.Language",
        verbose_name="زبان",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="page_views",
    )
    source = models.CharField("منبع", max_length=120, blank=True)
    device = models.CharField("دستگاه", max_length=60, blank=True)
    country = models.CharField("کشور", max_length=80, blank=True)
    viewed_at = models.DateTimeField("زمان مشاهده", auto_now_add=True)

    class Meta:
        verbose_name = "بازدید صفحه"
        verbose_name_plural = "بازدید صفحات"
        indexes = [models.Index(fields=["viewed_at"])]
