
from django.db import models
from django.contrib.auth.models import User

# =========================
# Core Profile & Network
# =========================

class UserProfile(models.Model):
    GENDER_CHOICES = (
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=255)
    headline = models.CharField(max_length=255, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    summary = models.TextField(blank=True, null=True)
    profile_photo = models.ImageField(upload_to='profile_photos/', default='profile_photos/defaultpp.png')
    phone = models.CharField(max_length=15, unique=True, default=None)
    university = models.CharField(max_length=255, blank=True, null=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True, default="")
    background_photo = models.ImageField(upload_to='background_photos/', blank=True, null=True)
    profile_headline = models.CharField(max_length=255, null=True)
    # Role flag for alumni schedule/meetings
    is_alumni = models.BooleanField(default=False)
    department = models.CharField(max_length=120, blank=True)

    def __str__(self):
        return self.full_name


class LicenseCertificate(models.Model):
    userprofile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='licenses_certificates')
    name = models.CharField(max_length=255)
    issuing_org = models.CharField(max_length=255, blank=True, null=True)
    # Replaced date fields with free text
    issue_text = models.CharField(max_length=100, blank=True, null=True, help_text="e.g., Jun 2022")
    expiry_text = models.CharField(max_length=100, blank=True, null=True, help_text="e.g., Jun 2025 or 'No expiry'")
    certificate_file = models.FileField(upload_to='certificates/', blank=True, null=True)

    def __str__(self):
        return f"{self.name} - {self.userprofile.full_name}"


class Experience(models.Model):
    userprofile = models.ForeignKey("UserProfile", on_delete=models.CASCADE, related_name='experiences')
    title = models.CharField(max_length=255)
    employment_type = models.CharField(max_length=50, blank=True, null=True)
    company = models.CharField(max_length=255)
    is_current = models.BooleanField(default=False)
    # Replaced start/end dates with free text period label
    period_text = models.CharField(max_length=100, blank=True, null=True, help_text="e.g., Jan 2021 – Mar 2023 or '2021 – Present'")
    location = models.CharField(max_length=255, blank=True, null=True)
    location_type = models.CharField(max_length=20, blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.title} at {self.company} - {self.userprofile.full_name}"


class Education(models.Model):
    userprofile = models.ForeignKey("UserProfile", on_delete=models.CASCADE, related_name="educations")
    school = models.CharField(max_length=255)
    degree = models.CharField(max_length=255, blank=True, null=True)
    field_of_study = models.CharField(max_length=255, blank=True, null=True)
    # Replaced start/end dates with free text period label
    period_text = models.CharField(max_length=100, blank=True, null=True, help_text="e.g., 2018 – 2022 or '2020 – Present'")
    grade = models.CharField(max_length=50, blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.school} ({self.degree or 'No degree'}) - {self.userprofile.full_name}"


class Skill(models.Model):
    userprofile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='skills')
    skill_name = models.CharField(max_length=255)
    license_certificates = models.ManyToManyField(LicenseCertificate, blank=True, related_name="skills")
    experiences = models.ManyToManyField(Experience, blank=True, related_name="skills")
    educations = models.ManyToManyField(Education, blank=True, related_name="skills")

    def __str__(self):
        return f"{self.skill_name} - {self.userprofile.full_name}"


class ConnectionRequest(models.Model):
    sender = models.ForeignKey(User, related_name="sent_requests", on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name="received_requests", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    is_accepted = models.BooleanField(default=False)
    is_rejected = models.BooleanField(default=False)

    class Meta:
        unique_together = ('sender', 'receiver')

    def __str__(self):
        return f"{self.sender} → {self.receiver} | Accepted: {self.is_accepted}"


class Connection(models.Model):
    user1 = models.ForeignKey(User, related_name="connections_initiated", on_delete=models.CASCADE)
    user2 = models.ForeignKey(User, related_name="connections_received", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user1', 'user2')

    def __str__(self):
        return f"{self.user1} ↔ {self.user2}"


# =========================
# Meetings / Scheduling
# =========================

class AlumniAvailability(models.Model):
    """Time slots published by alumni for students to book."""
    alumni = models.ForeignKey(User, on_delete=models.CASCADE, related_name='alumni_availabilities')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    is_booked = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.alumni} | {self.start_time} – {self.end_time} ({'booked' if self.is_booked else 'free'})"


class Meeting(models.Model):
    slot = models.OneToOneField(AlumniAvailability, on_delete=models.CASCADE, related_name='meeting')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='student_meetings')
    created_at = models.DateTimeField(auto_now_add=True)
    room_code = models.SlugField(max_length=64, unique=True)
    jitsi_domain = models.CharField(max_length=128, default='meet.jit.si')

    STATUS_CHOICES = (
        ('booked', 'Booked'),
        ('done', 'Done'),
        ('cancelled', 'Cancelled'),
    )
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default='booked')

    def __str__(self):
        return f"Meeting {self.room_code} ({self.status})"

    @property
    def jitsi_url(self):
        return f"https://{self.jitsi_domain}/{self.room_code}"
