from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.shortcuts import render, redirect, get_object_or_404
from django.db.models import Q, Max
from django.contrib.auth.models import User
from .models import Message
from User.models import Connection, UserProfile
from django.urls import reverse
from notifications.utils import notify


def _connected_user_ids(me):
    links = Connection.objects.filter(Q(user1=me) | Q(user2=me))
    connected = set()
    for link in links:
        connected.add(link.user2_id if link.user1_id == me.id else link.user1_id)
    return connected


@login_required
def inbox(request):
    me = request.user
    connected_ids = _connected_user_ids(me)

    users = (
        User.objects
        .filter(id__in=connected_ids)
        .exclude(is_staff=True)
        .exclude(is_superuser=True)
        .order_by('first_name', 'last_name', 'username')
    )

    last_map = {}
    if connected_ids:
        pairs = (
            Message.objects
            .filter(Q(sender=me, receiver_id__in=connected_ids) |
                    Q(receiver=me, sender_id__in=connected_ids))
            .values('sender_id', 'receiver_id')
            .annotate(last_time=Max('timestamp'))
        )
        for row in pairs:
            s, r = row['sender_id'], row['receiver_id']
            key = (min(s, r), max(s, r))
            last_msg = (
                Message.objects
                .filter(Q(sender_id=s, receiver_id=r) | Q(sender_id=r, receiver_id=s))
                .order_by('-timestamp')
                .first()
            )
            if last_msg:
                last_map[key] = last_msg

    conversations = []
    for u in users:
        key = (min(me.id, u.id), max(me.id, u.id))
        conversations.append({
            'user': u,
            'last': last_map.get(key)
        })

    context = {
        'conversations': conversations,
        'user_profile': getattr(me, 'userprofile', None),
    }
    return render(request, 'messaging/inbox.html', context)


@login_required
def chat(request, user_id):
    """
    Render the 1-to-1 chat page between the logged-in user and another user.
    """
    other_user = get_object_or_404(User, id=user_id)
    messages_qs = Message.objects.filter(
        (Q(sender=request.user, receiver=other_user) | Q(sender=other_user, receiver=request.user))
    ).order_by("timestamp")

    if request.method == "POST":
        content = request.POST.get("message", "").strip()
        if content:
            Message.objects.create(sender=request.user, receiver=other_user, content=content)
            return redirect("chat", user_id=other_user.id)

    return render(request, "messaging/chat.html", {
        "other_user": other_user,
        "messages": messages_qs
    })

@login_required
def chat_start_meeting(request, user_id):
    """
    Open (or create) a meeting room for the 1:1 chat between request.user and user_id.
    We use a deterministic room code so both users land in the same room without extra state.
    """
    other = get_object_or_404(User, id=user_id)

    a, b = sorted([request.user.id, other.id])
    room_code = f"alumnify-{a}-{b}"

    return redirect("meeting_room", room_code=room_code)


@login_required
def meeting_room(request, room_code):
    return render(request, "messaging/meeting_room.html", {
        "room_code": room_code,
        "jitsi_domain": "meet.jit.si",
    })

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.utils import timezone
from django.contrib.auth.models import User

from .models import AlumniAvailability  


@login_required
def availability_list(request):
 
    now = timezone.now()
    slots = AlumniAvailability.objects.filter(
        start_time__gte=now,
        is_booked=False
    ).select_related("alumni").order_by("start_time")

    return render(request, "availability_list.html", {"slots": slots})


@login_required
def availability_manage(request):
    """
    Alumni create and see their own slots.
    Uses your availability_manage.html template.
    """
    if not hasattr(request.user, "userprofile") or not request.user.userprofile.is_alumni:
        messages.error(request, "Only alumni can manage availability.")
        return redirect("availability_list")

    if request.method == "POST":
        start_str = request.POST.get("start_time")
        end_str = request.POST.get("end_time")
        if not start_str or not end_str:
            messages.error(request, "Start and end time are required.")
            return redirect("availability_manage")

        # Parse naive datetime-local (browser) -> make aware in current timezone
        from django.utils.dateparse import parse_datetime
        start = parse_datetime(start_str)
        end = parse_datetime(end_str)

        if not start or not end:
            messages.error(request, "Invalid datetime format.")
            return redirect("availability_manage")

        if end <= start:
            messages.error(request, "End time must be after start time.")
            return redirect("availability_manage")

        # Make aware if naive
        if timezone.is_naive(start):
            start = timezone.make_aware(start, timezone.get_current_timezone())
        if timezone.is_naive(end):
            end = timezone.make_aware(end, timezone.get_current_timezone())

        AlumniAvailability.objects.create(
            alumni=request.user,
            start_time=start,
            end_time=end,
        )
        messages.success(request, "Slot added.")
        return redirect("availability_manage")

    my_slots = AlumniAvailability.objects.filter(alumni=request.user).order_by("-start_time")
    return render(request, "availability_manage.html", {"my_slots": my_slots})


@login_required
def availability_book(request, slot_id):

    slot = get_object_or_404(AlumniAvailability, id=slot_id)

    if hasattr(request.user, "userprofile") and request.user.userprofile.is_alumni:
        messages.error(request, "Alumni cannot book slots.")
        return redirect("availability_list")

    if slot.is_booked:
        messages.error(request, "This slot has already been booked.")
        return redirect("availability_list")

    slot.is_booked = True
    slot.booked_by = request.user
    slot.save(update_fields=["is_booked", "booked_by"])

    messages.success(request, "Slot booked! You can now start a video meeting from chat.")
    return redirect("availability_list")
