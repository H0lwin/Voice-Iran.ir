"""
Admin Dashboard API URLs
"""
from django.urls import path

from .admin_views import (
    AdminAuthViewSet,
    AdminDashboardView,
    AdminPostViewSet,
    AdminMartyrViewSet,
    AdminWeaponViewSet,
    AdminDocumentViewSet,
    AdminAchievementViewSet,
    AdminUserViewSet,
    AdminCategoryViewSet,
    AdminTagViewSet,
)

app_name = "admin_api"

urlpatterns = [
    # Authentication
    path("auth/login/", AdminAuthViewSet.as_view({"post": "login"}), name="auth-login"),
    path("auth/logout/", AdminAuthViewSet.as_view({"post": "logout"}), name="auth-logout"),
    path("auth/me/", AdminAuthViewSet.as_view({"get": "me"}), name="auth-me"),
    path("auth/refresh/", AdminAuthViewSet.as_view({"post": "refresh"}), name="auth-refresh"),
    
    # Dashboard
    path("dashboard/", AdminDashboardView.as_view(), name="dashboard"),
    
    # Posts/News
    path("posts/", AdminPostViewSet.as_view({"get": "list", "post": "create"}), name="posts-list"),
    path("posts/<int:pk>/", AdminPostViewSet.as_view({
        "get": "retrieve",
        "put": "update",
        "patch": "partial_update",
        "delete": "destroy"
    }), name="posts-detail"),
    path("posts/<int:pk>/publish/", AdminPostViewSet.as_view({"post": "publish"}), name="posts-publish"),
    path("posts/<int:pk>/reject/", AdminPostViewSet.as_view({"post": "reject"}), name="posts-reject"),
    
    # Martyrs
    path("martyrs/", AdminMartyrViewSet.as_view({"get": "list", "post": "create"}), name="martyrs-list"),
    path("martyrs/<int:pk>/", AdminMartyrViewSet.as_view({
        "get": "retrieve",
        "put": "update",
        "patch": "partial_update",
        "delete": "destroy"
    }), name="martyrs-detail"),
    
    # Weapons
    path("weapons/", AdminWeaponViewSet.as_view({"get": "list", "post": "create"}), name="weapons-list"),
    path("weapons/<int:pk>/", AdminWeaponViewSet.as_view({
        "get": "retrieve",
        "put": "update",
        "patch": "partial_update",
        "delete": "destroy"
    }), name="weapons-detail"),
    
    # Documents
    path("documents/", AdminDocumentViewSet.as_view({"get": "list", "post": "create"}), name="documents-list"),
    path("documents/<int:pk>/", AdminDocumentViewSet.as_view({
        "get": "retrieve",
        "put": "update",
        "patch": "partial_update",
        "delete": "destroy"
    }), name="documents-detail"),
    
    # Achievements
    path("achievements/", AdminAchievementViewSet.as_view({"get": "list", "post": "create"}), name="achievements-list"),
    path("achievements/<int:pk>/", AdminAchievementViewSet.as_view({
        "get": "retrieve",
        "put": "update",
        "patch": "partial_update",
        "delete": "destroy"
    }), name="achievements-detail"),
    
    # Users
    path("users/", AdminUserViewSet.as_view({"get": "list"}), name="users-list"),
    path("users/<int:pk>/", AdminUserViewSet.as_view({"get": "retrieve"}), name="users-detail"),
    
    # Categories
    path("categories/", AdminCategoryViewSet.as_view({"get": "list", "post": "create"}), name="categories-list"),
    path("categories/<int:pk>/", AdminCategoryViewSet.as_view({
        "get": "retrieve",
        "put": "update",
        "patch": "partial_update",
        "delete": "destroy"
    }), name="categories-detail"),
    
    # Tags
    path("tags/", AdminTagViewSet.as_view({"get": "list", "post": "create"}), name="tags-list"),
    path("tags/<int:pk>/", AdminTagViewSet.as_view({
        "get": "retrieve",
        "put": "update",
        "patch": "partial_update",
        "delete": "destroy"
    }), name="tags-detail"),
]
