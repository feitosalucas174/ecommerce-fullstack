from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Product
from .serializers import ProductSerializer, StockUpdateSerializer
from users.permissions import IsAdminUser


class ProductViewSet(viewsets.ModelViewSet):
    """
    Public read, admin write for products.

    GET  /api/products/               — list (public)
    GET  /api/products/{id}/          — detail (public)
    POST /api/products/               — create (admin)
    PUT  /api/products/{id}/          — update (admin)
    DELETE /api/products/{id}/        — delete (admin)
    PATCH /api/products/{id}/stock/   — update stock (admin)
    """

    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["category", "is_active"]
    search_fields = ["name", "description"]
    ordering_fields = ["price", "created_at", "name", "stock_quantity"]
    ordering = ["-created_at"]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminUser()]

    def get_queryset(self):
        # Public users only see active products
        if self.request.user.is_authenticated and self.request.user.role == "admin":
            return Product.objects.all()
        return Product.objects.filter(is_active=True)

    @action(detail=True, methods=["patch"], url_path="stock")
    def update_stock(self, request, pk=None):
        """PATCH /api/products/{id}/stock/ — update stock quantity."""
        product = self.get_object()
        serializer = StockUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product.stock_quantity = serializer.validated_data["stock_quantity"]
        if "min_stock_alert" in serializer.validated_data:
            product.min_stock_alert = serializer.validated_data["min_stock_alert"]
        product.save()
        return Response(ProductSerializer(product).data)
