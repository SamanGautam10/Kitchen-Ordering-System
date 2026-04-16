from django.urls import path

from .views import *

urlpatterns = [
    path("<int:id>/", get_order),
    path("all/", get_all_orders),
    path("Items/", get_all_ordersItems),
    path("AddItem/", addItem),
    path("UpdateItem/<int:id>/", update_OrderItems),
    path("deleteItem/<int:pk>/", delete_Items),
    path("create/", create_Order),
    path("update/<str:pk>/", update_Order),
    path("menus/", menu_list_create, name="menu-list-create"),
    path("menus/<int:pk>/", menu_detail, name="menu-detail"),
]
