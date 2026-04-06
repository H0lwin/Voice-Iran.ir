from django.db import models

try:
    from simple_history.models import HistoricalRecords  # type: ignore[import-not-found]
except Exception:  # pragma: no cover
    HistoricalRecords = None


class DocumentType(models.Model):
    code = models.CharField("کد نوع", max_length=30, unique=True)
    name = models.CharField("نام", max_length=120)
    name_en = models.CharField("نام انگلیسی", max_length=120, blank=True)
    is_active = models.BooleanField("فعال", default=True)

    class Meta:
        verbose_name = "نوع مستند"
        verbose_name_plural = "انواع مستند"

    def __str__(self) -> str:
        return self.name


class DocumentCollection(models.Model):
    slug = models.SlugField("اسلاگ", max_length=160, unique=True)
    title = models.CharField("عنوان", max_length=255)
    title_en = models.CharField("عنوان انگلیسی", max_length=255, blank=True)
    description = models.TextField("توضیحات", blank=True)
    description_en = models.TextField("توضیحات انگلیسی", blank=True)
    is_public = models.BooleanField("عمومی", default=True)
    created_at = models.DateTimeField("زمان ایجاد", auto_now_add=True)

    class Meta:
        verbose_name = "مجموعه مستند"
        verbose_name_plural = "مجموعه های مستند"

    def __str__(self) -> str:
        return self.title


class Document(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "پیش نویس"
        REVIEW = "review", "در انتظار بازبینی"
        PUBLISHED = "published", "منتشر شده"
        ARCHIVED = "archived", "بایگانی"

    slug = models.SlugField("اسلاگ", max_length=180, unique=True)
    document_type = models.ForeignKey(
        DocumentType,
        verbose_name="نوع مستند",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="documents",
    )
    status = models.CharField("وضعیت", max_length=16, choices=Status.choices, default=Status.DRAFT)
    thumbnail = models.ImageField("تصویر بندانگشتی", upload_to="documents/thumbnails/%Y/%m/%d/", null=True, blank=True)
    collections = models.ManyToManyField(DocumentCollection, verbose_name="مجموعه ها", blank=True, related_name="documents")
    published_at = models.DateTimeField("زمان انتشار", null=True, blank=True)
    view_count = models.PositiveBigIntegerField("تعداد بازدید", default=0)
    download_count = models.PositiveBigIntegerField("تعداد دانلود", default=0)
    duration_seconds = models.PositiveIntegerField("مدت زمان (ثانیه)", null=True, blank=True)
    page_count = models.PositiveIntegerField("تعداد صفحات", null=True, blank=True)
    item_count = models.PositiveIntegerField("تعداد آیتم", null=True, blank=True)
    title_fa = models.CharField("عنوان فارسی", max_length=255, blank=True)
    title_en = models.CharField("عنوان انگلیسی", max_length=255, blank=True)
    description_fa = models.TextField("توضیحات فارسی", blank=True)
    description_en = models.TextField("توضیحات انگلیسی", blank=True)
    summary_fa = models.TextField("خلاصه فارسی", blank=True)
    summary_en = models.TextField("خلاصه انگلیسی", blank=True)
    meta_title_fa = models.CharField("عنوان متا فارسی", max_length=255, blank=True)
    meta_title_en = models.CharField("عنوان متا انگلیسی", max_length=255, blank=True)
    meta_description_fa = models.TextField("توضیحات متا فارسی", blank=True)
    meta_description_en = models.TextField("توضیحات متا انگلیسی", blank=True)
    is_featured = models.BooleanField("ویژه", default=False)
    created_at = models.DateTimeField("زمان ایجاد", auto_now_add=True)
    updated_at = models.DateTimeField("زمان بروزرسانی", auto_now=True)
    history = HistoricalRecords() if HistoricalRecords else None

    class Meta:
        verbose_name = "مستند"
        verbose_name_plural = "مستندات"
        indexes = [models.Index(fields=["status", "published_at"])]

    def __str__(self) -> str:
        return self.slug


class DocumentFile(models.Model):
    class FileRole(models.TextChoices):
        PRIMARY = "primary", "اصلی"
        PREVIEW = "preview", "پیش نمایش"
        SUBTITLE = "subtitle", "زیرنویس"
        ATTACHMENT = "attachment", "پیوست"

    document = models.ForeignKey(Document, verbose_name="مستند", on_delete=models.CASCADE, related_name="files")
    file = models.FileField("فایل", upload_to="documents/files/%Y/%m/%d/")
    file_role = models.CharField("نقش فایل", max_length=20, choices=FileRole.choices, default=FileRole.PRIMARY)
    language = models.ForeignKey(
        "localization.Language",
        verbose_name="زبان",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="document_files",
    )
    is_primary = models.BooleanField("فایل اصلی", default=False)
    sort_order = models.PositiveIntegerField("ترتیب نمایش", default=0)

    class Meta:
        verbose_name = "فایل مستند"
        verbose_name_plural = "فایل های مستند"
        ordering = ["sort_order", "id"]


class DocumentTimelineEvent(models.Model):
    year = models.PositiveIntegerField("سال")
    title_fa = models.CharField("عنوان فارسی", max_length=255)
    title_en = models.CharField("عنوان انگلیسی", max_length=255, blank=True)
    description_fa = models.TextField("توضیحات فارسی", blank=True)
    description_en = models.TextField("توضیحات انگلیسی", blank=True)
    sort_order = models.PositiveIntegerField("ترتیب نمایش", default=0)
    is_active = models.BooleanField("فعال", default=True)
    created_at = models.DateTimeField("زمان ایجاد", auto_now_add=True)
    updated_at = models.DateTimeField("زمان بروزرسانی", auto_now=True)

    class Meta:
        verbose_name = "رویداد تایم لاین مستندات"
        verbose_name_plural = "رویدادهای تایم لاین مستندات"
        ordering = ["-year", "sort_order", "id"]

    def __str__(self) -> str:
        return f"{self.year} - {self.title_fa}"
