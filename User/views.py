from django.shortcuts import get_object_or_404, render, redirect
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseForbidden
from django.db.models import Q
from django.utils import timezone

from .models import (
    UserProfile, Experience, Education, LicenseCertificate, Skill,
    AlumniAvailability, Meeting
)

# Feed imports (kept to avoid breaking existing references)
from feed.models import Post, Like, Comment
from User.models import ConnectionRequest, Connection

from .helper_functions import (
    find_connection_posts, find_connection_count, find_liked_posts, find_parent_comments, find_user_posts
)

import secrets
from django.db import transaction
from django.db.models import Count

# ============================================
# Auth / Landing
# ============================================

def login_page(request):
    return render(request, 'login.html')


def landing_page(request):
    return render(request, 'landing_page.html')


def signup_page(request):
    return render(request, 'signup.html')


def create_account(request):
    if request.method == "POST":
        first_name = (request.POST.get("firstName") or "").strip()
        last_name = (request.POST.get("lastName") or "").strip()
        email = (request.POST.get("email") or "").strip().lower()
        phone = (request.POST.get("phone") or "").strip()
        password = request.POST.get("password")
        university = request.POST.get("university", "")
        gender = request.POST.get("gender", "")
        user_type = (request.POST.get("user_type") or "student").strip().lower()
        department = (request.POST.get("department") or "").strip()

        full_name = f"{first_name} {last_name}".strip()

        if User.objects.filter(username=email).exists():
            messages.error(request, "Email is already registered.")
            return redirect("signup")

        if phone and UserProfile.objects.filter(phone=phone).exists():
            messages.error(request, "Phone number is already registered.")
            return redirect("signup")

        headline = "Alumni" if user_type == "alumni" else "Student"
        is_alumni = (user_type == "alumni")

        with transaction.atomic():
            user = User.objects.create_user(
                username=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                email=email
            )
            UserProfile.objects.create(
                user=user,
                full_name=full_name or user.username,
                phone=phone,
                university=university,
                gender=gender,
                headline=headline,
                is_alumni=is_alumni,
                department=department
            )

        messages.success(request, "Account created successfully! Please log in.")
        return redirect("signin")

    return render(request, "signup.html")


def signin(request):
    if request.method == "POST":
        username = (request.POST.get('email') or '').strip().lower()
        password = request.POST.get('password', '')

        # Allow phone number login
        if username and username.isdigit():
            profile = UserProfile.objects.filter(phone=username).first()
            if profile:
                username = profile.user.username
            else:
                messages.error(request, "Invalid phone number or password.")
                return redirect('signin')

        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return redirect("home")
        else:
            messages.error(request, "Invalid username or password.")
            return redirect("signin")

    # If already logged in, skip login page
    if request.user.is_authenticated:
        return redirect("home")

    return render(request, "login.html")


# ============================================
# Home Feed
# ============================================

@login_required
def home(request):
    user = request.user

    # Ensure profile exists
    user_profile, _ = UserProfile.objects.get_or_create(
        user=user,
        defaults={"full_name": user.get_full_name() or user.username, "phone": ""},
    )

    # Distinct list of registered universities for the Create Post dropdown
    universities = (
        UserProfile.objects.exclude(university__isnull=True)
        .exclude(university__exact="")
        .values_list("university", flat=True)
        .distinct()
        .order_by("university")
    )

    # Pull connection feed, then filter by audience (Everyone or my university)
    posts = find_connection_posts(request.user)
    my_uni = (user_profile.university or "").strip()
    visible_posts = []
    for p in posts:
        audience = (getattr(p, "audience_university", "") or "").strip()
        if not audience or (my_uni and audience == my_uni):
            visible_posts.append(p)
    posts = visible_posts

    # Build comments map
    parent_comments_map = {p.id: find_parent_comments(p) for p in posts}
    child_comments_map = {}
    for plist in parent_comments_map.values():
        for pc in plist:
            child_comments_map[pc.id] = pc.replies.all().order_by("created_at")

    # Liked posts
    liked_posts = Post.objects.filter(
        id__in=Like.objects.filter(user=user_profile).values_list("post_id", flat=True)
    )

    # Connections (exclude admins)
    connections_qs = Connection.objects.filter(Q(user1=user) | Q(user2=user))
    connections = []
    for c in connections_qs:
        other = c.user2 if c.user1 == user else c.user1
        if not (other.is_staff or other.is_superuser):
            connections.append(other.userprofile)

    # Pending requests (people who sent me requests)
    pending_requests = [
        r.sender.userprofile
        for r in ConnectionRequest.objects.filter(receiver=user)
        if not (r.sender.is_staff or r.sender.is_superuser)
    ]

    posts = find_connection_posts(request.user)
    posts = posts.annotate(
        like_count=Count('likes'),
        comment_count=Count('comments')
    )

    # Suggestions (not me, not staff, not already connected or pending)
    exclude_ids = [p.id for p in connections + pending_requests]
    suggested_users = (
        UserProfile.objects.exclude(user=user)
        .exclude(user__is_staff=True)
        .exclude(user__is_superuser=True)
        .exclude(id__in=exclude_ids)[:10]
    )

    context = {
        "user_profile": user_profile,
        "posts": posts,
        "liked_posts": liked_posts,
        "parent_comments_map": parent_comments_map,
        "child_comments_map": child_comments_map,
        "connection_count": find_connection_count(request.user),
        "connections": connections,
        "pending_requests": pending_requests,
        "suggested_users": suggested_users,
        "universities": universities,
    }
    return render(request, "home.html", context)


# ============================================
# Comments
# ============================================

def add_comment(request):
    if request.method == "POST" and request.POST.get("comment_type") == "parent":
        content = request.POST.get("content")
        post_id = request.POST.get("post_id")
        post = get_object_or_404(Post, id=post_id)
        user_profile = get_object_or_404(UserProfile, user=request.user)
        Comment.objects.create(user=user_profile, post=post, content=content)
        return redirect("home")
    elif request.method == "POST":
        content = request.POST.get("content")
        post_id = request.POST.get("post_id")
        parent_id = request.POST.get("parent_id")
        post = get_object_or_404(Post, id=post_id)
        parent_comment = get_object_or_404(Comment, id=parent_id)
        user_profile = get_object_or_404(UserProfile, user=request.user)
        Comment.objects.create(user=user_profile, post=post, content=content, parent=parent_comment)
        return redirect("home")
    return redirect("home")


# ============================================
# Profile Page
# ============================================

def profile(request):
    user_profile = request.user.userprofile
    experience_list = Experience.objects.filter(userprofile=user_profile)
    education_list = Education.objects.filter(userprofile=user_profile)
    lc_list = LicenseCertificate.objects.filter(userprofile=user_profile)
    skill_list = Skill.objects.filter(userprofile=user_profile)
    connection_count = find_connection_count(request.user)

    context = {
        'user_profile': user_profile,
        'experience_list': experience_list,
        'education_list': education_list,
        'lc_list': lc_list,
        'skill_list': skill_list,
        'connection_count': connection_count,
    }
    return render(request, 'profile_page.html', context)


@login_required
def delete_account(request):
    if request.method == "POST":
        confirm_text = request.POST.get("confirm_text", "")
        password = request.POST.get("password", "")
        if confirm_text != "DELETE":
            messages.error(request, "Type DELETE to confirm.")
            return redirect("profile")

        user = request.user
        if not user.check_password(password):
            messages.error(request, "Incorrect password.")
            return redirect("profile")

        logout(request)
        user.delete()
        messages.success(request, "Your account has been deleted.")
        return redirect("landing_page")

    messages.error(request, "Invalid request.")
    return redirect("profile")


@login_required
def add_experience(request):
    try:
        userprofile = request.user.userprofile
    except UserProfile.DoesNotExist:
        messages.error(request, "User profile not found.")
        return redirect("profile")

    if request.method == "POST":
        title = request.POST.get("title", "").strip()
        employment_type = request.POST.get("employmentType") or None
        company = request.POST.get("company", "").strip()
        is_current = request.POST.get("currentRole") == "on"
        period_text = request.POST.get("period_text", "").strip()
        location = request.POST.get("location") or None
        location_type = request.POST.get("locationType") or None
        description = request.POST.get("description") or None
        headline = request.POST.get("headline") or None

        if not title or not company:
            messages.error(request, "Please fill required fields (Title, Company).")
            return redirect("profile")

        Experience.objects.create(
            userprofile=userprofile,
            title=title, employment_type=employment_type, company=company,
            is_current=is_current, period_text=period_text,
            location=location, location_type=location_type, description=description
        )
        if headline is not None:
            userprofile.headline = headline
            userprofile.save()
        messages.success(request, "Experience added successfully!", extra_tags='profile_update')
        return redirect("profile")
    return redirect("profile")


def experience_detail(request, id):
    try:
        exp = Experience.objects.get(id=id, userprofile=request.user.userprofile)
        # Instead of returning JSON, you can redirect to a detail page or back to profile
        messages.info(request, f"Viewing experience: {exp.title} at {exp.company}")
        return redirect("profile")
    except Experience.DoesNotExist:
        messages.error(request, "Experience not found.")
        return redirect("profile")


def update_experience(request, id):
    experience_obj = get_object_or_404(Experience, id=id, userprofile=request.user.userprofile)
    user_profile_obj = request.user.userprofile
    if request.method == "POST":
        experience_obj.title = request.POST.get("title") or experience_obj.title
        experience_obj.company = request.POST.get("company") or experience_obj.company
        experience_obj.employment_type = request.POST.get("employment_type") or None
        experience_obj.is_current = True if request.POST.get("is_current") == "on" else False
        experience_obj.location = request.POST.get("location") or None
        experience_obj.location_type = request.POST.get("location_type") or None
        experience_obj.description = request.POST.get("description") or None
        experience_obj.period_text = request.POST.get("period_text") or experience_obj.period_text

        headline = request.POST.get("headline")
        if headline is not None:
            user_profile_obj.headline = headline
            user_profile_obj.save()

        experience_obj.save()
        messages.success(request, "Experience updated successfully!", extra_tags='profile_update')
        return redirect("profile")
    return redirect("profile")


@login_required
def add_education(request):
    if request.method == "POST":
        userprofile = request.user.userprofile

        school = request.POST.get("school", "").strip()
        degree = request.POST.get("degree") or None
        field_of_study = request.POST.get("field") or None
        grade = request.POST.get("grade") or None
        description = request.POST.get("description") or None
        period_text = request.POST.get("period_text", "").strip()
        is_current = request.POST.get("is_current") == "on"

        if not school:
            messages.error(request, "Please provide a School.")
            return redirect("profile")

        # Optionally append 'Present' to the period_text
        if is_current and period_text and 'Present' not in period_text:
            period_text = f"{period_text} – Present"

        Education.objects.create(
            userprofile=userprofile,
            school=school, degree=degree, field_of_study=field_of_study,
            period_text=period_text, grade=grade, description=description
        )

        messages.success(request, "Education added successfully!", extra_tags='profile_update')
        return redirect("profile")

    return redirect("profile")


@login_required
def update_education(request, id):
    edu_obj = get_object_or_404(Education, id=id, userprofile=request.user.userprofile)

    if request.method == "POST":
        edu_obj.school = (request.POST.get("school") or edu_obj.school).strip()
        edu_obj.degree = request.POST.get("degree") or None
        edu_obj.field_of_study = request.POST.get("field") or None
        edu_obj.grade = request.POST.get("grade") or None
        edu_obj.description = request.POST.get("description") or None
        edu_obj.period_text = request.POST.get("period_text") or edu_obj.period_text

        edu_obj.save()
        messages.success(request, "Education updated successfully!", extra_tags='profile_update')
        return redirect("profile")

    return redirect("profile")


def education_detail(request, id):
    edu = get_object_or_404(Education, id=id, userprofile=request.user.userprofile)
    messages.info(request, f"Viewing education: {edu.school}")
    return redirect("profile")


def userprofile_detail(request, id):
    try:
        profile = UserProfile.objects.get(id=id)
        messages.info(request, f"Viewing profile: {profile.full_name}")
        return redirect("profile")
    except UserProfile.DoesNotExist:
        messages.error(request, "Profile not found.")
        return redirect("profile")


def update_profile(request, id):
    userprofile = get_object_or_404(UserProfile, id=id)
    if request.method == "POST":
        userprofile.full_name = request.POST.get("full_name", userprofile.full_name)
        userprofile.headline = request.POST.get("headline", userprofile.headline)
        userprofile.location = request.POST.get("location", userprofile.location)
        userprofile.phone = request.POST.get("phone", userprofile.phone)
        userprofile.summary = request.POST.get("summary", userprofile.summary)
        userprofile.save()
        messages.success(request, "Profile updated successfully!", extra_tags='profile_update')
        return redirect("profile")
    messages.error(request, "Invalid request.")
    return redirect("profile")


def update_profile_photo(request):
    if request.method == "POST" and request.FILES.get("profile_photo"):
        profile = get_object_or_404(UserProfile, user=request.user)
        profile.profile_photo = request.FILES["profile_photo"]
        profile.save()
        messages.success(request, "Profile photo updated successfully!", extra_tags='profile_update')
        return redirect("profile")
    messages.error(request, "No photo selected.")
    return redirect("profile")


def update_cover_photo(request):
    if request.method == "POST" and request.FILES.get("cover_photo"):
        profile = get_object_or_404(UserProfile, user=request.user)
        profile.background_photo = request.FILES["cover_photo"]
        profile.save()
        messages.success(request, "Cover photo updated successfully!", extra_tags='profile_update')
        return redirect("profile")
    messages.error(request, "No cover photo selected.")
    return redirect("profile")


def update_profile_info(request):
    """Update basic profile information"""
    if request.method == "POST":
        user_profile = request.user.userprofile
        user_profile.full_name = request.POST.get("full_name", user_profile.full_name)
        user_profile.headline = request.POST.get("headline", user_profile.headline)
        user_profile.location = request.POST.get("location", user_profile.location)
        user_profile.summary = request.POST.get("summary", user_profile.summary)
        is_alumni_val = request.POST.get("is_alumni")
        if is_alumni_val is not None:
            user_profile.is_alumni = (is_alumni_val == "on" or is_alumni_val == "true" or is_alumni_val == "1")
        user_profile.save()
        messages.success(request, "Profile updated successfully!", extra_tags='profile_update')
    return redirect("profile")


@login_required
def delete_experience(request, experience_id):
    if request.method == "POST":
        experience = get_object_or_404(Experience, id=experience_id, userprofile=request.user.userprofile)
        experience.delete()
        messages.success(request, "Experience deleted successfully!", extra_tags='profile_update')
    return redirect("profile")


@login_required
def delete_education(request, education_id):
    if request.method == "POST":
        education = get_object_or_404(Education, id=education_id, userprofile=request.user.userprofile)
        education.delete()
        messages.success(request, "Education deleted successfully!", extra_tags='profile_update')
    return redirect("profile")


@login_required
def delete_license_certificate(request, lc_id):
    if request.method == "POST":
        lc = get_object_or_404(LicenseCertificate, id=lc_id, userprofile=request.user.userprofile)
        lc.delete()
        messages.success(request, "License/Certificate deleted successfully!", extra_tags='profile_update')
    return redirect("profile")


def add_license_certificate(request):
    if request.method == "POST":
        userprofile = request.user.userprofile
        name = request.POST.get("licenseNameLC") or request.POST.get("name")
        issuing_organization = request.POST.get("issuingOrgLC") or request.POST.get("issuing_org")
        issue_text = request.POST.get("issue_text") or request.POST.get("issueDateLC")
        expiry_text = request.POST.get("expiry_text") or request.POST.get("expiryDateLC")
        certificate_file = request.FILES.get("certificateFileLC") or request.FILES.get("certificate_file")

        lc = LicenseCertificate.objects.create(
            name=name,
            issuing_org=issuing_organization,
            issue_text=issue_text,
            expiry_text=expiry_text,
            certificate_file=certificate_file,
            userprofile=userprofile
        )
        messages.success(request, "License/Certificate added successfully!", extra_tags='profile_update')
        return redirect("profile")
    return redirect("profile")


@login_required
def get_license_certificate(request, lc_id):
    try:
        lc = get_object_or_404(LicenseCertificate, id=lc_id)
        if lc.userprofile.user != request.user:
            messages.error(request, "Permission denied.")
            return redirect("profile")

        # Instead of JSON, you can redirect to a detail view or show in modal
        messages.info(request, f"License: {lc.name}")
        return redirect("profile")
    except Exception as e:
        messages.error(request, f"Error: {str(e)}")
        return redirect("profile")


def edit_license_certificate(request):
    if request.method == "POST":
        lc_id = request.POST.get("lc_id")
        lc = get_object_or_404(LicenseCertificate, id=lc_id, userprofile=request.user.userprofile)

        lc.name = request.POST.get("name")
        lc.issuing_org = request.POST.get("issuing_org")
        lc.issue_text = request.POST.get("issue_text")
        lc.expiry_text = request.POST.get("expiry_text")

        if "certificate_file" in request.FILES:
            lc.certificate_file = request.FILES["certificate_file"]

        lc.save()
        messages.success(request, "License/Certificate updated successfully!", extra_tags='profile_update')
        return redirect("profile")
    return redirect("profile")


@login_required
def get_skill_context_data(request):
    try:
        user_profile, created = UserProfile.objects.get_or_create(user=request.user)
        # This function might be used for AJAX, but if not needed, redirect
        messages.info(request, "Skill context data loaded.")
        return redirect("profile")
    except Exception as e:
        messages.error(request, f"Error loading skill data: {str(e)}")
        return redirect("profile")


def add_skill(request):
    if request.method == "POST":
        userprofile = request.user.userprofile
        skill_name = request.POST.get("skillName")
        experience_ids = request.POST.getlist("experiences")
        education_ids = request.POST.getlist("educations")
        license_ids = request.POST.getlist("licenses")

        skill = Skill.objects.create(userprofile=userprofile, skill_name=skill_name)

        for exp_id in experience_ids:
            try:
                exp = Experience.objects.get(id=exp_id, userprofile=userprofile)
                skill.experiences.add(exp)
            except Experience.DoesNotExist:
                continue

        for edu_id in education_ids:
            try:
                edu = Education.objects.get(id=edu_id, userprofile=userprofile)
                skill.educations.add(edu)
            except Education.DoesNotExist:
                continue

        for lic_id in license_ids:
            try:
                lic = LicenseCertificate.objects.get(id=lic_id, userprofile=userprofile)
                skill.license_certificates.add(lic)
            except LicenseCertificate.DoesNotExist:
                continue

        skill.save()
        messages.success(request, "Skill added successfully!", extra_tags='profile_update')
        return redirect("profile")
    return redirect("profile")


@login_required
def delete_skill(request, skill_id):
    skill = get_object_or_404(Skill, id=skill_id, userprofile__user=request.user)

    if request.method == "POST":
        skill.delete()
        messages.success(request, "Skill deleted successfully!", extra_tags='profile_update')
        return redirect("profile")

    # If accessed via GET, show a simple confirmation page
    return render(request, "confirm_delete.html", {
        "object": skill,
        "type": "Skill",
        "cancel_url": "profile"
    })


@login_required
def get_skill_details(request, skill_id):
    try:
        skill = Skill.objects.get(id=skill_id, userprofile__user=request.user)
        # Instead of JSON, redirect or show in modal
        messages.info(request, f"Skill details: {skill.skill_name}")
        return redirect("profile")
    except Skill.DoesNotExist:
        messages.error(request, "Skill not found.")
        return redirect("profile")
    except Exception as e:
        messages.error(request, f"Error: {str(e)}")
        return redirect("profile")


def edit_skill(request):
    if request.method == "POST":
        userprofile = request.user.userprofile
        skill_name = request.POST.get("skillName")
        experience_ids = request.POST.getlist("experiences")
        education_ids = request.POST.getlist("educations")
        license_ids = request.POST.getlist("licenses")
        skill_id = request.POST.get("skillId")
        skill = get_object_or_404(Skill, id=skill_id, userprofile=userprofile)
        skill.experiences.clear()
        skill.educations.clear()
        skill.license_certificates.clear()
        skill.skill_name = skill_name
        for exp_id in experience_ids:
            try:
                exp = Experience.objects.get(id=exp_id, userprofile=userprofile)
                skill.experiences.add(exp)
            except Experience.DoesNotExist:
                continue
        for edu_id in education_ids:
            try:
                edu = Education.objects.get(id=edu_id, userprofile=userprofile)
                skill.educations.add(edu)
            except Education.DoesNotExist:
                continue
        for lic_id in license_ids:
            try:
                lic = LicenseCertificate.objects.get(id=lic_id, userprofile=userprofile)
                skill.license_certificates.add(lic)
            except LicenseCertificate.DoesNotExist:
                continue

        skill.save()
        messages.success(request, "Skill updated successfully!", extra_tags='profile_update')
        return redirect("profile")
    return redirect("profile")


def view_profile(request, id):
    try:
        user_profile = UserProfile.objects.get(id=id)
        if user_profile.user.is_staff or user_profile.user.is_superuser:
            messages.error(request, "Profile not found.")
            return redirect('home')
    except UserProfile.DoesNotExist:
        messages.error(request, "Profile not found.")
        return redirect('home')

    my_profile = request.user.userprofile
    connection = False
    received_request = False
    sent_request = False

    if user_profile != my_profile:
        connection = Connection.objects.filter(
            Q(user1=request.user, user2=user_profile.user) |
            Q(user1=user_profile.user, user2=request.user)
        ).exists()
        received_request = ConnectionRequest.objects.filter(
            sender=user_profile.user, receiver=request.user
        ).exists()
        sent_request = ConnectionRequest.objects.filter(
            sender=request.user, receiver=user_profile.user
        ).exists()

    experience_list = Experience.objects.filter(userprofile=user_profile)
    education_list = Education.objects.filter(userprofile=user_profile)

    context = {
        'experience_list': experience_list,
        'education_list': education_list,
        'user_profile': user_profile,
        'my_profile': my_profile,
        'connection': connection,
        'received_request': received_request,
        'sent_request': sent_request
    }
    return render(request, 'view_profile.html', context)


# ============================================
# My Activity
# ============================================

def user_activity(request):
    filter_option = request.GET.get('filter', 'posts')
    if filter_option == 'posts':
        user = request.user
        user_profile = UserProfile.objects.get(user=user)
        connection_count = find_connection_count(request.user)
        posts = find_user_posts(request.user)
        parent_comments_map = {}
        for post in posts:
            parent_comments = find_parent_comments(post)
            parent_comments_map[post.id] = parent_comments
        liked_posts = find_liked_posts(request.user)
        child_comments_map = {}
        for parent_comment_list in parent_comments_map.values():
            for parent_comment in parent_comment_list:
                child_comments = parent_comment.replies.all().order_by('created_at')
                child_comments_map[parent_comment.id] = child_comments
        context = {
            'user_profile': user_profile,
            'posts': posts,
            'liked_posts': liked_posts,
            'parent_comments_map': parent_comments_map,
            'child_comments_map': child_comments_map,
            'connection_count': connection_count,
            'filter_option': filter_option,
        }
        return render(request, 'home.html', context)
    elif filter_option == 'comments':
        user = request.user
        user_profile = UserProfile.objects.get(user=user)
        liked_posts = find_liked_posts(request.user)
        connection_count = find_connection_count(request.user)
        user_comments = Comment.objects.filter(user=user_profile)
        parent_comments = Comment.objects.filter(id__in=user_comments.values_list("parent_id", flat=True))
        comments = (user_comments | parent_comments).order_by('-created_at')
        commented_posts = []
        commented_posts_set = set()
        for comment in comments:
            if comment.post not in commented_posts_set:
                commented_posts.append(comment.post)
                commented_posts_set.add(comment.post)
        parent_comments_map = {}
        for post in commented_posts:
            for comment in comments:
                if comment.post == post and comment.parent is None:
                    if post.id not in parent_comments_map:
                        parent_comments_map[post.id] = []
                    parent_comments_map[post.id].append(comment)
        child_comments_map = {}
        for parent_comment_list in parent_comments_map.values():
            for parent_comment in parent_comment_list:
                child_comments = parent_comment.replies.all().order_by('created_at')
                child_comments_map[parent_comment.id] = child_comments
        context = {
            'user_profile': user_profile,
            'posts': commented_posts,
            'liked_posts': liked_posts,
            'parent_comments_map': parent_comments_map,
            'child_comments_map': child_comments_map,
            'connection_count': connection_count,
            'filter_option': filter_option,
        }
        return render(request, 'my_activity.html', context)
    else:
        user = request.user
        user_profile = UserProfile.objects.get(user=user)
        connection_count = find_connection_count(request.user)
        posts = find_liked_posts(request.user)
        parent_comments_map = {}
        for post in posts:
            parent_comments = find_parent_comments(post)
            parent_comments_map[post.id] = parent_comments
        child_comments_map = {}
        for parent_comment_list in parent_comments_map.values():
            for parent_comment in parent_comment_list:
                child_comments = parent_comment.replies.all().order_by('created_at')
                child_comments_map[parent_comment.id] = child_comments
        context = {
            'user_profile': user_profile,
            'posts': posts,
            'liked_posts': posts,
            'parent_comments_map': parent_comments_map,
            'child_comments_map': child_comments_map,
            'connection_count': connection_count,
            'filter_option': filter_option,
        }
        return render(request, 'my_activity.html', context)


def delete_post(request, id):
    post = get_object_or_404(Post, id=id, user=request.user.userprofile)
    post.delete()
    messages.success(request, "Post deleted successfully!")
    return redirect("user_activity")


# ============================================
# Meetings & Scheduling
# ============================================

def _gen_room_code():
    return "alummeet-" + secrets.token_urlsafe(10)


@login_required
def manage_availability(request):
    """Alumni manage their free slots."""
    profile = request.user.userprofile
    if not profile.is_alumni:
        return HttpResponseForbidden("Only alumni can manage availability.")

    if request.method == 'POST':
        # Create a slot
        start_str = request.POST.get('start_time')
        end_str = request.POST.get('end_time')
        try:
            start_dt = timezone.make_aware(timezone.datetime.fromisoformat(start_str))
            end_dt = timezone.make_aware(timezone.datetime.fromisoformat(end_str))
            if end_dt <= start_dt:
                messages.error(request, "End must be after start.")
            else:
                AlumniAvailability.objects.create(alumni=request.user, start_time=start_dt, end_time=end_dt)
                messages.success(request, "Slot added.")
        except Exception as e:
            messages.error(request, f"Invalid datetime: {e}")

    my_slots = AlumniAvailability.objects.filter(alumni=request.user).order_by('start_time')
    return render(request, 'meetings/availability_manage.html', {'my_slots': my_slots, 'profile': profile})


@login_required
def list_availability(request):
    """Students browse free alumni slots and book."""
    profile = request.user.userprofile
    slots = AlumniAvailability.objects.filter(is_booked=False).select_related('alumni').order_by('start_time')
    return render(request, 'meetings/availability_list.html', {'slots': slots, 'profile': profile})


@login_required
def book_slot(request, slot_id):
    slot = get_object_or_404(AlumniAvailability, id=slot_id, is_booked=False)
    # Prevent alumni from booking their own slot
    if slot.alumni == request.user:
        messages.error(request, "You cannot book your own slot.")
        return redirect('list_availability')

    slot.is_booked = True
    slot.save()
    room = _gen_room_code()
    meeting = Meeting.objects.create(slot=slot, student=request.user, room_code=room)
    messages.success(request, "Meeting booked. Redirecting to room...")
    return redirect('meeting_room', room_code=meeting.room_code)


@login_required
def meeting_room(request, room_code):
    meeting = get_object_or_404(Meeting, room_code=room_code)
    # Allow either participant (alumni or student)
    if meeting.student != request.user and meeting.slot.alumni != request.user:
        return HttpResponseForbidden("You are not a participant in this meeting.")

    return render(request, 'meetings/meeting_room.html', {
        'meeting': meeting,
        'room_code': meeting.room_code,
        'jitsi_domain': meeting.jitsi_domain,
    })