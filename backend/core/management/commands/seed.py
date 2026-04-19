"""
Management command to seed the database with demo data.
Usage: python manage.py seed
"""

import random
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

from users.models import User
from products.models import Product, Category
from orders.models import Order, OrderItem


PRODUCTS_DATA = [
    {
        "name": "Smartphone Galaxy Pro",
        "description": "Smartphone top de linha com câmera de 108MP e bateria de 5000mAh.",
        "price": Decimal("2499.90"),
        "category": Category.ELECTRONICS,
        "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
        "stock_quantity": 50,
        "min_stock_alert": 5,
    },
    {
        "name": "Notebook UltraSlim",
        "description": "Notebook leve com processador Intel i7, 16GB RAM e SSD 512GB.",
        "price": Decimal("4299.00"),
        "category": Category.ELECTRONICS,
        "image_url": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
        "stock_quantity": 20,
        "min_stock_alert": 3,
    },
    {
        "name": "Fone de Ouvido Bluetooth",
        "description": "Fone sem fio com cancelamento de ruído e 30h de bateria.",
        "price": Decimal("299.90"),
        "category": Category.ELECTRONICS,
        "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
        "stock_quantity": 4,
        "min_stock_alert": 5,
    },
    {
        "name": "Camiseta Premium",
        "description": "Camiseta de algodão 100% com corte moderno.",
        "price": Decimal("79.90"),
        "category": Category.CLOTHING,
        "image_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
        "stock_quantity": 150,
        "min_stock_alert": 10,
    },
    {
        "name": "Tênis Esportivo Runner",
        "description": "Tênis leve ideal para corrida e treinos.",
        "price": Decimal("349.90"),
        "category": Category.SPORTS,
        "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
        "stock_quantity": 2,
        "min_stock_alert": 5,
    },
    {
        "name": "Clean Code - Robert Martin",
        "description": "O guia definitivo para escrever código limpo e sustentável.",
        "price": Decimal("69.90"),
        "category": Category.BOOKS,
        "image_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
        "stock_quantity": 80,
        "min_stock_alert": 10,
    },
    {
        "name": "Cafeteira Espresso",
        "description": "Cafeteira automática com moedor integrado e vaporizador de leite.",
        "price": Decimal("799.00"),
        "category": Category.HOME,
        "image_url": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400",
        "stock_quantity": 3,
        "min_stock_alert": 5,
    },
    {
        "name": "Kit Skincare Completo",
        "description": "Kit com hidratante, sérum vitamina C e protetor solar FPS 50.",
        "price": Decimal("189.90"),
        "category": Category.BEAUTY,
        "image_url": "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400",
        "stock_quantity": 60,
        "min_stock_alert": 8,
    },
    {
        "name": "Bicicleta Mountain Bike",
        "description": "Bicicleta aro 29 com 21 marchas e suspensão dianteira.",
        "price": Decimal("1899.00"),
        "category": Category.SPORTS,
        "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
        "stock_quantity": 8,
        "min_stock_alert": 3,
    },
    {
        "name": "LEGO Technic 4x4",
        "description": "Set LEGO Technic com 800 peças e controle remoto.",
        "price": Decimal("459.90"),
        "category": Category.TOYS,
        "image_url": "https://images.unsplash.com/photo-1609237956119-a5b4a1f3d769?w=400",
        "stock_quantity": 25,
        "min_stock_alert": 5,
    },
]


class Command(BaseCommand):
    help = "Seed the database with demo data"

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding database...")

        # Create admin user
        admin, created = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "admin@email.com",
                "first_name": "Admin",
                "last_name": "Sistema",
                "role": User.Role.ADMIN,
                "phone": "(11) 99999-0001",
                "address": "Rua Admin, 1, São Paulo - SP",
                "is_staff": True,
                "is_superuser": True,
            },
        )
        if created:
            admin.set_password("admin123")
            admin.save()
            self.stdout.write(self.style.SUCCESS("  Admin created: admin@email.com / admin123"))

        # Create customer users
        customers = []
        for i in range(1, 6):
            user, created = User.objects.get_or_create(
                username=f"cliente{i}",
                defaults={
                    "email": f"cliente{i}@email.com",
                    "first_name": f"Cliente",
                    "last_name": f"Número {i}",
                    "role": User.Role.CUSTOMER,
                    "phone": f"(11) 9888{i:04d}",
                    "address": f"Rua Exemplo, {i * 100}, São Paulo - SP",
                },
            )
            if created:
                user.set_password("cliente123")
                user.save()
            customers.append(user)

        self.stdout.write(f"  {len(customers)} customers ready")

        # Create products
        products = []
        for data in PRODUCTS_DATA:
            product, _ = Product.objects.get_or_create(
                name=data["name"], defaults=data
            )
            products.append(product)
        self.stdout.write(f"  {len(products)} products ready")

        # Create 20 orders spread over the last 60 days
        statuses = [
            Order.Status.PENDING, Order.Status.CONFIRMED,
            Order.Status.SHIPPED, Order.Status.DELIVERED, Order.Status.CANCELLED,
        ]
        payment_statuses = [Order.PaymentStatus.PAID, Order.PaymentStatus.PENDING]

        created_count = 0
        if Order.objects.count() < 20:
            for i in range(20):
                user = random.choice(customers)
                days_ago = random.randint(0, 60)
                order_date = timezone.now() - timedelta(days=days_ago)
                order_status = random.choice(statuses)
                pay_status = (
                    Order.PaymentStatus.PAID
                    if order_status in [Order.Status.CONFIRMED, Order.Status.SHIPPED, Order.Status.DELIVERED]
                    else random.choice(payment_statuses)
                )

                order = Order.objects.create(
                    user=user,
                    status=order_status,
                    payment_status=pay_status,
                    shipping_address=user.address,
                    created_at=order_date,
                )
                # Manually set the timestamp
                Order.objects.filter(pk=order.pk).update(created_at=order_date)

                # Add 1-4 random products
                selected = random.sample(products, k=random.randint(1, 4))
                for product in selected:
                    qty = random.randint(1, 3)
                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        quantity=qty,
                        unit_price=product.price,
                    )

                order.calculate_total()
                created_count += 1

        self.stdout.write(f"  {created_count} orders created")
        self.stdout.write(self.style.SUCCESS("Database seeded successfully!"))
        self.stdout.write("")
        self.stdout.write("Demo credentials:")
        self.stdout.write("  Admin:    admin@email.com / admin123")
        self.stdout.write("  Customer: cliente1@email.com / cliente123")
