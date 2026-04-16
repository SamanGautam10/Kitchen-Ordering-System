from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from . import utility
from .models import UserProfile
from .utility import check_pass


class AuthSerializer(serializers.Serializer):
    """
    1. user should have email , password and action for login
    2. user shpuld provide username email password and first name and last name are optional
    """

    action = serializers.ChoiceField(
        choices=["login", "register"],
        required=True,
        error_messages={
            "invalid_choice": "Not a valid option -> : [ login , register ]"
        },
    )

    password = serializers.CharField(
        write_only=True,
        required=True,
        error_messages={
            "required": "Password required",
            "blank": "Password cannot be empty",
            "invalid": "Wrong Data_Type passed expected : (str->) ",
        },
    )

    username = serializers.CharField(
        required=False, allow_blank=True, help_text="Username for login/registration"
    )

    email = serializers.EmailField(
        error_messages={
            "required": "email Feild required",
            "blank": "email cant be empty",
            "invalid": "Invalid Email format",
        }
    )

    first_name = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="First name (required for registration)",
    )

    last_name = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Last name (required for registration)",
    )

    allowed_fields = {
        "login": ["email", "password"],
        "register": ["username", "email", "password", "first_name", "last_name"],
    }

    required_fields = {
        "login": ["email", "password"],
        "register": ["username", "email", "password"],
    }

    def validate(self, data):
        action = data.get("action")

        allowed = self.allowed_fields[action]

        for key in self.initial_data.keys():
            if key != "action" and key not in allowed:
                raise serializers.ValidationError(
                    f'{key} is not valid field. Required -> [{",".join(allowed)}]'
                )

        if data["action"] == "login":
            return self.validate_login(data)
        elif data["action"] == "register":
            return self.validate_registration(data)

    def validate_login(self, data):
        # NOTE : Add below validation rules
        """
        1. Validate the missing feilds
        2. Validate required feilds
        3. Validate empty feilds (Is optional handled it vai serializer rule)
        """
        email = data.get("email", "")
        password = data.get("password", "")
        if not email:
            raise serializers.ValidationError({"email": "Email is required for login"})

        if not password:
            raise serializers.ValidationError(
                {"password": "Password is required for login"}
            )

        return data

    def validate_registration(self, data):
        for field in self.required_fields["register"]:
            if field not in data.keys():
                raise serializers.ValidationError(
                    {"FIELD_MISSING": f"Key Error : {field} key is missing in payload"}
                )

        if User.objects.filter(email=data["email"]).exists():
            raise serializers.ValidationError(
                {"email": "This email is already registered"}
            )

        if User.objects.filter(username=data["username"]).exists():
            raise serializers.ValidationError(
                {"username": "This username is already taken"}
            )

        payload_password = data.get("password", "")
        status, message, error_Type = utility.check_pass(payload_password)
        if status is False:
            raise serializers.ValidationError({error_Type: message})
        return data

    def login(self, validated_data):
        email = validated_data["email"]
        password = validated_data["password"]
        try:
            userObj = User.objects.get(email=email)
            result = authenticate(username=userObj.username, password=password)
            if result:
                refresh = RefreshToken.for_user(result)

                payload = {
                    "access_Token": f"{str(refresh.access_token)}",
                    "Refresh_Token": f"{str(refresh)}",
                }
                return payload
            else:
                raise serializers.ValidationError("Invalid Credentials Provided")
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid Email Provided")

    def register(self, validated_data):
        validated_data.pop("action", None)
        print(validated_data)
        userobj = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=userobj)
        return


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "email",
            "username",
            "is_staff",
            "is_active",
            "is_superuser",
            "password",
            "first_name",
            "last_name",
        ]
        extra_kwargs = {
            "email": {"allow_blank": False, "required": True},
            "password": {"write_only": True, "allow_blank": False, "required": True},
            "username": {"allow_blank": False, "required": True},
        }

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        result, message, msg_title = check_pass(password)
        if not result:
            raise serializers.ValidationError({msg_title: message})
        else:
            setattr(instance, "password", password)
            for key, value in validated_data.items():
                setattr(instance, key, value)
        instance.save()
        return instance


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = UserProfile
        fields = ["role", "user"]
        extra_kwargs = {
            "role": {
                "allow_blank": False,
                "error_messages": {"blank": "Empty Value not Detected. "},
            }
        }

    def to_internal_value(self, data):
        user_fields = ["id", "username", "first_name", "last_name", "email", "password"]
        data = data.copy()
        if "user" not in data:
            user_data = {}
            for field in user_fields:
                if field in data:
                    user_data[field] = data.pop(field)
            data["user"] = user_data

        return super().to_internal_value(data)

    def validate_role(self, data):
        if not data.strip():
            raise serializers.ValidationError("Empty value not allowed for role.")
        return data

    def update(self, instance, validated_data):
        if "user" in self.validated_data:
            user_data = validated_data.pop("user")
            user = instance.user
            serializer = UserSerializer(instance=user, data=user_data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
        for key, value in validated_data.items():
            setattr(instance, key, value)
        instance.save()
        return instance
