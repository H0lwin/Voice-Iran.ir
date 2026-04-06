from django.db import models

try:
    from simple_history.models import HistoricalRecords  # type: ignore[import-not-found]
except Exception:  # pragma: no cover
    HistoricalRecords = None


class Weapon(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "پیش نویس"
        REVIEW = "review", "در انتظار بازبینی"
        PUBLISHED = "published", "منتشر شده"
        ARCHIVED = "archived", "بایگانی"

    slug = models.SlugField("اسلاگ", max_length=180, unique=True)
    status = models.CharField("وضعیت", max_length=16, choices=Status.choices, default=Status.DRAFT)
    category = models.ForeignKey(
        "taxonomy.Term",
        verbose_name="دسته",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="weapons",
        limit_choices_to={"type": "category"},
    )
    cover_image = models.ImageField("تصویر کاور", upload_to="arsenal/covers/%Y/%m/%d/", null=True, blank=True)
    range_km = models.DecimalField("برد (کیلومتر)", max_digits=8, decimal_places=2, null=True, blank=True)
    name_fa = models.CharField("نام فارسی", max_length=255, blank=True)
    name_en = models.CharField("نام انگلیسی", max_length=255, blank=True)
    type_label_fa = models.CharField("نوع فارسی", max_length=255, blank=True)
    type_label_en = models.CharField("نوع انگلیسی", max_length=255, blank=True)
    category_label_fa = models.CharField("برچسب دسته فارسی", max_length=255, blank=True)
    category_label_en = models.CharField("برچسب دسته انگلیسی", max_length=255, blank=True)
    description_fa = models.TextField("توضیحات فارسی", blank=True)
    description_en = models.TextField("توضیحات انگلیسی", blank=True)
    summary_fa = models.TextField("خلاصه فارسی", blank=True)
    summary_en = models.TextField("خلاصه انگلیسی", blank=True)
    meta_title_fa = models.CharField("عنوان متا فارسی", max_length=255, blank=True)
    meta_title_en = models.CharField("عنوان متا انگلیسی", max_length=255, blank=True)
    meta_description_fa = models.TextField("توضیحات متا فارسی", blank=True)
    meta_description_en = models.TextField("توضیحات متا انگلیسی", blank=True)
    is_featured = models.BooleanField("ویژه", default=False)
    published_at = models.DateTimeField("زمان انتشار", null=True, blank=True)
    created_at = models.DateTimeField("زمان ایجاد", auto_now_add=True)
    updated_at = models.DateTimeField("زمان بروزرسانی", auto_now=True)
    history = HistoricalRecords() if HistoricalRecords else None

    class Meta:
        verbose_name = "تسلیح"
        verbose_name_plural = "تسلیحات"
        indexes = [models.Index(fields=["status", "published_at"])]

    def __str__(self) -> str:
        return self.slug


class WeaponSpecification(models.Model):
    weapon = models.ForeignKey(Weapon, verbose_name="تسلیح", on_delete=models.CASCADE, related_name="specs")
    key = models.CharField("کلید مشخصه", max_length=100)
    value = models.CharField("مقدار", max_length=255)
    unit = models.CharField("واحد", max_length=50, blank=True)
    sort_order = models.PositiveIntegerField("ترتیب نمایش", default=0)
    is_public = models.BooleanField("عمومی", default=True)

    class Meta:
        verbose_name = "مشخصه تسلیح"
        verbose_name_plural = "مشخصه های تسلیحات"
        ordering = ["sort_order", "id"]
