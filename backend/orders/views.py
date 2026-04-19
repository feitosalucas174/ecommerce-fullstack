from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter

from .models import Order, OrderItem
from .serializers import (
    OrderSerializer,
    OrderCreateSerializer,
    StatusUpdateSerializer,
)
from products.models import Product
from users.permissions import IsAdminUser


class OrderViewSet(viewsets.ModelViewSet):
    """
    Order management endpoints.

    GET  /api/orders/              — customer: own orders; admin: all orders
    POST /api/orders/              — create order from cart
    GET  /api/orders/{id}/         — order detail
    PATCH /api/orders/{id}/status/ — admin: update status
    POST /api/orders/{id}/pay/     — mock payment
    """

    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "patch", "head", "options"]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["status", "payment_status"]
    ordering_fields = ["created_at", "total_amount"]
    ordering = ["-created_at"]

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin":
            return Order.objects.all().select_related("user").prefetch_related("items__product")
        return Order.objects.filter(user=user).prefetch_related("items__product")

    def create(self, request, *args, **kwargs):
        """POST /api/orders/ — create a new order from cart items."""
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        with transaction.atomic():
            order = Order.objects.create(
                user=request.user,
                shipping_address=data.get("shipping_address", ""),
                notes=data.get("notes", ""),
            )

            for item_data in data["items"]:
                try:
                    product = Product.objects.get(
                        pk=item_data["product_id"], is_active=True
                    )
                except Product.DoesNotExist:
                    order.delete()
                    return Response(
                        {"detail": f"Produto {item_data['product_id']} não encontrado."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                qty = item_data["quantity"]
                if product.stock_quantity < qty:
                    order.delete()
                    return Response(
                        {"detail": f"Estoque insuficiente para '{product.name}'."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=qty,
                    unit_price=product.price,
                )
                # Decrease stock
                product.stock_quantity -= qty
                product.save(update_fields=["stock_quantity"])

            order.calculate_total()

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["patch"], url_path="status",
            permission_classes=[IsAuthenticated, IsAdminUser])
    def update_status(self, request, pk=None):
        """PATCH /api/orders/{id}/status/ — admin changes order status."""
        order = self.get_object()
        serializer = StatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order.status = serializer.validated_data["status"]
        order.save(update_fields=["status"])
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=["post"], url_path="pay")
    def pay(self, request, pk=None):
        """POST /api/orders/{id}/pay/ — mock payment (sets payment_status=paid)."""
        order = self.get_object()
        # Only the order owner or an admin can pay
        if order.user != request.user and request.user.role != "admin":
            return Response(
                {"detail": "Sem permissão."}, status=status.HTTP_403_FORBIDDEN
            )
        if order.payment_status == Order.PaymentStatus.PAID:
            return Response(
                {"detail": "Este pedido já foi pago."}, status=status.HTTP_400_BAD_REQUEST
            )
        order.payment_status = Order.PaymentStatus.PAID
        order.status = Order.Status.CONFIRMED
        order.save(update_fields=["payment_status", "status"])
        return Response(OrderSerializer(order).data)
