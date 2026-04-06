from rest_framework.routers import DefaultRouter

from martyrs.viewsets import MartyrViewSet

router = DefaultRouter()
router.register("martyrs", MartyrViewSet, basename="martyrs")

urlpatterns = router.urls
