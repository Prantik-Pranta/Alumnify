from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse
from django.contrib import messages
from .models import Notification
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from .models import Notification  
from User.models import UserProfile

@login_required
def notifications_page(request):
    user_profile = getattr(request.user, 'userprofile', None)
    items = (Notification.objects
             .filter(user=request.user)
             .order_by('-created_at'))

    return render(request, 'notifications/notifications.html', {
        'items': items,
        'user_profile': user_profile,   
    })


@login_required
def notifications_mark_all_read(request):
    if request.method != "POST":
        messages.error(request, "Invalid request.")
        return redirect("notifications")

    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    messages.success(request, "All notifications marked as read.")
    return redirect("notifications")


@login_required
def notifications_clear_all(request):
    if request.method != "POST":
        messages.error(request, "Invalid request.")
        return redirect("notifications")

    Notification.objects.filter(user=request.user).delete()
    messages.success(request, "All notifications cleared.")
    return redirect("notifications")


@login_required
def notifications_mark_read(request, pk):
    if request.method != "POST":
        messages.error(request, "Invalid request.")
        return redirect("notifications")

    notif = get_object_or_404(Notification, id=pk, user=request.user)
    if not notif.is_read:
        notif.is_read = True
        notif.save(update_fields=["is_read"])
    messages.info(request, "Notification marked as read.")
    return redirect("notifications")


@login_required
def notifications_delete(request, pk):
    if request.method != "POST":
        messages.error(request, "Invalid request.")
        return redirect("notifications")

    notif = get_object_or_404(Notification, id=pk, user=request.user)
    notif.delete()
    messages.info(request, "Notification deleted.")
    return redirect("notifications")


@login_required
def notifications_unread_count(request):
    """
    Optional: used by your header to show a dot/badge.
    Returns plain text (no JSON, no AJAX requirement—can be polled if desired).
    """
    count = Notification.objects.filter(user=request.user, is_read=False).count()
    return HttpResponse(str(count), content_type="text/plain")
