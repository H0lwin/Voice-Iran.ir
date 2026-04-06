from rest_framework import serializers

from api.i18n import resolve_language_code
from news.models import Post


class PostSerializer(serializers.ModelSerializer):
    title = serializers.SerializerMethodField()
    excerpt = serializers.SerializerMethodField()
    summary = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    category_label = serializers.SerializerMethodField()
    category_slug = serializers.SerializerMethodField()
    reading_time = serializers.IntegerField(source="reading_time_minutes", read_only=True)
    views = serializers.IntegerField(source="view_count", read_only=True)
    is_live = serializers.BooleanField(read_only=True)
    is_bookmarked = serializers.SerializerMethodField()
    content = serializers.SerializerMethodField()
    categories = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = (
            "id",
            "slug",
            "title",
            "excerpt",
            "summary",
            "image",
            "published_at",
            "is_featured",
            "view_count",
            "reading_time",
            "views",
            "category_label",
            "category_slug",
            "is_live",
            "is_bookmarked",
            "content",
            "categories",
            "tags",
        )

    def _lang(self):
        request = self.context.get("request")
        return resolve_language_code(request.query_params.get("lang") if request else None)

    def get_title(self, obj):
        lang = self._lang()
        return obj.title_en if lang == "en" and obj.title_en else obj.title_fa or obj.slug

    def get_excerpt(self, obj):
        lang = self._lang()
        return obj.excerpt_en if lang == "en" and obj.excerpt_en else obj.excerpt_fa

    def get_summary(self, obj):
        lang = self._lang()
        return obj.summary_en if lang == "en" and obj.summary_en else obj.summary_fa

    def get_image(self, obj):
        if not obj.cover_image:
            return ""
        request = self.context.get("request")
        return request.build_absolute_uri(obj.cover_image.url) if request else obj.cover_image.url

    def get_category_label(self, obj):
        category = obj.categories.order_by("sort_order", "id").first()
        if not category:
            return ""
        lang = self._lang()
        return category.name_en if lang == "en" and category.name_en else category.name

    def get_category_slug(self, obj):
        category = obj.categories.order_by("sort_order", "id").first()
        return category.slug if category else ""

    def get_is_bookmarked(self, obj):
        request = self.context.get("request")
        user = request.user if request else None
        if not user or not user.is_authenticated:
            return False
        return obj.bookmarks.filter(user=user).exists()

    def get_content(self, obj):
        lang = self._lang()
        return obj.content_en if lang == "en" and obj.content_en else obj.content_fa

    def get_categories(self, obj):
        lang = self._lang()
        return [
            {
                "slug": category.slug,
                "label": category.name_en if lang == "en" and category.name_en else category.name,
            }
            for category in obj.categories.order_by("sort_order", "id")
        ]

    def get_tags(self, obj):
        lang = self._lang()
        return [
            {
                "slug": tag.slug,
                "label": tag.name_en if lang == "en" and tag.name_en else tag.name,
            }
            for tag in obj.tags.order_by("sort_order", "id")
        ]
