from documents.models import Document


def publish_document(document: Document) -> Document:
    document.status = Document.Status.PUBLISHED
    document.save(update_fields=["status", "updated_at"])
    return document
