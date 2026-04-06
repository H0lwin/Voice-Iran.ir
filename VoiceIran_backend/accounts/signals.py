from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.db.models.signals import post_save
from django.dispatch import receiver

from accounts.models import AccessProfile, Role
from core.observability import append_admin_session_event


def _request_ip(request) -> str:
    if not request:
        return ""
    return request.META.get("HTTP_X_FORWARDED_FOR", "").split(",")[0].strip() or request.META.get("REMOTE_ADDR", "")


@receiver(user_logged_in)
def track_admin_login(sender, request, user, **kwargs):
    append_admin_session_event(
        action="login",
        user_id=getattr(user, "id", None),
        username=getattr(user, "username", ""),
        ip_address=_request_ip(request),
        user_agent=(request.META.get("HTTP_USER_AGENT", "") if request else ""),
        is_successful=True,
    )


@receiver(user_logged_out)
def track_admin_logout(sender, request, user, **kwargs):
    append_admin_session_event(
        action="logout",
        user_id=getattr(user, "id", None) if user else None,
        username=getattr(user, "username", "") if user else "",
        ip_address=_request_ip(request),
        user_agent=(request.META.get("HTTP_USER_AGENT", "") if request else ""),
        is_successful=True,
    )


@receiver(post_save, sender=Role)
def ensure_access_profile_for_role(sender, instance: Role, created: bool, **kwargs):
    AccessProfile.objects.get_or_create(
        role=instance,
        defaults={
            "name": f"Default profile for {instance.code}",
            "allowed_apps": [],
            "can_publish": False,
            "can_delete": False,
            "can_manage_users": False,
            "can_view_audit": False,
        },
    )
