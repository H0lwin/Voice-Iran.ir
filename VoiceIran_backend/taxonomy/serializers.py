from rest_framework import serializers
from taxonomy.models import Term, TaxonomyDomain


class TermSerializer(serializers.ModelSerializer):
    """Serializer for Term model"""
    
    class Meta:
        model = Term
        fields = [
            "id",
            "slug",
            "name",
            "name_en",
            "type",
            "domain",
            "parent",
            "description",
            "description_en",
            "is_active",
            "sort_order",
        ]
        read_only_fields = ["id"]
