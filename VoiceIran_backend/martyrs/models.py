from django.db import models

try:
    from simple_history.models import HistoricalRecords  # type: ignore[import-not-found]
except Exception:  # pragma: no cover
    HistoricalRecords = None


class MartyrUnit(models.Model):
    slug = models.SlugField("اسلاگ", max_length=160, unique=True)
    name = models.CharField("نام", max_length=150)
    name_en = models.CharField("نام انگلیسی", max_length=150, blank=True)
    is_active = models.BooleanField("فعال", default=True)

    class Meta:
        verbose_name = "یگان شهید"
        verbose_name_plural = "یگان های شهدا"

    def __str__(self) -> str:
        return self.name


class Martyr(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "پیش نویس"
        REVIEW = "review", "در انتظار بازبینی"
        PUBLISHED = "published", "منتشر شده"
        ARCHIVED = "archived", "بایگانی"

    slug = models.SlugField("اسلاگ", max_length=180, unique=True)
    unit = models.ForeignKey(
        MartyrUnit,
        verbose_name="یگان",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="martyrs",
    )
    profile_image = models.ImageField("تصویر پروفایل", upload_to="martyrs/profiles/%Y/%m/%d/", null=True, blank=True)
    birth_date = models.DateField("تاریخ تولد", null=True, blank=True)
    martyrdom_date = models.DateField("تاریخ شهادت", null=True, blank=True)
    martyrdom_location = models.CharField("محل شهادت", max_length=255, blank=True)
    name_fa = models.CharField("نام فارسی", max_length=255, blank=True)
    name_en = models.CharField("نام انگلیسی", max_length=255, blank=True)
    title_fa = models.CharField("عنوان فارسی", max_length=255, blank=True)
    title_en = models.CharField("عنوان انگلیسی", max_length=255, blank=True)
    biography_fa = models.TextField("زندگی نامه فارسی", blank=True)
    biography_en = models.TextField("زندگی نامه انگلیسی", blank=True)
    short_bio_fa = models.TextField("خلاصه زندگی نامه فارسی", blank=True)
    short_bio_en = models.TextField("خلاصه زندگی نامه انگلیسی", blank=True)
    meta_title_fa = models.CharField("عنوان متا فارسی", max_length=255, blank=True)
    meta_title_en = models.CharField("عنوان متا انگلیسی", max_length=255, blank=True)
    meta_description_fa = models.TextField("توضیحات متا فارسی", blank=True)
    meta_description_en = models.TextField("توضیحات متا انگلیسی", blank=True)
    status = models.CharField("وضعیت", max_length=16, choices=Status.choices, default=Status.DRAFT)
    is_featured = models.BooleanField("ویژه", default=False)
    published_at = models.DateTimeField("زمان انتشار", null=True, blank=True)
    created_at = models.DateTimeField("زمان ایجاد", auto_now_add=True)
    updated_at = models.DateTimeField("زمان بروزرسانی", auto_now=True)
    history = HistoricalRecords() if HistoricalRecords else None

    class Meta:
        verbose_name = "شهید"
        verbose_name_plural = "شهدا"
        indexes = [models.Index(fields=["status", "published_at"])]

    def __str__(self) -> str:
        return self.slug


class MartyrAchievement(models.Model):
    martyr = models.ForeignKey(Martyr, verbose_name="شهید", on_delete=models.CASCADE, related_name="achievements")
    title = models.CharField("عنوان", max_length=255)
    title_en = models.CharField("عنوان انگلیسی", max_length=255, blank=True)
    description = models.TextField("توضیحات", blank=True)
    description_en = models.TextField("توضیحات انگلیسی", blank=True)
    sort_order = models.PositiveIntegerField("ترتیب نمایش", default=0)

    class Meta:
        verbose_name = "دستاورد شهید"
        verbose_name_plural = "دستاوردهای شهدا"
        ordering = ["sort_order", "id"]
