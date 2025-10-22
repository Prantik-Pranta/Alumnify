from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('User.urls')),
    path('', include('feed.urls')),
    path('messaging/', include('messaging.urls')),
    path('notifications/', include('notifications.urls')),



]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
