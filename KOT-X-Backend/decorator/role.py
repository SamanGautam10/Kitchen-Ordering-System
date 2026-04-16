from rest_framework import status
from rest_framework.response import Response


def role_required(allowed_roles):
    """
    Decorator to check if user has required role(s).
    Usage: @role_required('admin') or @role_required(['admin', 'manager'])
    """

    def decorator(func):
        def wrapper(request, *args, **kwargs):
            # Get user role from UserProfile (OneToOne relationship)
            try:
                user_role = request.user.userprofile.role
            except AttributeError:
                return Response(
                    {"error": "User profile not found"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            except Exception as e:
                return Response(
                    {"error": f"Error fetching user role: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            if isinstance(allowed_roles, (list, tuple)):
                if user_role not in allowed_roles:
                    return Response(
                        {"error": "Insufficient permissions"},
                        status=status.HTTP_403_FORBIDDEN,
                    )
            else:
                if user_role != allowed_roles:
                    return Response(
                        {"error": "Insufficient permissions"},
                        status=status.HTTP_403_FORBIDDEN,
                    )

            # All checks passed, call the original function
            return func(request, *args, **kwargs)

        return wrapper

    return decorator
