from django.db import models


class Category(models.TextChoices):
    ELECTRONICS = "electronics", "Eletrônicos"
    CLOTHING = "clothing", "Vestuário"
    BOOKS = "books", "Livros"
    HOME = "home", "Casa & Jardim"
    SPORTS = "sports", "Esportes"
    BEAUTY = "beauty", "Beleza & Saúde"
    TOYS = "toys", "Brinquedos"
    FOOD = "food", "Alimentos"
    OTHER = "other", "Outros"


class Product(models.Model):
    """Represents a product in the store."""

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.OTHER,
    )
    image_url = models.URLField(max_length=500, blank=True)
    stock_quantity = models.PositiveIntegerField(default=0)
    min_stock_alert = models.PositiveIntegerField(
        default=5,
        help_text="Alerta quando estoque ficar abaixo deste valor",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Produto"
        verbose_name_plural = "Produtos"
        ordering = ["-created_at"]

    def __str__(self):
        return self.name

    @property
    def is_low_stock(self):
        """Returns True when stock is at or below the minimum alert threshold."""
        return self.stock_quantity <= self.min_stock_alert

    @property
    def is_in_stock(self):
        return self.stock_quantity > 0
