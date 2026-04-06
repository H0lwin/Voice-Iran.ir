from rest_framework.filters import SearchFilter


class QueryParamSearchFilter(SearchFilter):
    search_param = "q"
