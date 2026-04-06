from django.db.models import QuerySet

from documents.models import Document


def get_documents_queryset(public_only: bool = True) -> QuerySet[Document]:
    queryset = Document.objects.select_related("document_type").prefetch_related("collections", "files")
    if public_only:
        queryset = queryset.filter(status=Document.Status.PUBLISHED)
    return queryset
