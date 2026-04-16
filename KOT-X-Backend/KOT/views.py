from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Sum
from datetime import date
from Billing.models import *
from Tables.models import *
from Order.models import *

from datetime import date, timedelta
from django.db.models import Sum
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def dashboard_stats(request):
    today = date.today()
    yesterday = today - timedelta(days=1)

    today_revenue = (
        Bill.objects.filter(Billing_Date=today)
        .aggregate(total=Sum('Bill_Total'))['total'] or 0
    )

    yesterday_revenue = (
        Bill.objects.filter(Billing_Date=yesterday)
        .aggregate(total=Sum('Bill_Total'))['total'] or 0
    )

    if yesterday_revenue > 0:
        revenue_trend = ((today_revenue - yesterday_revenue) / yesterday_revenue) * 100
    else:
        revenue_trend = 100 if today_revenue > 0 else 0


    today_orders = Order.objects.filter(created_at__date=today).count()
    yesterday_orders = Order.objects.filter(created_at__date=yesterday).count()

    if yesterday_orders > 0:
        orders_trend = ((today_orders - yesterday_orders) / yesterday_orders) * 100
    else:
        orders_trend = 100 if today_orders > 0 else 0

    total_tables = DiningTable.objects.count()

    total_menu_items = Menu.objects.count()

    yesterday_menu_items = Menu.objects.filter(
        created_at=yesterday
    ).count()

    if yesterday_menu_items > 0:
        menu_trend = ((total_menu_items - yesterday_menu_items) / yesterday_menu_items) * 100
    else:
        menu_trend = 0

    return Response({
        "revenue": round(today_revenue, 2),
        "revenue_trend": round(revenue_trend, 2),

        "orders": today_orders,
        "orders_trend": round(orders_trend, 2),

        "tables": total_tables,

        "menu": total_menu_items,
        "menu_trend": round(menu_trend, 2),
    })