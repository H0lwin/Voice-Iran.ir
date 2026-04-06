from django.conf import settings
from django.db import models


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField("زمان ایجاد", auto_now_add=True)
    updated_at = models.DateTimeField("زمان بروزرسانی", auto_now=True)

    class Meta:
        abstract = True


class SiteSetting(TimeStampedModel):
    site_name = models.CharField("نام سایت", max_length=200)
    site_name_en = models.CharField("نام انگلیسی سایت", max_length=200, blank=True)
    default_language = models.CharField("زبان پیش فرض", max_length=5, default="fa")
    timezone = models.CharField("منطقه زمانی", max_length=64, default="Asia/Tehran")
    is_maintenance_mode = models.BooleanField("حالت نگهداری", default=False)
    maintenance_message = models.TextField("پیام نگهداری", blank=True)

    class Meta:
        verbose_name = "تنظیم سایت"
        verbose_name_plural = "تنظیمات سایت"

    def __str__(self) -> str:
        return self.site_name


class HomePageContent(TimeStampedModel):
    hero_title_fa = models.CharField("عنوان هیرو فارسی", max_length=255, default="صدای ایران")
    hero_title_en = models.CharField("عنوان هیرو انگلیسی", max_length=255, blank=True, default="Voice of Iran")
    hero_live_badge_fa = models.CharField("برچسب زنده هیرو فارسی", max_length=100, default="زنده")
    hero_live_badge_en = models.CharField("برچسب زنده هیرو انگلیسی", max_length=100, blank=True, default="LIVE")
    hero_description_fa = models.TextField(
        "توضیح هیرو فارسی",
        default="روایت مستند از شهدا، اخبار، تسلیحات و آرشیو اسناد.",
    )
    hero_description_en = models.TextField(
        "توضیح هیرو انگلیسی",
        blank=True,
        default="Documented narratives of martyrs, news, weapons, and archive collections.",
    )
    hero_primary_action_fa = models.CharField("دکمه اصلی هیرو فارسی", max_length=120, default="تماشای گزارش")
    hero_primary_action_en = models.CharField("دکمه اصلی هیرو انگلیسی", max_length=120, blank=True, default="Watch Report")
    hero_secondary_action_fa = models.CharField("دکمه ثانویه هیرو فارسی", max_length=120, default="اطلاعات بیشتر")
    hero_secondary_action_en = models.CharField(
        "دکمه ثانویه هیرو انگلیسی", max_length=120, blank=True, default="Learn More"
    )
    hero_background_image = models.URLField(
        "تصویر پس زمینه هیرو",
        blank=True,
        default="/images/placeholder-media.svg",
    )
    latest_news_title_fa = models.CharField("عنوان بخش خبر فارسی", max_length=255, default="آخرین اخبار")
    latest_news_title_en = models.CharField("عنوان بخش خبر انگلیسی", max_length=255, blank=True, default="Latest News")
    live_stats_title_fa = models.CharField("عنوان آمار فارسی", max_length=255, default="آمار لحظه‌ای")
    live_stats_title_en = models.CharField("عنوان آمار انگلیسی", max_length=255, blank=True, default="Live Stats")
    operations_label_fa = models.CharField("برچسب عملیات فارسی", max_length=120, default="عملیات موفق")
    operations_label_en = models.CharField("برچسب عملیات انگلیسی", max_length=120, blank=True, default="Successful Operations")
    operations_value = models.PositiveIntegerField("عدد عملیات", default=847)
    intercepted_label_fa = models.CharField("برچسب رهگیری فارسی", max_length=120, default="اهداف رهگیری‌شده")
    intercepted_label_en = models.CharField("برچسب رهگیری انگلیسی", max_length=120, blank=True, default="Intercepted Targets")
    intercepted_value = models.PositiveIntegerField("عدد رهگیری", default=2341)
    drills_label_fa = models.CharField("برچسب رزمایش فارسی", max_length=120, default="رزمایش‌ها")
    drills_label_en = models.CharField("برچسب رزمایش انگلیسی", max_length=120, blank=True, default="Drills")
    drills_value = models.PositiveIntegerField("عدد رزمایش", default=156)
    featured_weapons_title_fa = models.CharField("عنوان بخش تسلیحات فارسی", max_length=255, default="تسلیحات ویژه")
    featured_weapons_title_en = models.CharField(
        "عنوان بخش تسلیحات انگلیسی", max_length=255, blank=True, default="Featured Weapons"
    )
    featured_documents_title_fa = models.CharField("عنوان بخش مستندات فارسی", max_length=255, default="مستندات ویژه")
    featured_documents_title_en = models.CharField(
        "عنوان بخش مستندات انگلیسی", max_length=255, blank=True, default="Featured Documents"
    )
    featured_martyrs_title_fa = models.CharField("عنوان بخش شهدا فارسی", max_length=255, default="شهدای ویژه")
    featured_martyrs_title_en = models.CharField(
        "عنوان بخش شهدا انگلیسی", max_length=255, blank=True, default="Featured Martyrs"
    )
    martyrs_quote_fa = models.CharField(
        "نقل قول شهدا فارسی",
        max_length=255,
        default="«و لا تحسبن الذین قتلوا فی سبیل الله امواتا بل احیاء»",
    )
    martyrs_quote_en = models.CharField(
        "نقل قول شهدا انگلیسی",
        max_length=255,
        blank=True,
        default='"Do not consider those slain in God\'s way as dead; they are alive."',
    )
    view_all_label_fa = models.CharField("برچسب مشاهده همه فارسی", max_length=100, default="مشاهده همه")
    view_all_label_en = models.CharField("برچسب مشاهده همه انگلیسی", max_length=100, blank=True, default="View all")
    empty_label_fa = models.CharField("برچسب خالی فارسی", max_length=150, default="موردی برای نمایش وجود ندارد.")
    empty_label_en = models.CharField(
        "برچسب خالی انگلیسی",
        max_length=150,
        blank=True,
        default="No items are available.",
    )
    is_active = models.BooleanField("فعال", default=True)

    class Meta:
        verbose_name = "محتوای صفحه اصلی"
        verbose_name_plural = "محتواهای صفحه اصلی"

    def __str__(self) -> str:
        return self.hero_title_fa


class LiveStat(TimeStampedModel):
    key = models.SlugField("کلید", max_length=64, unique=True)
    label_fa = models.CharField("عنوان فارسی", max_length=120)
    label_en = models.CharField("عنوان انگلیسی", max_length=120, blank=True)
    value = models.PositiveIntegerField("مقدار", default=0)
    icon_key = models.CharField("کلید آیکن", max_length=64, blank=True, default="")
    sort_order = models.PositiveIntegerField("ترتیب نمایش", default=0)
    is_active = models.BooleanField("فعال", default=True)

    class Meta:
        verbose_name = "آمار لحظه‌ای"
        verbose_name_plural = "آمارهای لحظه‌ای"
        ordering = ["sort_order", "id"]

    def __str__(self) -> str:
        return self.label_fa


class OrganizationProfile(TimeStampedModel):
    name = models.CharField("نام سازمان", max_length=255)
    name_en = models.CharField("نام انگلیسی سازمان", max_length=255, blank=True)
    description = models.TextField("توضیحات", blank=True)
    description_en = models.TextField("توضیحات انگلیسی", blank=True)
    address = models.CharField("آدرس", max_length=500, blank=True)
    address_en = models.CharField("آدرس انگلیسی", max_length=500, blank=True)
    email = models.EmailField("ایمیل", blank=True)
    phone = models.CharField("تلفن", max_length=32, blank=True)
    website = models.URLField("وب سایت", blank=True)
    logo = models.ImageField("لوگو", upload_to="core/logos/%Y/%m/%d/", null=True, blank=True)

    class Meta:
        verbose_name = "پروفایل سازمان"
        verbose_name_plural = "پروفایل سازمان"

    def __str__(self) -> str:
        return self.name


class StaticPage(TimeStampedModel):
    class PageType(models.TextChoices):
        LEGAL = "legal", "حقوقی"
        POLICY = "policy", "سیاست"
        ABOUT = "about", "درباره"
        HELP = "help", "راهنما"

    slug = models.SlugField("اسلاگ", max_length=160, unique=True)
    page_type = models.CharField("نوع صفحه", max_length=20, choices=PageType.choices, default=PageType.LEGAL)
    title = models.CharField("عنوان", max_length=255)
    title_en = models.CharField("عنوان انگلیسی", max_length=255, blank=True)
    content = models.TextField("متن", blank=True)
    content_en = models.TextField("متن انگلیسی", blank=True)
    is_published = models.BooleanField("منتشر شده", default=False)
    published_at = models.DateTimeField("زمان انتشار", null=True, blank=True)

    class Meta:
        verbose_name = "صفحه ثابت"
        verbose_name_plural = "صفحات ثابت"
        indexes = [models.Index(fields=["page_type", "is_published"])]

    def __str__(self) -> str:
        return self.title


class AnnouncementBanner(TimeStampedModel):
    class Level(models.TextChoices):
        INFO = "info", "اطلاعاتی"
        WARNING = "warning", "هشدار"
        CRITICAL = "critical", "بحرانی"

    title = models.CharField("عنوان", max_length=255)
    title_en = models.CharField("عنوان انگلیسی", max_length=255, blank=True)
    body = models.TextField("متن", blank=True)
    body_en = models.TextField("متن انگلیسی", blank=True)
    level = models.CharField("سطح", max_length=16, choices=Level.choices, default=Level.INFO)
    is_active = models.BooleanField("فعال", default=True)
    start_at = models.DateTimeField("شروع نمایش", null=True, blank=True)
    end_at = models.DateTimeField("پایان نمایش", null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name="ایجادکننده",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_banners",
    )

    class Meta:
        verbose_name = "بنر اعلان"
        verbose_name_plural = "بنرهای اعلان"

    def __str__(self) -> str:
        return self.title
