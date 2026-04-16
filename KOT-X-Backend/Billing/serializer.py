from rest_framework import serializers

from .models import *
from Tables.models import *
from django.utils import timezone
from Order.serializer import OrderSerializer


class BillingSerializer(serializers.ModelSerializer):
    """
    feilds:
    Order_ins = models.OneToOneField(
        Order, on_delete=models.CASCADE, related_name="OrderObj"
    )
    Bill_Total = models.DecimalField(max_digits=10, decimal_places=2)
    Billed_to = models.CharField(max_length=255)
    VAT = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    Discount = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    Billing_Date = models.DateTimeField(auto_now_add=True)

    payload={
        Order_ins =<ordre_id>,
        Billed_to = <Billing person name>
        Discount = <Discount percentage given>
    }
    """

    Order_id = serializers.PrimaryKeyRelatedField(
        queryset=Order.objects.all(), source="Order_ins"
    )
    Name = serializers.CharField(source="Billed_to")

    class Meta:
        model = Bill
        fields = ["Order_id", "Name", "Discount","VAT"]

    def to_internal_value(self, data):
        extra_fields = [key for key in data.keys() if key not in self.fields]
        missing_fields = [key for key in self.fields if key not in data.keys()]
        
        if extra_fields:
            raise serializers.ValidationError({
                field: f"'{field}' is not a permitted field for this resource." 
                for field in extra_fields
            })
        
        if missing_fields:
            raise serializers.ValidationError({
                field: f"'{field}' is required but was not provided in the request payload."
                for field in missing_fields
            })
    
        return super().to_internal_value(data)
    
    def to_representation(self, instance):
        """Convert string values to integers/decimals in the output"""
        data = {
            "Order_id": OrderSerializer(instance.Order_ins).data,
            "Name": instance.Billed_to,
            "Discount": float(instance.Discount),
            "Bill_Total": float(instance.Bill_Total),
            "Subtotal": float(instance.subtotal),
            "VAT": float(instance.VAT),
            "Billing_Date": instance.Billing_Date.strftime("%d/%m/%Y %H:%M"),
        }
        return data

    def validate(self, attrs):
        error = {}
        for key, value in attrs.items():
            if value is None or isinstance(value, str) and value.strip() == "":
                error[key] = "Feild cannot have and Empty string"
        if error:
            raise serializers.ValidationError(error)
        return attrs

    def create(self, validated_data):
        print(validated_data)
        Order_instance = validated_data["Order_ins"]
        Order_instance.table.status = "available"
        Order_instance.order_status = "completed"
        Order_instance.table.save()
        Order_instance.save()
        discount = int(validated_data["Discount"])
        vat = int(validated_data["VAT"])
        subtotal = 0
        items = Order_instance.OrderItem.all()

        if items:
            # Calculate subtotal from items
            for item in items:
                subtotal += item.order_items.price * item.quantity
            
            # Apply discount if any
            if discount > 0:
                discountAmount = (subtotal * discount) / 100
                after_discount = subtotal - discountAmount
            else:
                discountAmount = 0
                after_discount = subtotal
            
            # Apply VAT on the discounted amount
            Total = after_discount + (after_discount * vat) / 100
        else:
            raise serializers.ValidationError("No Items Ordered yet")
        data={
            "Bill_Total":Total,
            "subtotal":subtotal,
            "VAT":vat
        }
        validated_data.update(data)
        Bill_obj = Bill.objects.create(**validated_data)
        return Bill_obj
