"""
URL configuration for ecommerce-fullstack project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from users.views import LoginView, RegisterView

urlpatterns = [
    path("django-admin/", admin.site.urls),
    # Auth endpoints
    path("api/auth/login/", LoginView.as_view(), name="login"),
    path("api/auth/register/", RegisterView.as_view(), name="register"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # App endpoints
    path("api/", include("products.urls")),
    path("api/", include("orders.urls")),
    path("api/", include("users.urls")),
    path("api/", include("reports.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
