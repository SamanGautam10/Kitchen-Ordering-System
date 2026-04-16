import json

from django.contrib.auth.models import User
from django.http import HttpResponse
from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import UserProfile
from .serializer import AuthSerializer, ProfileSerializer, UserSerializer


@api_view(["GET", "HEAD"])
def home(request):
    return Response({"msg": "OK and running"})


@api_view(["POST"])
def login_view(request):
    data = request.data
    serializer = AuthSerializer(data=data)
    if serializer.is_valid():
        action = serializer.validated_data["action"]
        print(action)
        if action == "login":
            payload = serializer.login(serializer.validated_data)
        if action == "register":
            payload = serializer.register(serializer.validated_data)
        response_data = {
            "data": payload,
            "success": True,
            "status_code": status.HTTP_202_ACCEPTED,
        }
        return Response(response_data, status=status.HTTP_202_ACCEPTED)
    else:
        return Response(
            {
                "message": "Authentication Failed",
                "error": serializer.errors,
                "status": f"{status.HTTP_401_UNAUTHORIZED}",
            },
            status.HTTP_401_UNAUTHORIZED,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_byID(request, pk):
    try:
        userobj = User.objects.get(id=pk)
        profileobj = UserProfile.objects.get(user=userobj)
        serializer = ProfileSerializer(instance=profileobj)
        return Response(
            {"data": serializer.data, "status_code": status.HTTP_200_OK},
            status=status.HTTP_200_OK,
        )

    except User.DoesNotExist:
        return Response(
            {"message": "User Not Found", "status_code": status.HTTP_404_NOT_FOUND},
            status=status.HTTP_404_NOT_FOUND,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_all_users(request):
    users = UserProfile.objects.all()
    if not users.exists():
        return Response(
            {
                "data": [],
                "status_code": status.HTTP_404_NOT_FOUND,
                "message": "No users found",
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    serializer = ProfileSerializer(users, many=True)
    return Response(
        {"data": serializer.data, "status_code": status.HTTP_200_OK},
        status=status.HTTP_200_OK,
    )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_user(request, pk):
    try:
        profile = UserProfile.objects.get(id=pk)
        serializer = ProfileSerializer(
            instance=profile, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"data": serializer.data, "status": status.HTTP_200_OK},
            status=status.HTTP_200_OK,
        )

    except UserProfile.DoesNotExist:
        return Response(
            {"data": "No user Found", "status": status.HTTP_404_NOT_FOUND},
            status=status.HTTP_404_NOT_FOUND,
        )
