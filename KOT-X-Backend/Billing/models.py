from django.db import models

from Order.models import Order


class Bill(models.Model):
    Order_ins = models.OneToOneField(
        Order, on_delete=models.CASCADE, related_name="OrderObj"
    )
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    Bill_Total = models.DecimalField(max_digits=10, decimal_places=2)
    Billed_to = models.CharField(max_length=255)
    VAT = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    Discount = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    Billing_Date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Bill for {self.Billed_to} - Rs . {self.Bill_Total}"
