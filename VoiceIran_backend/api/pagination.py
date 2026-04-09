from rest_framework.pagination import PageNumberPagination


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class AdminPagination(PageNumberPagination):
    """Pagination for Admin Dashboard"""
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100
    
    def get_paginated_response(self, data):
        return {
            "data": data,
            "total": self.page.paginator.count,
            "page": self.page.number,
            "pageSize": self.page.paginator.per_page,
            "totalPages": self.page.paginator.num_pages,
            "hasNext": self.page.has_next(),
            "hasPrevious": self.page.has_previous(),
        }
