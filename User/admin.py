from django.contrib import admin
from .models import UserProfile, Experience, Education, ConnectionRequest, Connection, LicenseCertificate, Skill
# Register your models here.

admin.site.register(UserProfile)
admin.site.register(Experience)
admin.site.register(Education)
admin.site.register(ConnectionRequest)
admin.site.register(Connection)
admin.site.register(LicenseCertificate)
admin.site.register(Skill)