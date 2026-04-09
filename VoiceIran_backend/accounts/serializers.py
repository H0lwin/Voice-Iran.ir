"""
Account Serializers for Admin Dashboard API
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model


User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    full_name = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "phone",
            "first_name",
            "last_name",
            "full_name",
            "role",
            "is_active",
            "is_staff",
            "is_superuser",
            "last_login",
            "date_joined",
        ]
        read_only_fields = ["id", "date_joined", "last_login"]
    
    def get_full_name(self, obj):
        """Return full name"""
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username
    
    def get_role(self, obj):
        """Get user role"""
        if obj.is_superuser:
            return {
                "id": "1",
                "name": "مدیر ارشد",
                "codename": "superadmin",
                "permissions": []
            }
        
        roles = obj.roles.all()
        if roles.exists():
            role = roles.first()
            return {
                "id": str(role.id),
                "name": role.name,
                "codename": role.code,
                "permissions": []
            }
        
        return {
            "id": "0",
            "name": "بازدیدکننده",
            "codename": "viewer",
            "permissions": []
        }
