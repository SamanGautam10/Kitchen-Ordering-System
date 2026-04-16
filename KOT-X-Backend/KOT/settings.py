import os
from pathlib import Path

# Base directory of the project - where manage.py lives
BASE_DIR = Path(__file__).resolve().parent.parent

# Secret key for cryptographic signing - KEEP THIS SECRET IN PRODUCTION!
SECRET_KEY = "django-insecure-giou)2toat=xpu3h7!!t9c$9ks8b@h8zwy-h4gfwuv9i!@9kqr"

# NOTE: Debug mode - Set to False in production! True shows detailed error pages Turn this to true for now
DEBUG = True

# Hosts/domains that can serve this Django application
# NOTE: ['*'] means any host - NOT recommended for production!
ALLOWED_HOSTS = ["*"]
CORS_ALLOW_ALL_ORIGINS = True
# CORS_ALLOWED_ORIGIN=["*"]

# Main URL configuration module
ROOT_URLCONF = "KOT.urls"

# WSGI application path for serving the project
WSGI_APPLICATION = "KOT.wsgi.application"

# Default language for the application
LANGUAGE_CODE = "en-us"

# Default timezone for date/time handling
TIME_ZONE = "UTC"

# Enable Django's translation system
USE_I18N = True

# Use timezone-aware datetimes in database
USE_TZ = True

# URL prefix for serving static files (CSS, JS, images)
STATIC_URL = "static/"

# This is where files from all apps + STATICFILES_DIRS will be collected
STATIC_ROOT = BASE_DIR / "staticfiles"

# Default and fallback URL for redis
REDIS_URL = os.environ.get("REDIS_URL", "redis://127.0.0.1:6379")


# ASGI application pathway

ASGI_APPLICATION = "KOT.asgi.application"
WSGI_APPLICATION = "KOT.wsgi.application"

# Project-level static folder (create this!)
STATICFILES_DIRS = [
    BASE_DIR / "static",
]
MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")
# SQLite database configuration
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",  # Database backend
        "NAME": BASE_DIR / "db.sqlite3",  # Database file path
    }
}

# All installed apps for this Django project
INSTALLED_APPS = [
    # Django built-in apps
    "django.contrib.admin",  # Admin interface
    "django.contrib.auth",  # Authentication system
    "django.contrib.contenttypes",  # Framework for content types
    "django.contrib.sessions",  # Session management
    "django.contrib.messages",  # Flash messaging system
    "django.contrib.staticfiles",  # Static file management
    # Third-party apps
    "rest_framework",  # Django REST Framework
    "whitenoise",  # Whitenoise to serve static files
    "rest_framework_simplejwt",  # JWT app for DRF
    "corsheaders",  # for frontend calls
    # Djnago Applications
    "Authentication",
    "Tables",
    "Order",
    "Billing",
    "Livedata",
]

# Middleware components - processed in order for each request/response
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # cors header middle ware
    "django.middleware.security.SecurityMiddleware",  # Security enhancements
    "whitenoise.middleware.WhiteNoiseMiddleware",  # NOTE: Keep this Exactly here
    "django.contrib.sessions.middleware.SessionMiddleware",  # Session support
    "django.middleware.common.CommonMiddleware",  # Various HTTP features
    "django.middleware.csrf.CsrfViewMiddleware",  # CSRF protection
    "django.contrib.auth.middleware.AuthenticationMiddleware",  # Associate users with requests
    "django.contrib.messages.middleware.MessageMiddleware",  # Cookie-based messages
    "django.middleware.clickjacking.XFrameOptionsMiddleware",  # Clickjacking protection
]

# Template engine configuration
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],  # Custom template directories
        "APP_DIRS": True,  # Look for templates in app directories
        "OPTIONS": {
            "context_processors": [  # Variables available in all templates
                "django.template.context_processors.request",  # Request object
                "django.contrib.auth.context_processors.auth",  # User object
                "django.contrib.messages.context_processors.messages",  # Messages
            ],
        },
    },
]

# Rules for validating user passwords
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",  # Password too similar to user attributes
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",  # Minimum length requirement
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",  # Password too common
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",  # Password entirely numeric
    },
]

# Engine settings for the JWT framework
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework.authentication.BasicAuthentication",
    ]
}

from datetime import timedelta

SIMPLE_JWT = {
    # Token lifetimes (REQUIRED)
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    # Security settings
    "ROTATE_REFRESH_TOKENS": True,  # Get new refresh token when refreshing
    "BLACKLIST_AFTER_ROTATION": True,  # Old refresh tokens become invalid
    # Custom header format
    "AUTH_HEADER_TYPES": ("Token_ID",),  # Use "Token_ID" instead of "Bearer"
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",  # Look in Authorization header
}

# Setting up the  channel layer for instances
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [REDIS_URL],
        },
    },
}

TIME_ZONE = "Asia/Kathmandu"
USE_TZ = True
print(REDIS_URL)
