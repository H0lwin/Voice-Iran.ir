import importlib.util

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from documents.models import Document, DocumentType
from localization.models import Language
from martyrs.models import Martyr
from news.models import Post
from arsenal.models import Weapon


class ApiContentTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.has_drf = importlib.util.find_spec("rest_framework") is not None
        cls.fa = Language.objects.create(code="fa", name="فارسی", direction=Language.Direction.RTL, is_default=True)
        cls.en = Language.objects.create(code="en", name="English", direction=Language.Direction.LTR, is_default=False)

        cls.post_pub = Post.objects.create(
            slug="post-pub",
            status=Post.Status.PUBLISHED,
            published_at=timezone.now(),
            title_fa="خبر فارسی",
            title_en="English News",
            excerpt_fa="خلاصه",
            excerpt_en="Summary",
        )

        cls.post_fallback = Post.objects.create(
            slug="post-fallback",
            status=Post.Status.PUBLISHED,
            published_at=timezone.now(),
            title_fa="فقط فارسی",
            excerpt_fa="فا",
        )

        cls.post_draft = Post.objects.create(slug="post-draft", status=Post.Status.DRAFT, title_fa="پیش نویس", excerpt_fa="draft")

        cls.weapon = Weapon.objects.create(
            slug="weapon-1",
            status=Weapon.Status.PUBLISHED,
            published_at=timezone.now(),
            name_fa="سلاح",
            type_label_fa="موشک",
        )

        cls.martyr = Martyr.objects.create(
            slug="martyr-1",
            status=Martyr.Status.PUBLISHED,
            published_at=timezone.now(),
            name_fa="شهید",
            title_fa="قهرمان",
        )

        dtype = DocumentType.objects.create(code="pdf", name="PDF")
        cls.document = Document.objects.create(
            slug="doc-1",
            status=Document.Status.PUBLISHED,
            published_at=timezone.now(),
            document_type=dtype,
            is_featured=True,
            title_fa="سند",
            description_fa="شرح",
        )

        User = get_user_model()
        cls.staff_user = User.objects.create_user(username="staff", password="pass1234", is_staff=True)

    def setUp(self):
        if not self.has_drf:
            self.skipTest("DRF is not installed")

    def test_posts_list_anonymous_sees_only_published(self):
        response = self.client.get("/api/v1/posts/?lang=fa")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["count"], 2)

    def test_posts_list_staff_sees_draft_too(self):
        self.client.force_login(self.staff_user)
        response = self.client.get("/api/v1/posts/?lang=fa")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["count"], 3)

    def test_language_fallback_to_fa_when_en_missing(self):
        response = self.client.get("/api/v1/posts/?lang=en&q=fallback")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        titles = [item["title"] for item in payload["results"]]
        self.assertIn("فقط فارسی", titles)

    def test_posts_search_filter_with_q(self):
        response = self.client.get("/api/v1/posts/?q=English&lang=en")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertGreaterEqual(payload["count"], 1)

    def test_unified_search_endpoint(self):
        response = self.client.get("/api/v1/search/?q=س&lang=fa")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn("results", payload)
        self.assertGreaterEqual(payload["count"], 1)

    def test_documents_filter_and_list(self):
        response = self.client.get("/api/v1/documents/?lang=fa&is_featured=true")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["count"], 1)

    def test_homepage_endpoint_payload(self):
        response = self.client.get("/api/v1/homepage/?lang=fa")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn("hero", payload)
        self.assertIn("quick_access", payload)
        self.assertIn("live_stats", payload)
        self.assertIn("sections", payload)
        self.assertGreaterEqual(len(payload["quick_access"]["items"]), 4)
        self.assertIn("latest_news", payload["sections"])
