from django.urls import path
from .views import (
    SalesReportView,
    TopProductsView,
    StockAlertsView,
    RevenueReportView,
)

urlpatterns = [
    path("reports/sales/", SalesReportView.as_view(), name="report-sales"),
    path("reports/top-products/", TopProductsView.as_view(), name="report-top-products"),
    path("reports/stock-alerts/", StockAlertsView.as_view(), name="report-stock-alerts"),
    path("reports/revenue/", RevenueReportView.as_view(), name="report-revenue"),
]
