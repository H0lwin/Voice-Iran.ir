from django.db import models

try:
    from simple_history.models import HistoricalRecords  # type: ignore[import-not-found]
except Exception:  # pragma: no cover
    HistoricalRecords = None


class Achievement(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "پیش نویس"
        REVIEW = "review", "در انتظار بازبینی"
        PUBLISHED = "published", "منتشر شده"
        ARCHIVED = "archived", "بایگانی"

    class TargetType(models.TextChoices):
        DRONE = "drone", "پهپاد"
        MISSILE = "missile", "موشک"
        AIRCRAFT = "aircraft", "هواپیما"
        SHIP = "ship", "کشتی"
        INFRASTRUCTURE = "infrastructure", "زیرساخت"

    class VerificationStatus(models.TextChoices):
        OFFICIAL = "official", "رسمی"
        DOCUMENTED = "documented", "مستند"
        CLAIMED = "claimed", "ادعایی"

    slug = models.SlugField("اسلاگ", max_length=180, unique=True)
    status = models.CharField("وضعیت", max_length=16, choices=Status.choices, default=Status.DRAFT)
    martyr = models.ForeignKey(
        "martyrs.Martyr",
        verbose_name="شهید مرتبط",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="linked_achievements",
    )
    cover_image = models.ImageField("تصویر کاور", upload_to="achievements/covers/%Y/%m/%d/", null=True, blank=True)
    title_fa = models.CharField("عنوان فارسی", max_length=255, blank=True)
    title_en = models.CharField("عنوان انگلیسی", max_length=255, blank=True)
    excerpt_fa = models.TextField("خلاصه کوتاه فارسی", blank=True)
    excerpt_en = models.TextField("خلاصه کوتاه انگلیسی", blank=True)
    summary_fa = models.TextField("خلاصه فارسی", blank=True)
    summary_en = models.TextField("خلاصه انگلیسی", blank=True)
    content_fa = models.TextField("متن فارسی", blank=True)
    content_en = models.TextField("متن انگلیسی", blank=True)
    meta_title_fa = models.CharField("عنوان متا فارسی", max_length=255, blank=True)
    meta_title_en = models.CharField("عنوان متا انگلیسی", max_length=255, blank=True)
    meta_description_fa = models.TextField("توضیحات متا فارسی", blank=True)
    meta_description_en = models.TextField("توضیحات متا انگلیسی", blank=True)
    target_type = models.CharField("نوع هدف", max_length=32, choices=TargetType.choices, default=TargetType.DRONE)
    region_fa = models.CharField("منطقه فارسی", max_length=255, blank=True)
    region_en = models.CharField("منطقه انگلیسی", max_length=255, blank=True)
    destroyed_targets_count = models.PositiveIntegerField("تعداد اهداف نابود شده", default=0)
    strategic_gain_count = models.PositiveIntegerField("شاخص دستاورد", default=0)
    verification_status = models.CharField(
        "وضعیت تایید",
        max_length=16,
        choices=VerificationStatus.choices,
        default=VerificationStatus.DOCUMENTED,
    )
    is_featured = models.BooleanField("ویژه", default=False)
    published_at = models.DateTimeField("زمان انتشار", null=True, blank=True)
    view_count = models.PositiveBigIntegerField("تعداد بازدید", default=0)
    created_at = models.DateTimeField("زمان ایجاد", auto_now_add=True)
    updated_at = models.DateTimeField("زمان بروزرسانی", auto_now=True)
    history = HistoricalRecords() if HistoricalRecords else None

    class Meta:
        verbose_name = "دستاورد"
        verbose_name_plural = "دستاوردها"
        indexes = [models.Index(fields=["status", "published_at"]), models.Index(fields=["is_featured"])]

    def __str__(self) -> str:
        return self.slug
