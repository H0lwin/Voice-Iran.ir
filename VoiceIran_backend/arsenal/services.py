from arsenal.models import Weapon


def publish_weapon(weapon: Weapon) -> Weapon:
    weapon.status = Weapon.Status.PUBLISHED
    weapon.save(update_fields=["status", "updated_at"])
    return weapon
