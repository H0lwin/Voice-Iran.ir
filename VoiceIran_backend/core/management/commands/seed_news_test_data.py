from django.core.management.base import BaseCommand
from django.core.files import File
from django.db import transaction
from django.utils import timezone

from core.management.commands.seed_test_data_utils import (
    ensure_media_assets,
    ensure_seed_user,
    pick_asset,
)
from news.models import NewsTrendingTerm, Post, PostBookmark
from search_index.models import PopularSearchTerm
from taxonomy.models import TaxonomyDomain, Term


class Command(BaseCommand):
    help = "Seed test data for news app (5 records per model)"

    def add_arguments(self, parser):
        parser.add_argument("--count", type=int, default=5, help="Number of posts/tags/categories to seed.")

    @transaction.atomic
    def handle(self, *args, **options):
        count = max(1, int(options["count"]))
        author = ensure_seed_user()
        assets = ensure_media_assets(min_count=10)
        now = timezone.now()

        categories = []
        for i in range(1, count + 1):
            category, _ = Term.objects.update_or_create(
                type=Term.TermType.CATEGORY,
                slug=f"seed-news-category-{i}",
                defaults={
                    "name": f"دسته خبر تست {i}",
                    "name_en": f"Seed News Category {i}",
                    "domain": TaxonomyDomain.NEWS,
                    "is_active": True,
                    "sort_order": i,
                },
            )
            categories.append(category)

        tags = []
        for i in range(1, count + 1):
            tag, _ = Term.objects.update_or_create(
                type=Term.TermType.TAG,
                slug=f"seed-news-tag-{i}",
                defaults={
                    "name": f"برچسب خبر تست {i}",
                    "name_en": f"Seed News Tag {i}",
                    "domain": TaxonomyDomain.NEWS,
                    "is_active": True,
                },
            )
            tags.append(tag)

        seeded_posts = []
        for i in range(1, count + 1):
            post, _ = Post.objects.update_or_create(
                slug=f"seed-news-post-{i}",
                defaults={
                    "status": Post.Status.PUBLISHED if i % 2 else Post.Status.REVIEW,
                    "author": author,
                    "title_fa": f"خبر تست {i}",
                    "title_en": f"Seed news {i}",
                    "excerpt_fa": f"خلاصه کوتاه خبر تست {i}",
                    "excerpt_en": f"Seed excerpt {i}",
                    "summary_fa": f"خلاصه خبر تست {i}",
                    "summary_en": f"Seed summary {i}",
                    "content_fa": f"<p>متن کامل خبر تست {i}</p>",
                    "content_en": f"<p>Seed content {i}</p>",
                    "reading_time_minutes": max(1, i),
                    "meta_title_fa": f"متای خبر تست {i}",
                    "meta_title_en": f"Seed meta title {i}",
                    "meta_description_fa": f"توضیحات متای خبر تست {i}",
                    "meta_description_en": f"Seed meta description {i}",
                    "is_featured": i in {1, 3},
                    "is_live": i in {1, 2},
                    "published_at": now,
                    "view_count": i * 120,
                    "deleted_at": None,
                },
            )
            post.categories.set([categories[(i - 1) % len(categories)]])
            post.tags.set([tags[(i - 1) % len(tags)], tags[i % len(tags)]])
            cover_path = pick_asset(assets, i - 1)
            with cover_path.open("rb") as stream:
                post.cover_image.save(cover_path.name, File(stream), save=True)
            seeded_posts.append(post)

        for post in seeded_posts[: min(3, len(seeded_posts))]:
            PostBookmark.objects.get_or_create(user=author, post=post)

        trending_terms = [
            ("air-defense", "پدافند هوایی", "Air Defense"),
            ("fattah", "موشک فتاح", "Fattah Missile"),
            ("military-drill", "رزمایش", "Military Drill"),
            ("shahed-drone", "پهپاد شاهد", "Shahed Drone"),
            ("regional-security", "امنیت منطقه", "Regional Security"),
        ]
        for index, (slug, fa_label, en_label) in enumerate(trending_terms, start=1):
            NewsTrendingTerm.objects.update_or_create(
                slug=slug,
                defaults={
                    "label_fa": fa_label,
                    "label_en": en_label,
                    "weight": 100 - index,
                    "is_active": True,
                },
            )
            PopularSearchTerm.objects.update_or_create(
                slug=f"news-{slug}",
                defaults={
                    "label_fa": fa_label,
                    "label_en": en_label,
                    "term_type": PopularSearchTerm.TermType.NEWS,
                    "weight": 100 - index,
                    "is_active": True,
                },
            )

        self.stdout.write(self.style.SUCCESS(f"News test data seeded ({count} records per model)."))
