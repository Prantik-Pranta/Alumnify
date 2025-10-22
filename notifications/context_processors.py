def notifications_context(request):
    if not request.user.is_authenticated:
        return {}
    qs = request.user.notifications.filter(is_read=False)
    return {
        'unread_notifications_count': qs.count(),
        'has_unread_notifications': qs.exists(),
    }
