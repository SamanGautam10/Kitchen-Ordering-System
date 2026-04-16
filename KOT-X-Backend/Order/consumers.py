import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

from Order.serializer import *

from .models import Order


class CloseCodes:
    """Custom close codes for your application"""

    # Authentication (4000-4099)
    AUTH_REQUIRED = 4000

    # Permission (4100-4199)
    NO_PERMISSION = 4100

    # Order related (4200-4299)
    ORDER_NOT_FOUND = 4200

    # Business logic (4400-4499)
    INSUFFICIENT_FUNDS = 4400
    ITEM_OUT_OF_STOCK = 4401
    QUANTITY_EXCEEDED = 4402


class OrderConsumer(WebsocketConsumer):
    def connect(self):
        self.order_id = self.scope["url_route"]["kwargs"]["order_id"]
        try:
            Order.objects.get(id=self.order_id)
            self.orderGroup = f"order_{self.order_id}"
            async_to_sync(self.channel_layer.group_add)(
                self.orderGroup, self.channel_name
            )
            self.accept()
            self.send("Connection Initiated")
            # self.send_preloaded_data()
        except Order.DoesNotExist:
            self.accept()
            self.close(code=CloseCodes.ORDER_NOT_FOUND, reason="Invalid Id provided")
            return

    def send_preloaded_data(self):
        Orderdata = Order.objects.get(id=self.order_id)
        serializer = OrderSerializer(Orderdata)
        self.send(text_data=json.dumps(serializer.data))

    def receive(self):
        pass

    def disconnect(self, code):
        print(f"🔴 DISCONNECTED: Order {self.order_id}")
        async_to_sync(self.channel_layer.group_discard)(
            self.orderGroup, self.channel_name
        )

    def update_order(self, event):
        try:
            data = event["data"]
            self.send(text_data=json.dumps(data))
        except Exception as e:
            print("❌ ERROR in haha:", e)
