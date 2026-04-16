# your_project/asgi.py

import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "KOT.settings")

# Django ASGI application (handles HTTP)
django_asgi_app = get_asgi_application()

import Order.routing

# Main ASGI application
application = ProtocolTypeRouter(
    {
        # HTTP requests go to Django
        "http": django_asgi_app,
        # WebSocket requests go to Channels
        "websocket": AllowedHostsOriginValidator(
            AuthMiddlewareStack(URLRouter(Order.routing.websocket_urlpatterns))
        ),
    }
)
