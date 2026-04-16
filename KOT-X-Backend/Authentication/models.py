from django.contrib.auth.models import User
from django.db import models


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("owner", "Owner"),
        ("manager", "Manager"),
        ("staff", "Staff"),
        ("chef", "Chef"),
    ]
    role = models.CharField(
        max_length=20, choices=ROLE_CHOICES, default="staff", null=False, blank=False
    )
    created_at = models.DateTimeField(auto_now_add=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.id} ({self.role})"
