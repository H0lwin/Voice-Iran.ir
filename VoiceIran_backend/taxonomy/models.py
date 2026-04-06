from django.db import models


class TaxonomyDomain(models.TextChoices):
    NEWS = "news", "خبر"
    WEAPON = "weapon", "تسلیحات"
    MARTYR = "martyr", "شهدا"
    DOCUMENT = "document", "مستندات"
    GLOBAL = "global", "عمومی"


class Term(models.Model):
    class TermType(models.TextChoices):
        TAG = "tag", "برچسب"
        CATEGORY = "category", "دسته بندی"
        TOPIC = "topic", "موضوع"

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

    class Meta:
        verbose_name = "ترم"
        verbose_name_plural = "ترم‌ها"
        constraints = [models.UniqueConstraint(fields=["type", "slug"], name="uq_term_type_slug")]
        ordering = ["type", "sort_order", "name"]

    def __str__(self) -> str:
        return f"{self.type}:{self.name}"
