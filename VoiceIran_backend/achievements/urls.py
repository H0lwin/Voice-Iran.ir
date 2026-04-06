from rest_framework.routers import DefaultRouter

from achievements.viewsets import AchievementViewSet

router = DefaultRouter()
router.register("achievements", AchievementViewSet, basename="achievements")

urlpatterns = router.urls
