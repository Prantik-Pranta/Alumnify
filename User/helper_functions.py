from feed.models import Post, Like, Comment
from User.models import ConnectionRequest, Connection, UserProfile
from django.db.models import Q

# User/helper_functions.py
from django.db.models import Q
from feed.models import Post
from User.models import Connection


def find_connection_userprofiles(user):
    connections = Connection.objects.filter(
        Q(user1=user) | Q(user2=user))
    connected_users = []
    for connection in connections:
        if connection.user1 == user:
            connected_users.append(connection.user2)
        else:
            connected_users.append(connection.user1)
    return connected_users



def find_connection_posts(user):
    # Get user's connections
    connections = Connection.objects.filter(
        Q(user1=user) | Q(user2=user)
    )

    # Get connected users (exclude admin users)
    connected_users = []
    for connection in connections:
        if connection.user1 == user:
            # Check if user2 is not admin
            if not connection.user2.is_staff and not connection.user2.is_superuser:
                connected_users.append(connection.user2)
        else:
            # Check if user1 is not admin
            if not connection.user1.is_staff and not connection.user1.is_superuser:
                connected_users.append(connection.user1)

    # Get user profiles of connected users
    from User.models import UserProfile
    connected_user_profiles = UserProfile.objects.filter(user__in=connected_users)

    # Get current user's profile
    current_user_profile = UserProfile.objects.get(user=user)

    # Get posts from current user AND their connections (exclude admin posts)
    posts = Post.objects.filter(
        Q(user=current_user_profile) | Q(user__in=connected_user_profiles)
    ).select_related('user').order_by('-created_at')

    return posts

def find_liked_posts(user):
    liked_objs = Like.objects.filter(user=user.userprofile)
    liked_posts = []
    for obj in liked_objs:
        liked_posts.append(obj.post)
    return liked_posts

def find_parent_comments(post_obj):
    return Comment.objects.filter(post=post_obj, parent__isnull=True).order_by('-created_at')

def find_child_comments(parent_comments):
    child_comments_dict = {}
    child_comments = Comment.objects.filter(parent__isnull=False)
    for parent_comment in parent_comments:
        child_comments_dict[parent_comment] = []
    for child_comment in child_comments:
        if child_comment.parent in child_comments_dict:
            child_comments_dict[child_comment.parent].append(child_comment)
    return child_comments_dict

def find_connection_count(user):
    connections = Connection.objects.filter(
        Q(user1=user) | Q(user2=user))
    return connections.count()

def find_user_posts(user):
    return Post.objects.filter(user=user.userprofile).order_by('-created_at')