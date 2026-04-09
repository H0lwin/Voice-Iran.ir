from django.db import models
from django.utils import timezone


class TaxonomyDomain(models.TextChoices):
    NEWS = "news", "خبر"
    WEAPON = "weapon", "تسلیحات"
    MARTYR = "martyr", "شهدا"
    DOCUMENT = "document", "مستندات"
    GLOBAL = "global", "عمومی"


class Vocabulary(models.Model):
    """Vocabulary (Group of terms)"""
    name = models.CharField("نام", max_length=150)
    name_en = models.CharField("نام انگلیسی", max_length=150, blank=True)
    machine_name = models.SlugField("نام ماشینی", max_length=160, unique=True)
    description = models.TextField("توضیحات", blank=True)
    is_hierarchical = models.BooleanField("سلسله‌مراتبی", default=False)
    created_at = models.DateTimeField("زمان ایجاد", auto_now_add=True)
    updated_at = models.DateTimeField("زمان بروزرسانی", auto_now=True)

    class Meta:
        verbose_name = "واژگان"
        verbose_name_plural = "واژگان‌ها"

    def __str__(self) -> str:
        return self.name


class Term(models.Model):
    class TermType(models.TextChoices):
        TAG = "tag", "برچسب"
        CATEGORY = "category", "دسته بندی"
        TOPIC = "topic", "موضوع"

    vocabulary = models.ForeignKey(
        Vocabulary,
        verbose_name="واژگان",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="terms",
    )
    slug = models.SlugField("اسلاگ", max_length=160)
    name = models.CharField("نام", max_length=150)
    name_en = models.CharField("نام انگلیسی", max_length=150, blank=True)
    type = models.CharField("نوع", max_length=16, choices=TermType.choices)
    domain = models.CharField("دامنه", max_length=20, choices=TaxonomyDomain.choices, default=TaxonomyDomain.GLOBAL)
    parent = models.ForeignKey(
        "self",
        verbose_name="والد",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="children",
    )
    description = models.TextField("توضیحات", blank=True)
    description_en = models.TextField("توضیحات انگلیسی", blank=True)
    is_active = models.BooleanField("فعال", default=True)
    sort_order = models.PositiveIntegerField("ترتیب نمایش", default=0)
    created_at = models.DateTimeField("زمان ایجاد", auto_now_add=True)
    updated_at = models.DateTimeField("زمان بروزرسانی", auto_now=True)

    class Meta:
        verbose_name = "ترم"
        verbose_name_plural = "ترم‌ها"
        constraints = [models.UniqueConstraint(fields=["type", "slug"], name="uq_term_type_slug")]
        ordering = ["type", "sort_order", "name"]

    def __str__(self) -> str:
        return f"{self.type}:{self.name}"
