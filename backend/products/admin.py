from django.contrib import admin
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "price", "stock_quantity", "is_active", "is_low_stock"]
    list_filter = ["category", "is_active"]
    search_fields = ["name", "description"]
    list_editable = ["is_active"]
