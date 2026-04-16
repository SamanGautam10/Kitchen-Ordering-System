from django.contrib.auth import get_user_model
from django.test import TestCase

from .models import DiningTable, Menu

User = get_user_model()
if not User.objects.filter(username="admin").exists():
    User.objects.create_superuser(username="admin", email="", password="123")

cool_cities = [
    "Helsinki",
    "Berlin",
    "Oslo",
    "Stockholm",
    "Copenhagen",
    "Vienna",
    "Lisbon",
    "Barcelona",
    "Prague",
    "Tallinn",
    "Riga",
    "Budapest",
    "Amsterdam",
    "Dublin",
    "Reykjavik",
]

for name in cool_cities:
    if DiningTable.objects.filter(table_name=name).exists():
        pass
    else:
        DiningTable.objects.create(table_name=name)


menu_items = [
    {
        "item_name": "Pizza",
        "price": 8.99,
        "is_available": True,
        "item_picture": "placeholder.jpg",
    },
    {
        "item_name": "Burger",
        "price": 6.49,
        "is_available": True,
        "item_picture": "placeholder.jpg",
    },
    {
        "item_name": "Sushi",
        "price": 12.99,
        "is_available": True,
        "item_picture": "placeholder.jpg",
    },
    {
        "item_name": "Pasta",
        "price": 9.99,
        "is_available": True,
        "item_picture": "placeholder.jpg",
    },
    {
        "item_name": "Tacos",
        "price": 5.99,
        "is_available": True,
        "item_picture": "placeholder.jpg",
    },
    {
        "item_name": "Ratatouille",
        "price": 14.50,
        "is_available": True,
        "item_picture": "placeholder.jpg",
    },
    {
        "item_name": "Bánh mì",
        "price": 7.50,
        "is_available": True,
        "item_picture": "placeholder.jpg",
    },
    {
        "item_name": "Kimchi",
        "price": 4.99,
        "is_available": True,
        "item_picture": "placeholder.jpg",
    },
    {
        "item_name": "Tiramisu",
        "price": 6.99,
        "is_available": True,
        "item_picture": "placeholder.jpg",
    },
    {
        "item_name": "Poutine",
        "price": 8.50,
        "is_available": True,
        "item_picture": "placeholder.jpg",
    },
    {
        "item_name": "Gelato",
        "price": 5.50,
        "is_available": True,
        "item_picture": "placeholder.jpg",
    },
    {
        "item_name": "Ceviche",
        "price": 13.99,
        "is_available": True,
        "item_picture": "placeholder.jpg",
    },
    {
        "item_name": "Gnocchi",
        "price": 11.50,
        "is_available": True,
        "item_picture": "placeholder.jpg",
    },
    {
        "item_name": "Paella",
        "price": 15.99,
        "is_available": True,
        "item_picture": "placeholder.jpg",
    },
    {
        "item_name": "Croissant",
        "price": 3.50,
        "is_available": True,
        "item_picture": "placeholder.jpg",
    },
]

for food in menu_items:
    if not Menu.objects.filter(item_name=food["item_name"]).exists():
        Menu.objects.create(**food)
    else:
        print(f"{food['item_name']} already exists")
