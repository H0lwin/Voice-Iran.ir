from django.conf import settings
from django.db import models

try:
    from simple_history.models import HistoricalRecords  # type: ignore[import-not-found]
except Exception:  # pragma: no cover
    HistoricalRecords = None


class Post(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "پیش نویس"
        REVIEW = "review", "در انتظار بازبینی"
        PUBLISHED = "published", "منتشر شده"
        ARCHIVED = "archived", "بایگانی"

    slug = models.SlugField("اسلاگ", max_length=180, unique=True)
    status = models.CharField("وضعیت", max_length=16, choices=Status.choices, default=Status.DRAFT)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name="نویسنده",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="posts",
    )
    cover_image = models.ImageField("تصویر کاور", upload_to="news/covers/%Y/%m/%d/", null=True, blank=True)
    categories = models.ManyToManyField(
        "taxonomy.Term",
        verbose_name="دسته ها",
        blank=True,
        related_name="posts_as_category",
        limit_choices_to={"type": "category"},
    )
    tags = models.ManyToManyField(
        "taxonomy.Term",
        verbose_name="برچسب ها",
        blank=True,
        related_name="posts_as_tag",
        limit_choices_to={"type": "tag"},
    )
    title_fa = models.CharField("عنوان فارسی", max_length=255, blank=True)
    title_en = models.CharField("عنوان انگلیسی", max_length=255, blank=True)
    excerpt_fa = models.TextField("خلاصه کوتاه فارسی", blank=True)
    excerpt_en = models.TextField("خلاصه کوتاه انگلیسی", blank=True)
    summary_fa = models.TextField("خلاصه فارسی", blank=True)
    summary_en = models.TextField("خلاصه انگلیسی", blank=True)
    content_fa = models.TextField("متن فارسی", blank=True)
    content_en = models.TextField("متن انگلیسی", blank=True)
    reading_time_minutes = models.PositiveSmallIntegerField("زمان مطالعه (دقیقه)", default=1)
    meta_title_fa = models.CharField("عنوان متا فارسی", max_length=255, blank=True)
    meta_title_en = models.CharField("عنوان متا انگلیسی", max_length=255, blank=True)
    meta_description_fa = models.TextField("توضیحات متا فارسی", blank=True)
    meta_description_en = models.TextField("توضیحات متا انگلیسی", blank=True)
    is_featured = models.BooleanField("ویژه", default=False)
    is_live = models.BooleanField("خبر زنده", default=False)
    published_at = models.DateTimeField("زمان انتشار", null=True, blank=True)
    view_count = models.PositiveBigIntegerField("تعداد بازدید", default=0)
    created_at = models.DateTimeField("زمان ایجاد", auto_now_add=True)
    updated_at = models.DateTimeField("زمان بروزرسانی", auto_now=True)
    deleted_at = models.DateTimeField("زمان حذف نرم", null=True, blank=True)
    history = HistoricalRecords() if HistoricalRecords else None

    class Meta:
        verbose_name = "خبر"
        verbose_name_plural = "اخبار"
        indexes = [models.Index(fields=["status", "published_at"]), models.Index(fields=["is_featured"])]

    def __str__(self) -> str:
        return self.slug


class NewsTrendingTerm(models.Model):
    slug = models.SlugField("اسلاگ", max_length=160, unique=True)
    label_fa = models.CharField("برچسب فارسی", max_length=120)
    label_en = models.CharField("برچسب انگلیسی", max_length=120, blank=True)
    weight = models.PositiveIntegerField("وزن", default=0)
    is_active = models.BooleanField("فعال", default=True)
    created_at = models.DateTimeField("زمان ایجاد", auto_now_add=True)
    updated_at = models.DateTimeField("زمان بروزرسانی", auto_now=True)

    class Meta:
        verbose_name = "عبارت ترند اخبار"
        verbose_name_plural = "عبارات ترند اخبار"
        ordering = ["-weight", "id"]

    def __str__(self) -> str:
        return self.label_fa


class PostBookmark(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name="کاربر",
        on_delete=models.CASCADE,
        related_name="post_bookmarks",
    )
    post = models.ForeignKey(Post, verbose_name="خبر", on_delete=models.CASCADE, related_name="bookmarks")
    created_at = models.DateTimeField("زمان ایجاد", auto_now_add=True)

    class Meta:
        verbose_name = "نشانک خبر"
        verbose_name_plural = "نشانک های خبر"
        constraints = [models.UniqueConstraint(fields=["user", "post"], name="unique_post_bookmark")]

    def __str__(self) -> str:
        return f"{self.user_id}:{self.post_id}"
