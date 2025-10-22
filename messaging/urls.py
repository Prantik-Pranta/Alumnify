from django.urls import path
from . import views

urlpatterns = [
    path('', views.inbox, name='inbox'),

    # Chat page (1-to-1 messages)
    path('chat/<int:user_id>/', views.chat, name='chat'),

    # Meeting & scheduling routes
    path('chat/<int:user_id>/meet/', views.chat_start_meeting, name='chat_start_meeting'),
    path('meet/room/<slug:room_code>/', views.meeting_room, name='meeting_room'),
    path('meet/slots/', views.availability_list, name='availability_list'),
    path('meet/manage/', views.availability_manage, name='availability_manage'),
    path('meet/book/<int:slot_id>/', views.availability_book, name='availability_book'),
]
