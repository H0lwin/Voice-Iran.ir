from martyrs.models import Martyr


def publish_martyr(martyr: Martyr) -> Martyr:
    martyr.status = Martyr.Status.PUBLISHED
    martyr.save(update_fields=["status", "updated_at"])
    return martyr
