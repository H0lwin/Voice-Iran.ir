from rest_framework.routers import DefaultRouter

from documents.viewsets import DocumentViewSet

router = DefaultRouter()
router.register("documents", DocumentViewSet, basename="documents")

urlpatterns = router.urls
