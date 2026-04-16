from rest_framework import serializers
from .models import DiningTable, Menu, Order, Order_Items


class MenuSerializzer(serializers.ModelSerializer):
    class Meta:
        model = Menu
        fields = "__all__"


class OrderItemSerializer(serializers.ModelSerializer):
    """
    Feilds: 👇
    order_ins=models.ForeignKey(Order,on_delete=models.CASCADE,related_name='OrderItem')
    order_items=models.ForeignKey(Menu,on_delete=models.CASCADE)
    quantity=models.IntegerField()
    special_note = models.TextField(blank=True, null=True)
    """

    OrderItemID = serializers.IntegerField(required=False)

    class Meta:
        model = Order_Items
        fields = "__all__"
        extra_kwargs = {"order_ins": {"required": False}}  

    def to_internal_value(self, data):  # For rejecting extra feild
        extra_fields = [key for key in data.keys() if key not in self.fields]
        if extra_fields:
            raise serializers.ValidationError(
                {field: "This field is not allowed." for field in extra_fields}
            )
        return super().to_internal_value(data)

    def to_representation(self, instance):
        data = {
            #  No need order_Id since it will be present when getting info of whole order
            "OrderItemID": instance.id,  # Filtered from payload since auto_read by default
            "Item": {
                "item_id": instance.order_items.id,
                "item_name": instance.order_items.item_name,
                "price": float(instance.order_items.price),
            },
            "quantity": instance.quantity,
            "special_note": instance.special_note,
        }
        return data

    def create(self, validated_data):
        print(validated_data)
        try:
            obj = Order_Items.objects.filter(
                order_items=validated_data["order_items"],
                order_ins=validated_data["order_ins"],
            )
            print(obj)
            if obj.exists():
                obj = obj.first()
                obj.quantity += validated_data["quantity"]
                obj.save()
                print("data after validation")
                print(validated_data)
                return obj
            else:
                return super().create(validated_data)
        except KeyError as e:
            raise serializers.ValidationError(e)


class OrderSerializer(serializers.ModelSerializer):
    """
    Feilds: 👇
    table = models.OneToOneField(DiningTable, on_delete=models.CASCADE, related_name='orderTable')
    """

    Items = OrderItemSerializer(many=True, source="OrderItem")

    class Meta:
        model = Order
        fields = "__all__"

    def to_internal_value(self, data):
        extra_fields = [key for key in data.keys() if key not in self.fields]
        if extra_fields:
            raise serializers.ValidationError(
                {field: "This field is not allowed." for field in extra_fields}
            )
        return super().to_internal_value(data)

    def validate(self, attrs):
        return attrs

    def create(self, validated_data):
        table_id = validated_data["table"]
        table = DiningTable.objects.get(id=table_id.id)
        query_set = table.orderTable.filter(order_status="active")
        if query_set:
            raise serializers.ValidationError({"Table": "Table occupied"})
        else:
            table.status = "occupied"
            table.save()
            items = validated_data.pop("OrderItem", [])
            Orders = Order.objects.create(
                table=table_id, waiter=validated_data["waiter"]
            )
            for json in items:
                Order_Items.objects.create(order_ins=Orders, **json)
            return Orders

    def update(self, instance, validated_data):
        OrderItems = validated_data.pop("OrderItem", [])
        if "table" in validated_data:
            setattr(instance, "table", validated_data["table"])
        for itemsList in OrderItems:
            objID = itemsList.get("OrderItemID")
            try:
                Items = Order_Items.objects.get(id=objID)
                serializer = OrderItemSerializer(
                    instance=Items,
                    data={
                        "order_ins": instance.id,
                        "order_items": itemsList["order_items"].id,
                        "quantity": itemsList.get("quantity"),
                        "special_note": itemsList.get("special_note"),
                    },
                )
                serializer.is_valid(raise_exception=True)  
                serializer.save()
            except Order_Items.DoesNotExist:
                raise serializers.ValidationError(
                    f"OrderItem with ID {objID} does not exist for this order."
                )
            except KeyError as e:
                raise serializers.ValidationError(f"Missing required field: {str(e)}")
            except Exception as e:
                raise serializers.ValidationError(f"Unknown error: {str(e)}")
        instance.save()
        return instance
