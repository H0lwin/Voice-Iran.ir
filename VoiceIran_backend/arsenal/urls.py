from rest_framework.routers import DefaultRouter

from arsenal.viewsets import WeaponViewSet

router = DefaultRouter()
router.register("weapons", WeaponViewSet, basename="weapons")

urlpatterns = router.urls
