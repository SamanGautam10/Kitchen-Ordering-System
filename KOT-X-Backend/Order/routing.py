from django.urls import path

from .consumers import OrderConsumer

websocket_urlpatterns = [
    path("ws/order/<int:order_id>/", OrderConsumer.as_asgi()),
]
