from django.contrib.sitemaps import Sitemap

from seo.models import SeoConfig


class DynamicSeoSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.5

    def items(self):
        return SeoConfig.objects.filter(include_in_sitemap=True).select_related("content_type")

    def location(self, obj: SeoConfig):
        return obj.canonical_url or "/"

    def lastmod(self, obj: SeoConfig):
        return obj.lastmod or obj.updated_at

    def get_changefreq(self, obj):
        return obj.changefreq or self.changefreq

    def get_priority(self, obj):
        return obj.priority if obj.priority is not None else self.priority
