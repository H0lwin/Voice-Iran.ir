from django.contrib.auth.models import AbstractUser, Permission
from django.db import models


class Role(models.Model):
    name = models.CharField("نام نقش", max_length=120)
    code = models.SlugField("کد نقش", max_length=120, unique=True)
    description = models.TextField("توضیحات", blank=True)
    is_system = models.BooleanField("سیستمی", default=False)
    permissions = models.ManyToManyField(
        Permission,
        verbose_name="مجوزها",
        blank=True,
        related_name="custom_roles",
    )
    created_at = models.DateTimeField("زمان ایجاد", auto_now_add=True)

    class Meta:
        verbose_name = "نقش"
        verbose_name_plural = "نقش ها"

    def __str__(self) -> str:
        return self.name


class AccessProfile(models.Model):
    role = models.OneToOneField(Role, verbose_name="نقش", on_delete=models.CASCADE, related_name="access_profile")
    name = models.CharField("نام پروفایل دسترسی", max_length=120)
    can_publish = models.BooleanField("مجوز انتشار", default=False)
    can_delete = models.BooleanField("مجوز حذف", default=False)
    can_manage_users = models.BooleanField("مدیریت کاربران", default=False)
    can_view_audit = models.BooleanField("مشاهده لاگ امنیتی", default=False)
    allowed_apps = models.JSONField("اپ های مجاز", default=list, blank=True)
    created_at = models.DateTimeField("زمان ایجاد", auto_now_add=True)

    class Meta:
        verbose_name = "پروفایل دسترسی"
        verbose_name_plural = "پروفایل‌های دسترسی"

    def __str__(self) -> str:
        return self.name


class User(AbstractUser):
    phone = models.CharField("شماره موبایل", max_length=32, blank=True)
    roles = models.ManyToManyField(Role, verbose_name="نقش ها", blank=True, related_name="users")
    access_profile = models.ForeignKey(
        AccessProfile,
        verbose_name="پروفایل دسترسی",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="users",
    )
    created_at = models.DateTimeField("زمان ایجاد", auto_now_add=True)
    updated_at = models.DateTimeField("زمان بروزرسانی", auto_now=True)

    class Meta:
        verbose_name = "کاربر"
        verbose_name_plural = "کاربران"
