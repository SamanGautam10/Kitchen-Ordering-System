from django.utils import timezone
from django.contrib.auth.models import User
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from Tables.models import DiningTable


class Menu(models.Model):
    CATEGORY_CHOICES = [
        ("Main Course", "Main Course"),
        ("Appetizer", "Appetizer"),
        ("Dessert", "Dessert"),
        ("Beverage", "Beverage"),
        ("Side", "Side Dish"),
    ]
    item_name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    category = models.CharField(
        max_length=20, choices=CATEGORY_CHOICES, default="Main Course"
    )

    def __str__(self):
        return self.item_name


class Order(models.Model):
    table = models.ForeignKey(
        DiningTable, on_delete=models.CASCADE, related_name="orderTable"
    )
    waiter = models.ForeignKey(User, on_delete=models.CASCADE)
    Tip = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(49)], default=0
    )
    order_status = models.CharField(
        choices=[("active", "active"), ("completed", "completed")],
        max_length=50,
        default="active",
    )
    created_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f"Order for Table {self.table.table_name} - {self.id}"


class Order_Items(models.Model):
    order_ins = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name="OrderItem"
    )
    order_items = models.ForeignKey(Menu, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    special_note = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"KOT {self.order_items.item_name} x {self.quantity} - {self.id}"
