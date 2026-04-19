from rest_framework import serializers
from .models import Order, OrderItem
from products.serializers import ProductSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source="product", read_only=True)
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = ["id", "product", "product_detail", "quantity", "unit_price", "subtotal"]
        read_only_fields = ["id", "unit_price"]


class OrderItemCreateSerializer(serializers.Serializer):
    """Used when creating an order — only product id and quantity are needed."""
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class OrderSerializer(serializers.ModelSerializer):
    """Full order representation including nested items."""

    items = OrderItemSerializer(many=True, read_only=True)
    user_username = serializers.CharField(source="user.username", read_only=True)
    user_email = serializers.CharField(source="user.email", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id", "user", "user_username", "user_email",
            "status", "payment_status", "total_amount",
            "shipping_address", "notes", "items",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "user", "total_amount", "created_at", "updated_at"]


class OrderCreateSerializer(serializers.Serializer):
    """Used to create a new order from a cart payload."""

    items = OrderItemCreateSerializer(many=True)
    shipping_address = serializers.CharField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("O pedido deve ter ao menos um item.")
        return value


class StatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Order.Status.choices)
