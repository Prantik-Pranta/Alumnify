from django.db import models
from User.models import UserProfile


from django.db import models
from User.models import UserProfile

class Post(models.Model):
    user = models.ForeignKey(UserProfile, related_name="posts", on_delete=models.CASCADE)
    content = models.TextField(blank=True)
    image = models.ImageField(upload_to="posts/", blank=True, null=True)
    shared_post = models.ForeignKey("self", null=True, blank=True, on_delete=models.SET_NULL, related_name="shares")
    created_at = models.DateTimeField(auto_now_add=True)
    audience_university = models.CharField(max_length=255, blank=True, db_index=True)
    def __str__(self):
        return f"{self.user.full_name}: {self.content[:30]}"

class Comment(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='comments')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.full_name}: {self.content[:30]}"

class Like(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='likes')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes', null=True, blank=True)
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='likes', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = (
            ('user', 'post'),
            ('user', 'comment'),
        )

    def __str__(self):
        if self.post:
            return f"{self.user.full_name} liked post {self.post.id}"
        if self.comment:
            return f"{self.user.full_name} liked comment {self.comment.id}"