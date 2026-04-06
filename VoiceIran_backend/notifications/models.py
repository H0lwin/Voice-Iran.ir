from django.conf import settings
from django.db import models


class NotificationTemplate(models.Model):
    class Channel(models.TextChoices):
        EMAIL = "email", "ایمیل"
        SMS = "sms", "پیامک"
        PUSH = "push", "پوش"
        IN_APP = "in_app", "درون برنامه"

    code = models.SlugField("کد قالب", max_length=120, unique=True)
    title_template = models.CharField("قالب عنوان", max_length=255)
    body_template = models.TextField("قالب متن")
    channel = models.CharField("کانال", max_length=20, choices=Channel.choices, default=Channel.IN_APP)
    is_active = models.BooleanField("فعال", default=True)
    updated_at = models.DateTimeField("زمان بروزرسانی", auto_now=True)

    class Meta:
        verbose_name = "قالب اعلان"
        verbose_name_plural = "قالب های اعلان"


class Notification(models.Model):
    class Channel(models.TextChoices):
        EMAIL = "email", "ایمیل"
        SMS = "sms", "پیامک"
        PUSH = "push", "پوش"
        IN_APP = "in_app", "درون برنامه"

    class Priority(models.TextChoices):
        LOW = "low", "کم"
        NORMAL = "normal", "عادی"
        HIGH = "high", "بالا"

    class Status(models.TextChoices):
        DRAFT = "draft", "پیش نویس"
        SCHEDULED = "scheduled", "زمان بندی شده"
        SENT = "sent", "ارسال شده"
        FAILED = "failed", "ناموفق"

    title = models.CharField("عنوان", max_length=255)
    body = models.TextField("متن")
    channel = models.CharField("کانال", max_length=20, choices=Channel.choices, default=Channel.IN_APP)
    priority = models.CharField("اولویت", max_length=10, choices=Priority.choices, default=Priority.NORMAL)
    status = models.CharField("وضعیت", max_length=16, choices=Status.choices, default=Status.DRAFT)
    scheduled_at = models.DateTimeField("زمان زمان بندی", null=True, blank=True)
    sent_at = models.DateTimeField("زمان ارسال", null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name="ایجادکننده",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_notifications",
    )
    recipients = models.ManyToManyField(settings.AUTH_USER_MODEL, verbose_name="گیرندگان", related_name="notifications")
    created_at = models.DateTimeField("زمان ایجاد", auto_now_add=True)

    class Meta:
        verbose_name = "اعلان"
        verbose_name_plural = "اعلان ها"

    def __str__(self) -> str:
        return self.title
