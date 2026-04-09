"""
Admin Dashboard API Views
"""
from datetime import timedelta

from django.contrib.auth import authenticate
from django.contrib.auth import login as django_login
from django.contrib.auth import logout as django_logout
from django.contrib.auth import get_user_model
from django.db.models import Count
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import Role, AccessProfile
from accounts.serializers import UserSerializer
from achievements.models import Achievement
from api.pagination import AdminPagination
from api.permissions import (
    AdminDashboardPermission,
    CanPublishPermission,
    CanDeletePermission,
    CanManageUsersPermission,
)
from arsenal.models import Weapon
from documents.models import Document
from martyrs.models import Martyr
from news.models import Post
from taxonomy.models import Term
from taxonomy.serializers import TermSerializer


User = get_user_model()


def get_user_role(user):
    """Get user role for frontend compatibility"""
    if user.is_superuser:
        return {"id": "1", "name": "مدیر ارشد", "codename": "superadmin", "permissions": []}
    
    roles = user.roles.all()
    if roles.exists():
        role = roles.first()
        return {"id": str(role.id), "name": role.name, "codename": role.code, "permissions": []}
    
    return {"id": "0", "name": "بازدیدکننده", "codename": "viewer", "permissions": []}


def get_tokens_for_user(user):
    """Generate JWT tokens for user"""
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "expiresAt": (timezone.now() + timedelta(hours=1)).isoformat(),
    }


class AdminAuthViewSet(viewsets.ViewSet):
    """Authentication API for Admin Dashboard"""
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=["post"])
    def login(self, request):
        """Login with username and password"""
        username = request.data.get("username")
        password = request.data.get("password")
        
        if not username or not password:
            return Response(
                {"error": "نام کاربری و رمز عبور الزامی است"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(username=username, password=password)
        
        if user is None:
            return Response(
                {"error": "نام کاربری یا رمز عبور اشتباه است"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not user.is_active:
            return Response(
                {"error": "حساب کاربری غیرفعال است"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Login user (creates session)
        django_login(request, user)
        
        tokens = get_tokens_for_user(user)
        user_data = UserSerializer(user).data
        user_data["role"] = get_user_role(user)
        
        return Response({
            "user": user_data,
            "token": tokens["access"],
            "refreshToken": tokens["refresh"],
            "expiresAt": tokens["expiresAt"],
        })
    
    @action(detail=False, methods=["post"])
    def logout(self, request):
        """Logout user"""
        try:
            django_logout(request)
            return Response({"message": "با موفقیت خارج شدید"})
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Get current user info"""
        user_data = UserSerializer(request.user).data
        user_data["role"] = get_user_role(request.user)
        return Response(user_data)
    
    @action(detail=False, methods=["post"])
    def refresh(self, request):
        """Refresh access token"""
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                {"error": "Refresh token الزامی است"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            refresh = RefreshToken(refresh_token)
            return Response({
                "access": str(refresh.access_token),
                "expiresAt": (timezone.now() + timedelta(hours=1)).isoformat(),
            })
        except Exception as e:
            return Response(
                {"error": "Token نامعتبر است"},
                status=status.HTTP_401_UNAUTHORIZED
            )


class AdminDashboardView(APIView):
    """Dashboard statistics API"""
    permission_classes = [IsAuthenticated, AdminDashboardPermission]
    
    def get(self, request):
        now = timezone.now()
        
        # Posts stats
        posts_queryset = Post.objects.all()
        posts_stats = {
            "total": posts_queryset.count(),
            "published": posts_queryset.filter(status="published").count(),
            "pending_review": posts_queryset.filter(status="review").count(),
            "draft": posts_queryset.filter(status="draft").count(),
        }
        
        # Martyrs stats
        martyrs_queryset = Martyr.objects.all()
        martyrs_stats = {
            "total": martyrs_queryset.count(),
            "published": martyrs_queryset.filter(status="published").count(),
            "pending_review": martyrs_queryset.filter(status="review").count(),
            "draft": martyrs_queryset.filter(status="draft").count(),
        }
        
        # Weapons stats
        weapons_queryset = Weapon.objects.all()
        weapons_stats = {
            "total": weapons_queryset.count(),
            "published": weapons_queryset.filter(status="published").count(),
            "pending_review": weapons_queryset.filter(status="review").count(),
            "draft": weapons_queryset.filter(status="draft").count(),
        }
        
        # Documents stats
        docs_queryset = Document.objects.all()
        docs_stats = {
            "total": docs_queryset.count(),
            "published": docs_queryset.filter(status="published").count(),
            "pending_review": docs_queryset.filter(status="review").count(),
            "draft": docs_queryset.filter(status="draft").count(),
        }
        
        # Achievements stats
        achievements_queryset = Achievement.objects.all()
        achievements_stats = {
            "total": achievements_queryset.count(),
            "verified": achievements_queryset.filter(verification_status="verified").count(),
            "pending": achievements_queryset.filter(verification_status="pending").count(),
            "rejected": achievements_queryset.filter(verification_status="rejected").count(),
        }
        
        # Users count
        users_count = User.objects.filter(is_active=True).count()
        
        return Response({
            "totalPosts": posts_stats["total"],
            "publishedPosts": posts_stats["published"],
            "pendingReview": posts_stats["pending_review"],
            "draftPosts": posts_stats["draft"],
            "totalMartyrs": martyrs_stats["total"],
            "publishedMartyrs": martyrs_stats["published"],
            "pendingMartyrs": martyrs_stats["pending_review"],
            "totalWeapons": weapons_stats["total"],
            "publishedWeapons": weapons_stats["published"],
            "pendingWeapons": weapons_stats["pending_review"],
            "totalDocuments": docs_stats["total"],
            "publishedDocuments": docs_stats["published"],
            "pendingDocuments": docs_stats["pending_review"],
            "totalAchievements": achievements_stats["total"],
            "verifiedAchievements": achievements_stats["verified"],
            "pendingAchievements": achievements_stats["pending"],
            "totalUsers": users_count,
        })


class AdminPostViewSet(viewsets.ModelViewSet):
    """Posts/News CRUD API"""
    permission_classes = [IsAuthenticated, AdminDashboardPermission]
    pagination_class = AdminPagination
    
    def get_queryset(self):
        queryset = Post.objects.all().order_by("-created_at")
        
        # Filter by status
        status_filter = self.request.query_params.get("status")
        if status_filter and status_filter != "all":
            queryset = queryset.filter(status=status_filter)
        
        # Search
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(title_fa__icontains=search)
        
        return queryset
    
    def get_serializer_class(self):
        from news.serializers import PostSerializer
        return PostSerializer
    
    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, CanPublishPermission])
    def publish(self, request, pk=None):
        """Publish a post"""
        post = self.get_object()
        post.status = "published"
        post.save()
        from news.serializers import PostSerializer
        return Response(PostSerializer(post, context={"request": request}).data)
    
    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        """Reject a post"""
        post = self.get_object()
        post.status = "archived"  # Using archived for rejected
        post.save()
        from news.serializers import PostSerializer
        return Response(PostSerializer(post, context={"request": request}).data)


class AdminMartyrViewSet(viewsets.ModelViewSet):
    """Martyrs CRUD API"""
    permission_classes = [IsAuthenticated, AdminDashboardPermission]
    pagination_class = AdminPagination
    
    def get_queryset(self):
        queryset = Martyr.objects.all().order_by("-created_at")
        
        status_filter = self.request.query_params.get("status")
        if status_filter and status_filter != "all":
            queryset = queryset.filter(status=status_filter)
        
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(name_fa__icontains=search)
        
        return queryset
    
    def get_serializer_class(self):
        from martyrs.serializers import MartyrSerializer
        return MartyrSerializer


class AdminWeaponViewSet(viewsets.ModelViewSet):
    """Weapons CRUD API"""
    permission_classes = [IsAuthenticated, AdminDashboardPermission]
    pagination_class = AdminPagination
    
    def get_queryset(self):
        queryset = Weapon.objects.all().order_by("-created_at")
        
        status_filter = self.request.query_params.get("status")
        if status_filter and status_filter != "all":
            queryset = queryset.filter(status=status_filter)
        
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(name_fa__icontains=search)
        
        return queryset
    
    def get_serializer_class(self):
        from arsenal.serializers import WeaponSerializer
        return WeaponSerializer


class AdminDocumentViewSet(viewsets.ModelViewSet):
    """Documents CRUD API"""
    permission_classes = [IsAuthenticated, AdminDashboardPermission]
    pagination_class = AdminPagination
    
    def get_queryset(self):
        queryset = Document.objects.all().order_by("-created_at")
        
        status_filter = self.request.query_params.get("status")
        if status_filter and status_filter != "all":
            queryset = queryset.filter(status=status_filter)
        
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(title_fa__icontains=search)
        
        return queryset
    
    def get_serializer_class(self):
        from documents.serializers import DocumentSerializer
        return DocumentSerializer


class AdminAchievementViewSet(viewsets.ModelViewSet):
    """Achievements CRUD API"""
    permission_classes = [IsAuthenticated, AdminDashboardPermission]
    pagination_class = AdminPagination
    
    def get_queryset(self):
        queryset = Achievement.objects.all().order_by("-created_at")
        
        status_filter = self.request.query_params.get("status")
        if status_filter and status_filter != "all":
            queryset = queryset.filter(verification_status=status_filter)
        
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(title_fa__icontains=search)
        
        return queryset
    
    def get_serializer_class(self):
        from achievements.serializers import AchievementSerializer
        return AchievementSerializer


class AdminUserViewSet(viewsets.ReadOnlyModelViewSet):
    """Users Read-Only API"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, CanManageUsersPermission]
    pagination_class = AdminPagination
    
    def get_queryset(self):
        queryset = User.objects.all().order_by("-date_joined")
        
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                username__icontains=search
            ) | queryset.filter(
                first_name__icontains=search
            ) | queryset.filter(
                last_name__icontains=search
            )
        
        return queryset


class AdminCategoryViewSet(viewsets.ModelViewSet):
    """Categories CRUD API"""
    serializer_class = TermSerializer
    permission_classes = [IsAuthenticated, AdminDashboardPermission]
    pagination_class = None
    
    def get_queryset(self):
        return Term.objects.filter(type="category").order_by("sort_order", "name")


class AdminTagViewSet(viewsets.ModelViewSet):
    """Tags CRUD API"""
    serializer_class = TermSerializer
    permission_classes = [IsAuthenticated, AdminDashboardPermission]
    pagination_class = None
    
    def get_queryset(self):
        return Term.objects.filter(type="tag").order_by("name")
