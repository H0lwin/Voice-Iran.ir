from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models

try:
    from simple_history.models import HistoricalRecords  # type: ignore[import-not-found]
except Exception:  # pragma: no cover
    HistoricalRecords = None

class PublishSchedule(models.Model):
    class ScheduleStatus(models.TextChoices):
        PENDING = "pending", "در انتظار"
        DONE = "done", "انجام شده"
        CANCELLED = "cancelled", "لغو شده"

    content_type = models.ForeignKey(ContentType, verbose_name="نوع محتوا", on_delete=models.CASCADE)
    object_id = models.PositiveBigIntegerField("شناسه محتوا")
    content_object = GenericForeignKey("content_type", "object_id")
    scheduled_at = models.DateTimeField("زمان برنامه ریزی")
    status = models.CharField("وضعیت", max_length=16, choices=ScheduleStatus.choices, default=ScheduleStatus.PENDING)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name="ایجادکننده",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="publish_schedules",
    )
    executed_at = models.DateTimeField("زمان اجرا", null=True, blank=True)
    celery_task_name = models.CharField("نام تسک Celery Beat", max_length=255, blank=True)
    history = HistoricalRecords() if HistoricalRecords else None

    class Meta:
        verbose_name = "برنامه انتشار"
        verbose_name_plural = "برنامه های انتشار"
        indexes = [models.Index(fields=["status", "scheduled_at"])]
