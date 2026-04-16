from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import *
from .serializer import BillingSerializer


@api_view(["GET"])
def getOrders(request, id):
    try:
        bill = Bill.objects.get(id=id)
        serializer = BillingSerializer(bill)
        return Response({"message": serializer.data})
    except Bill.DoesNotExist:
        return Response({"error": "Bill not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(["POST"])
def create_bill(request):
    """Create a new bill"""
    serializer = BillingSerializer(data=request.data)

    if serializer.is_valid():
        bill = serializer.save()
        return Response({"data": serializer.data}, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
