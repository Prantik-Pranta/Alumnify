
from django.urls import path
from . import views
from django.contrib.auth.views import LogoutView

urlpatterns = [
    path('', views.landing_page, name='landing_page'),

    # Auth & account
    path('signup/', views.signup_page, name='signup'),
    path('login/', views.login_page, name='login'),
    path('create_account/', views.create_account, name='create_account'),
    path('signin/', views.signin, name='signin'),
    path('logout/', LogoutView.as_view(next_page='login'), name='logout'),
    path('delete-account/', views.delete_account, name='delete_account'),

    # Core pages
    path('home/', views.home, name='home'),
    path('profile/', views.profile, name='profile'),
    path('view_profile/<int:id>/', views.view_profile, name='view_profile'),

    # Profile updates
    path('update-profile-info/', views.update_profile_info, name='update_profile_info'),
    path('update_profile_photo/', views.update_profile_photo, name='update_profile_photo'),
    path('update_cover_photo/', views.update_cover_photo, name='update_cover_photo'),

    # Experience
    path('add_experience/', views.add_experience, name='add_experience'),
    path('update_experience/<int:id>/', views.update_experience, name='update_experience'),
    path('delete-experience/<int:experience_id>/', views.delete_experience, name='delete_experience'),
    path('experience_detail/<int:id>/', views.experience_detail, name='experience_detail'),

    # Education
    path('add_education/', views.add_education, name='add_education'),
    path('update_education/<int:id>/', views.update_education, name='update_education'),
    path('delete-education/<int:education_id>/', views.delete_education, name='delete_education'),
    path('education_detail/<int:id>/', views.education_detail, name='education_detail'),

    # Licenses & Certificates
    path('add_license_certificate/', views.add_license_certificate, name='add_license_certificate'),
    path('edit_license_certificate/', views.edit_license_certificate, name='edit_license_certificate'),
    path('get_license_certificate/<int:lc_id>/', views.get_license_certificate, name='get_license_certificate'),
    path('delete-license-certificate/<int:lc_id>/', views.delete_license_certificate, name='delete_license_certificate'),

    # Skills
    path('add_skill/', views.add_skill, name='add_skill'),
    path('edit_skill/', views.edit_skill, name='edit_skill'),
    path('delete-skill/<int:skill_id>/', views.delete_skill, name='delete_skill'),
    path('get_skill_details/<int:skill_id>/', views.get_skill_details, name='get_skill_details'),
    path('get_skill_context_data/', views.get_skill_context_data, name='get_skill_context_data'),

    # Feed / comments / posts
    path('add_comment/', views.add_comment, name='add_comment'),
    path('user_activity/', views.user_activity, name='user_activity'),
    path('delete_post/<int:id>/', views.delete_post, name='delete_post'),

    # Meetings & scheduling
    path('meet/availability/', views.manage_availability, name='manage_availability'),
    path('meet/slots/', views.list_availability, name='list_availability'),
    path('meet/book/<int:slot_id>/', views.book_slot, name='book_slot'),
    path('meet/room/<slug:room_code>/', views.meeting_room, name='meeting_room'),
]
