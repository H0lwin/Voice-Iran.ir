from django.contrib.contenttypes.models import ContentType
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from arsenal.models import Weapon
from martyrs.models import Martyr
from news.models import Post
from publishing.models import PublishSchedule


def _sync_schedule_for_content(instance) -> None:
    content_type = ContentType.objects.get_for_model(instance.__class__)
    published_at = getattr(instance, "published_at", None)
    now = timezone.now()

    existing = PublishSchedule.objects.filter(
        content_type=content_type,
        object_id=instance.pk,
        status=PublishSchedule.ScheduleStatus.PENDING,
    ).first()

    # Future publish date requires a pending schedule.
    if published_at and published_at > now:
        if existing:
            if existing.scheduled_at != published_at:
                existing.scheduled_at = published_at
                existing.save(update_fields=["scheduled_at"])
            return
        PublishSchedule.objects.create(
            content_type=content_type,
            object_id=instance.pk,
            scheduled_at=published_at,
            status=PublishSchedule.ScheduleStatus.PENDING,
        )
        return

    # No future date: cancel any pending schedule.
    if existing:
        existing.status = PublishSchedule.ScheduleStatus.CANCELLED
        existing.save(update_fields=["status"])


@receiver(post_save, sender=Post)
def auto_schedule_post_publish(sender, instance: Post, raw: bool = False, **kwargs):
    if raw:
        return
    _sync_schedule_for_content(instance)


@receiver(post_save, sender=Weapon)
def auto_schedule_weapon_publish(sender, instance: Weapon, raw: bool = False, **kwargs):
    if raw:
        return
    _sync_schedule_for_content(instance)


@receiver(post_save, sender=Martyr)
def auto_schedule_martyr_publish(sender, instance: Martyr, raw: bool = False, **kwargs):
    if raw:
        return
    _sync_schedule_for_content(instance)


@receiver(post_save, sender=PublishSchedule)
def create_or_update_celery_beat(sender, instance: PublishSchedule, **kwargs):
    # Optional integration: only runs when django-celery-beat is installed.
    try:
        from django_celery_beat.models import ClockedSchedule, PeriodicTask
    except Exception:
        return

    task_name = instance.celery_task_name or f"publish-schedule-{instance.pk}"

    if instance.status != PublishSchedule.ScheduleStatus.PENDING:
        PeriodicTask.objects.filter(name=task_name).update(enabled=False)
        return

    clocked, _ = ClockedSchedule.objects.get_or_create(clocked_time=instance.scheduled_at)
    PeriodicTask.objects.update_or_create(
        name=task_name,
        defaults={
            "task": "publishing.tasks.execute_publish_schedule",
            "clocked": clocked,
            "one_off": True,
            "enabled": True,
            "kwargs": f'{{"schedule_id": {instance.pk}}}',
        },
    )
    if instance.celery_task_name != task_name:
        instance.celery_task_name = task_name
        instance.save(update_fields=["celery_task_name"])
