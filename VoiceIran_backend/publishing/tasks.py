from django.utils import timezone

from publishing.models import PublishSchedule


def execute_publish_schedule(schedule_id: int) -> None:
    schedule = PublishSchedule.objects.filter(pk=schedule_id).first()
    if not schedule or schedule.status != PublishSchedule.ScheduleStatus.PENDING:
        return

    model_class = schedule.content_type.model_class()
    if not model_class:
        return

    obj = model_class.objects.filter(pk=schedule.object_id).first()
    if not obj:
        schedule.status = PublishSchedule.ScheduleStatus.CANCELLED
        schedule.executed_at = timezone.now()
        schedule.save(update_fields=["status", "executed_at"])
        return

    if hasattr(obj, "status"):
        published_value = getattr(getattr(obj, "Status", None), "PUBLISHED", "published")
        setattr(obj, "status", published_value)
    if hasattr(obj, "published_at"):
        setattr(obj, "published_at", schedule.scheduled_at)
    save_fields = [f for f in ("status", "published_at") if hasattr(obj, f)]
    if save_fields:
        obj.save(update_fields=save_fields)

    schedule.status = PublishSchedule.ScheduleStatus.DONE
    schedule.executed_at = timezone.now()
    schedule.save(update_fields=["status", "executed_at"])
