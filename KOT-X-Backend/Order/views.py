import json

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import DiningTable, Order, Order_Items, Menu
from .serializer import OrderItemSerializer, OrderSerializer, MenuSerializzer
from redis.exceptions import ConnectionError as RedisConnectionError

channel_layer = get_channel_layer()


@api_view(["GET"])
def get_order(request, id):
    try:
        table = DiningTable.objects.get(id=id)
        orders = table.orderTable.filter(order_status="active").first()
        serializer = OrderSerializer(orders)
        return Response(serializer.data)
    except (DiningTable.DoesNotExist, Order.DoesNotExist):
        return Response(
            {"data": f"Order not found", "status": status.HTTP_404_NOT_FOUND},
            status=status.HTTP_404_NOT_FOUND,
        )


@api_view(["GET"])
def get_all_orders(request):
    orders = Order.objects.prefetch_related("OrderItem").all()
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(["PATCH"])
def update_OrderItems(request, id):
    try:
        item = Order_Items.objects.get(id=id)
        serializer = OrderItemSerializer(data=request.data, instance=item, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    except Order_Items.DoesNotExist as e:
        return Response(
            {"ID": "Invalid Item ID provided", "status": status.HTTP_404_NOT_FOUND},
            status=status.HTTP_404_NOT_FOUND,
        )


@api_view(["GET"])
def get_all_ordersItems(request):
    orders = Order_Items.objects.all()
    serializer = OrderItemSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(["POST"])
def addItem(request):
    serializer = OrderItemSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(
        {
            "message": "Item Added Sucessfully",
            "data": serializer.data,
            "status": status.HTTP_201_CREATED,
        }
    )


def getOrderByItemId(id):
    item = Order_Items.objects.get(id=id)
    return item.order_ins


@api_view(["DELETE"])
def delete_Items(request, pk):
    try:
        items = Order_Items.objects.get(id=pk)
        order_obj = getOrderByItemId(pk)

        items.delete()

        serializer = OrderSerializer(order_obj)
        return Response(
            {
                "message": "Order item object deleted successfully",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,  #
        )

    except Order_Items.DoesNotExist as e:
        return Response(
            {"message": f"Object with id {pk} not found"},
            status=status.HTTP_404_NOT_FOUND,
        )
    except Order.DoesNotExist:
        return Response(
            {"message": f"Order not found for item {pk}"},
            status=status.HTTP_404_NOT_FOUND,
        )


@api_view(["POST"])
def create_Order(request):
    OrderData = OrderSerializer(data=request.data)
    OrderData.is_valid(raise_exception=True)
    OrderData.save()
    return Response(
        {
            "message": "Order Added",
            "data": OrderData.data,
            "status": status.HTTP_201_CREATED,
        }
    )


@api_view(["PATCH"])
def update_Order(request, pk):
    try:
        order_data = Order.objects.get(id=pk)
        serializer = OrderSerializer(order_data, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        try:
            async_to_sync(channel_layer.group_send)(
                f"order_{str(pk)}", {"type": "update_order", "data": serializer.data}
            )
        except RedisConnectionError as e:
            print("Redis connection failed:", e)
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
    except Order.DoesNotExist:
        return Response(
            {"id": f"Order with ID {pk} does not exist"},
            status=status.HTTP_404_NOT_FOUND,
        )


@api_view(["GET", "POST"])
def menu_list_create(request):
    if request.method == "GET":
        menus = Menu.objects.all()
        serializer = MenuSerializzer(menus, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        serializer = MenuSerializzer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PATCH", "DELETE"])
def menu_detail(request, pk):
    try:
        menu = Menu.objects.get(pk=pk)
    except Menu.DoesNotExist:
        return Response(
            {"error": "Menu item not found"}, status=status.HTTP_404_NOT_FOUND
        )

    if request.method == "GET":
        serializer = MenuSerializzer(menu)
        return Response(serializer.data)

    elif request.method == "PATCH":
        serializer = MenuSerializzer(menu, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        menu.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
