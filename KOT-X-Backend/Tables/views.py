from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import (
    api_view,
    permission_classes,
    authentication_classes,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import DiningTable
from .serializer import TableSerializer


@api_view(["GET"])
# @permission_classes([IsAuthenticated])
def get_all_tables(request):
    tables = DiningTable.objects.all()
    serializer = TableSerializer(tables, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
# @permission_classes([IsAuthenticated])
def get_table_by_id(request, pk):
    try:
        table = DiningTable.objects.get(pk=pk)
    except DiningTable.DoesNotExist:
        return Response({"error": "Table not found"}, status=status.HTTP_404_NOT_FOUND)
    serializer = TableSerializer(table)
    return Response(serializer.data, status=status.HTTP_200_OK)


# @permission_classes([IsAuthenticated])
@api_view(["PUT"])
def update_table(request, pk):
    try:
        table = DiningTable.objects.get(pk=pk)
    except DiningTable.DoesNotExist:
        return Response({"error": "Table not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = TableSerializer(table, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(["POST"])
def create_table(request):
    table_name = request.data.get("table_name")
    if not table_name:
        return Response(
            {"error": "table_name is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    # Use get_or_create to avoid duplicates
    table, created = DiningTable.objects.get_or_create(table_name=table_name)
    serializer = TableSerializer(table)
    return Response(
        {"table": serializer.data, "created": created},
        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
    )


@api_view(["DELETE"])
def delete_table(request, pk):
    try:
        table = DiningTable.objects.get(pk=pk)
        table.delete()
        return Response(
            {
                "status": "success",
                "message": f"Table {pk} deleted successfully",
            },
            status=status.HTTP_200_OK,
        )
    except DiningTable.DoesNotExist:
        return Response(
            {
                "status": "error",
                "message": f"Object with id {pk} not found",
            },
            status=status.HTTP_404_NOT_FOUND,
        )