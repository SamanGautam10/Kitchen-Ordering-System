from django.contrib.auth.models import User
from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator


class DiningTable(models.Model):
    table_name = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    status = models.CharField(
        choices=[("available", "available"), ("occupied", "occupied")],
        default="available",
    )
    capacity = models.IntegerField(
        default=4, validators=[MaxValueValidator(10), MinValueValidator(2)]
    )

    def __str__(self):
        return self.table_name
