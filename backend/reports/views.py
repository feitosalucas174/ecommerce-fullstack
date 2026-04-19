from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Count, F
from django.db.models.functions import TruncDate, TruncMonth, TruncWeek
from django.utils import timezone
from datetime import timedelta

from orders.models import Order, OrderItem
from products.models import Product
from users.permissions import IsAdminUser


class SalesReportView(APIView):
    """
    GET /api/reports/sales/?period=day|week|month

    Returns total sales grouped by the chosen period.
    """

    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        period = request.query_params.get("period", "day")
        now = timezone.now()

        if period == "week":
            start = now - timedelta(weeks=12)
            trunc_fn = TruncWeek
        elif period == "month":
            start = now - timedelta(days=365)
            trunc_fn = TruncMonth
        else:  # day (default)
            start = now - timedelta(days=30)
            trunc_fn = TruncDate

        qs = (
            Order.objects.filter(
                created_at__gte=start,
                payment_status="paid",
            )
            .annotate(period=trunc_fn("created_at"))
            .values("period")
            .annotate(total=Sum("total_amount"), count=Count("id"))
            .order_by("period")
        )

        data = [
            {
                "period": str(item["period"].date() if hasattr(item["period"], "date") else item["period"]),
                "total": float(item["total"] or 0),
                "count": item["count"],
            }
            for item in qs
        ]
        return Response(data)


class TopProductsView(APIView):
    """
    GET /api/reports/top-products/?limit=5

    Returns top selling products by quantity.
    """

    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        limit = int(request.query_params.get("limit", 5))

        qs = (
            OrderItem.objects.filter(order__payment_status="paid")
            .values("product__id", "product__name", "product__category")
            .annotate(
                total_sold=Sum("quantity"),
                total_revenue=Sum(F("quantity") * F("unit_price")),
            )
            .order_by("-total_sold")[:limit]
        )

        data = [
            {
                "product_id": item["product__id"],
                "product_name": item["product__name"],
                "category": item["product__category"],
                "total_sold": item["total_sold"],
                "total_revenue": float(item["total_revenue"] or 0),
            }
            for item in qs
        ]
        return Response(data)


class StockAlertsView(APIView):
    """
    GET /api/reports/stock-alerts/

    Returns products with stock at or below the minimum alert threshold.
    """

    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        products = Product.objects.filter(
            is_active=True,
            stock_quantity__lte=F("min_stock_alert"),
        ).values(
            "id", "name", "category", "stock_quantity", "min_stock_alert"
        ).order_by("stock_quantity")

        data = list(products)
        return Response(data)


class RevenueReportView(APIView):
    """
    GET /api/reports/revenue/

    Returns overall revenue stats.
    """

    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        paid_orders = Order.objects.filter(payment_status="paid")

        total_revenue = paid_orders.aggregate(total=Sum("total_amount"))["total"] or 0
        today_revenue = paid_orders.filter(
            created_at__gte=today_start
        ).aggregate(total=Sum("total_amount"))["total"] or 0
        month_revenue = paid_orders.filter(
            created_at__gte=month_start
        ).aggregate(total=Sum("total_amount"))["total"] or 0

        total_orders = Order.objects.count()
        today_orders = Order.objects.filter(created_at__gte=today_start).count()
        pending_orders = Order.objects.filter(status="pending").count()
        low_stock_count = Product.objects.filter(
            is_active=True, stock_quantity__lte=F("min_stock_alert")
        ).count()

        return Response({
            "revenue": {
                "total": float(total_revenue),
                "today": float(today_revenue),
                "this_month": float(month_revenue),
            },
            "orders": {
                "total": total_orders,
                "today": today_orders,
                "pending": pending_orders,
            },
            "low_stock_products": low_stock_count,
        })
