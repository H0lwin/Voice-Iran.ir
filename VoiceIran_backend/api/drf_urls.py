from importlib.util import find_spec

from django.urls import include, path

urlpatterns = []

if find_spec("rest_framework"):
    urlpatterns += [
        path("auth/session/", include("rest_framework.urls")),
    ]

if find_spec("rest_framework_simplejwt"):
    from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

    urlpatterns += [
        path("auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
        path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    ]

if find_spec("drf_spectacular"):
    from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

    urlpatterns += [
        path("schema/", SpectacularAPIView.as_view(), name="schema"),
        path("docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="docs"),
    ]

if find_spec("rest_framework"):
    from api.dashboard import AdminDashboardAPIView
    from api.homepage import HomePageAPIView
    from api.page_overviews import (
        ArsenalOverviewAPIView,
        DocumentsOverviewAPIView,
        MartyrsOverviewAPIView,
        NewsOverviewAPIView,
        SearchMetaAPIView,
    )
    from api.search import UnifiedSearchAPIView

    urlpatterns += [
        path("homepage/", HomePageAPIView.as_view(), name="homepage"),
        path("news/overview/", NewsOverviewAPIView.as_view(), name="news-overview"),
        path("arsenal/overview/", ArsenalOverviewAPIView.as_view(), name="arsenal-overview"),
        path("martyrs/overview/", MartyrsOverviewAPIView.as_view(), name="martyrs-overview"),
        path("documents/overview/", DocumentsOverviewAPIView.as_view(), name="documents-overview"),
        path("search/meta/", SearchMetaAPIView.as_view(), name="search-meta"),
        path("admin/dashboard/", AdminDashboardAPIView.as_view(), name="admin-dashboard"),
        path("search/", UnifiedSearchAPIView.as_view(), name="unified-search"),
        path("", include("news.urls")),
        path("", include("achievements.urls")),
        path("", include("arsenal.urls")),
        path("", include("martyrs.urls")),
        path("", include("documents.urls")),
    ]
