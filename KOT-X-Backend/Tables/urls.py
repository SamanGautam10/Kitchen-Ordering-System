from django.urls import path

from . import views

urlpatterns = [
    path("all/", views.get_all_tables, name="get_all_tables"),  # GET all tables
    path(
        "get/<int:pk>/", views.get_table_by_id, name="get_table_by_id"
    ),  # GET table by ID
    path(
        "update/<int:pk>/", views.update_table, name="update_table"
    ),  # PUT update table by ID
    path("create/", views.create_table, name="create_table"),  # POST create new table
    path("delete/<int:pk>/", views.delete_table, name="create_table"),  # POST create new table
]
