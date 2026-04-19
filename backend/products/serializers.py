from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    """Full product serializer."""

    is_low_stock = serializers.ReadOnlyField()
    is_in_stock = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            "id", "name", "description", "price", "category",
            "image_url", "stock_quantity", "min_stock_alert",
            "is_active", "is_low_stock", "is_in_stock",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class StockUpdateSerializer(serializers.Serializer):
    """Serializer for updating stock quantity only."""

    stock_quantity = serializers.IntegerField(min_value=0)
    min_stock_alert = serializers.IntegerField(min_value=0, required=False)
