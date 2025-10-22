# notifications/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("", views.notifications_page, name="notifications"),
    path("mark-all-read/", views.notifications_mark_all_read, name="notifications_mark_all_read"),
    path("clear-all/", views.notifications_clear_all, name="notifications_clear_all"),
    path("<int:pk>/read/", views.notifications_mark_read, name="notifications_mark_read"),
    path("<int:pk>/delete/", views.notifications_delete, name="notifications_delete"),
    path("unread-count/", views.notifications_unread_count, name="notifications_unread_count"),
]
