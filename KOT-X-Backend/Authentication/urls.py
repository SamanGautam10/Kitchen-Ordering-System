from django.urls import path

from . import views

urlpatterns = [
    path("login/", views.login_view, name="login_view"),  # GET:  Login for Staff
    path("list/", views.get_all_users, name="get_all_users"),  # GET:  all users
    path(
        "get/<int:pk>/", views.get_user_byID, name="get_user_byID"
    ),  # GET:  Single user by ID
    path(
        "update/<int:pk>", views.update_user, name="update_user"
    ),  # PATCH: update user data partially
]
