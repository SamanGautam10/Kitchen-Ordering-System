from rest_framework import serializers

from .models import *


class TableSerializer(serializers.ModelSerializer):
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)

    class Meta:
        model = DiningTable
        fields = "__all__"
