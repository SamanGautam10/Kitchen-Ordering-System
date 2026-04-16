from django.urls import path

from .views import *

urlpatterns = [
    path("create-bill/", create_bill, name="create-bill"),  # POST
    path("<int:id>/", getOrders),
]
