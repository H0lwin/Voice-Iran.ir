from django.conf import settings
from django.db import models


class ApiClient(models.Model):
    class ClientType(models.TextChoices):
        FRONTEND = "frontend", "فرانت اند"
        INTERNAL = "internal", "داخلی"
        PARTNER = "partner", "همکار"

    name = models.CharField("نام کلاینت", max_length=150)
    client_type = models.CharField("نوع کلاینت", max_length=20, choices=ClientType.choices, default=ClientType.FRONTEND)
    is_active = models.BooleanField("فعال", default=True)
    allowed_origins = models.JSONField("مبداهای مجاز", default=list, blank=True)
    owners = models.ManyToManyField(settings.AUTH_USER_MODEL, verbose_name="مالک ها", blank=True, related_name="api_clients")
    created_at = models.DateTimeField("زمان ایجاد", auto_now_add=True)

    class Meta:
        verbose_name = "کلاینت API"
        verbose_name_plural = "کلاینت های API"

    def __str__(self) -> str:
        return self.name


class ApiKey(models.Model):
    client = models.ForeignKey(ApiClient, verbose_name="کلاینت", on_delete=models.CASCADE, related_name="api_keys")
    key_prefix = models.CharField("پیشوند کلید", max_length=20)
    hashed_key = models.CharField("کلید هش شده", max_length=255)
    expires_at = models.DateTimeField("تاریخ انقضا", null=True, blank=True)
    is_active = models.BooleanField("فعال", default=True)
    created_at = models.DateTimeField("زمان ایجاد", auto_now_add=True)
    last_used_at = models.DateTimeField("آخرین استفاده", null=True, blank=True)

    class Meta:
        verbose_name = "کلید API"
        verbose_name_plural = "کلیدهای API"


class ApiRateLimit(models.Model):
    client = models.ForeignKey(ApiClient, verbose_name="کلاینت", on_delete=models.CASCADE, related_name="rate_limits")
    scope = models.CharField("دامنه", max_length=120, default="default")
    limit_per_minute = models.PositiveIntegerField("محدودیت در دقیقه", default=60)
    limit_per_day = models.PositiveIntegerField("محدودیت روزانه", default=10000)
    burst_limit = models.PositiveIntegerField("حداکثر لحظه ای", default=30)
    is_active = models.BooleanField("فعال", default=True)

    class Meta:
        verbose_name = "محدودیت نرخ API"
        verbose_name_plural = "محدودیت های نرخ API"
        constraints = [models.UniqueConstraint(fields=["client", "scope"], name="uq_client_scope_rate")]
