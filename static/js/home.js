// home.js - Complete functionality for AlumniFy home page
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== ALUMNIFY HOME PAGE LOADED ===');
    initializeHomePage();
});

function initializeHomePage() {
    initializePostCreation();
    initializeCommentSystem();
    initializeLikeSystem();
    initializeModals();
    initializeAutoResize();
}

// ==================== POST CREATION ====================
function initializePostCreation() {
    console.log('Initializing post creation...');

    const postContent = document.getElementById('postContent');
    const postSubmitBtn = document.getElementById('postSubmitBtn');
    const postImage = document.getElementById('postImage');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const createPostForm = document.getElementById('createPostForm');

    // Post content validation
    if (postContent && postSubmitBtn) {
        postContent.addEventListener('input', function() {
            const hasContent = this.value.trim().length > 0;
            postSubmitBtn.disabled = !hasContent;
            console.log('Post content validation:', hasContent);
        });
    }

    // Image preview functionality
    if (postImage && imagePreview && previewImg) {
        postImage.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                console.log('Image selected:', file.name, file.size, file.type);

                // Validate file type
                const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                if (!validTypes.includes(file.type)) {
                    alert('Please select a valid image file (JPEG, PNG, GIF, WebP)');
                    this.value = '';
                    return;
                }

                // Validate file size (5MB limit)
                const maxSize = 5 * 1024 * 1024; // 5MB
                if (file.size > maxSize) {
                    alert('Image size must be less than 5MB');
                    this.value = '';
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImg.src = e.target.result;
                    imagePreview.style.display = 'block';
                    console.log('Image preview loaded');
                }
                reader.onerror = function() {
                    console.error('Error loading image preview');
                    alert('Error loading image. Please try another file.');
                }
                reader.readAsDataURL(file);
            }
        });
    }

    // Form submission with AJAX
    if (createPostForm) {
        createPostForm.addEventListener('submit', function(e) {
            e.preventDefault();
            createNewPost(this);
        });
    }

    // Modal reset on open
    const postModal = document.getElementById('postModal');
    if (postModal) {
        postModal.addEventListener('show.bs.modal', function() {
            resetPostModal();
        });
    }
}

function createNewPost(form) {
    console.log('=== CREATING NEW POST ===');

    const formData = new FormData(form);
    const submitBtn = document.getElementById('postSubmitBtn');
    const postContent = document.getElementById('postContent').value.trim();

    // Final validation
    if (!postContent) {
        alert('Please enter some content for your post');
        return;
    }

    // Disable button and show loading
    submitBtn.disabled = true;
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Posting...';

    const csrftoken = getCSRFToken();

    fetch('/create_post/', {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': csrftoken
        }
    })
    .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Post creation response:', data);

        if (data.success) {
            console.log('Post created successfully! ID:', data.post_id);
            showNotification('Post created successfully!', 'success');

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('postModal'));
            if (modal) modal.hide();

            // Reset form
            resetPostModal();

            // Reload page to show new post
            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } else {
            throw new Error(data.error || 'Unknown error occurred');
        }
    })
    .catch(error => {
        console.error('Error creating post:', error);
        showNotification('Error creating post: ' + error.message, 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    });
}

function resetPostModal() {
    const form = document.getElementById('createPostForm');
    const imagePreview = document.getElementById('imagePreview');
    const postSubmitBtn = document.getElementById('postSubmitBtn');

    if (form) form.reset();
    if (imagePreview) imagePreview.style.display = 'none';
    if (postSubmitBtn) {
        postSubmitBtn.disabled = true;
        postSubmitBtn.innerHTML = 'Post';
    }
    console.log('Post modal reset');
}

// ==================== LIKE SYSTEM ====================
function initializeLikeSystem() {
    console.log('Initializing like system...');

    // Event delegation for like buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.like-btn')) {
            const likeBtn = e.target.closest('.like-btn');
            toggleLike(likeBtn);
        }
    });
}

function toggleLike(btn) {
    const postId = btn.dataset.postId;
    console.log('=== TOGGLING LIKE FOR POST:', postId);

    if (!postId) {
        console.error('No post ID found');
        return;
    }

    const csrftoken = getCSRFToken();
    const likeText = btn.querySelector('.like-text');
    const likeIcon = btn.querySelector('i');

    // Optimistic UI update
    const wasLiked = btn.classList.contains('liked');
    const newLikeState = !wasLiked;

    // Update UI immediately
    updateLikeUI(btn, likeText, likeIcon, newLikeState);

    fetch('/toggle_like/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': csrftoken
        },
        body: `postId=${postId}`
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Like toggle response:', data);

        if (data.status === "liked" || data.status === "unliked") {
            // UI already updated optimistically, just verify
            const currentState = data.status === "liked";
            if (currentState !== newLikeState) {
                // Server response differs from optimistic update, revert
                updateLikeUI(btn, likeText, likeIcon, currentState);
            }

            // Update likes count
            updateLikesCount(postId, data.likes_count);

        } else {
            throw new Error('Invalid response from server');
        }
    })
    .catch(error => {
        console.error('Error toggling like:', error);
        // Revert optimistic update on error
        updateLikeUI(btn, likeText, likeIcon, wasLiked);
        showNotification('Error updating like', 'error');
    });
}

function updateLikeUI(btn, likeText, likeIcon, isLiked) {
    if (isLiked) {
        btn.classList.add('liked');
        if (likeText) likeText.textContent = 'Liked';
        if (likeIcon) likeIcon.className = 'fa-solid fa-thumbs-up me-1';
    } else {
        btn.classList.remove('liked');
        if (likeText) likeText.textContent = 'Like';
        if (likeIcon) likeIcon.className = 'fa-regular fa-thumbs-up me-1';
    }
}

function updateLikesCount(postId, count) {
    const likesCountElement = document.querySelector(`[data-post-id="${postId}"]`).closest('.post-card').querySelector('.likes-count');
    if (likesCountElement) {
        likesCountElement.textContent = count + ' likes';
    }
}

// ==================== COMMENT SYSTEM ====================
function initializeCommentSystem() {
    console.log('Initializing comment system...');

    // Event delegation for comment buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.comment-btn')) {
            const commentBtn = e.target.closest('.comment-btn');
            toggleComments(commentBtn);
        }

        if (e.target.closest('.comment-reply-btn')) {
            const replyBtn = e.target.closest('.comment-reply-btn');
            toggleReplyForm(replyBtn);
        }

        if (e.target.closest('.share-btn')) {
            const shareBtn = e.target.closest('.share-btn');
            const postId = shareBtn.dataset.postId;
            sharePost(postId);
        }
    });

    // Handle comment form submissions
    document.querySelectorAll('.comment-form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            submitComment(this);
        });
    });
}

function toggleComments(btn) {
    const postId = btn.dataset.postId;
    const commentsSection = document.getElementById(`comments-${postId}`);

    if (commentsSection) {
        const isHidden = commentsSection.classList.contains('d-none');
        commentsSection.classList.toggle('d-none');
        console.log(`Comments section ${isHidden ? 'shown' : 'hidden'} for post:`, postId);

        // Auto-focus comment input when showing
        if (isHidden) {
            const commentInput = commentsSection.querySelector('.comment-input');
            if (commentInput) {
                setTimeout(() => commentInput.focus(), 100);
            }
        }
    }
}

function toggleReplyForm(btn) {
    const replyForm = btn.closest('.comment-meta').nextElementSibling;

    if (replyForm && replyForm.classList.contains('reply-form')) {
        const isHidden = replyForm.classList.contains('d-none');
        replyForm.classList.toggle('d-none');
        console.log(`Reply form ${isHidden ? 'shown' : 'hidden'}`);

        // Auto-focus reply input when showing
        if (isHidden) {
            const replyInput = replyForm.querySelector('input[type="text"]');
            if (replyInput) {
                setTimeout(() => replyInput.focus(), 100);
            }
        }
    }
}

function submitComment(form) {
    console.log('=== SUBMITTING COMMENT ===');

    const formData = new FormData(form);
    const postId = form.dataset.postId;
    const content = formData.get('content').trim();

    if (!content) {
        alert('Please enter a comment');
        return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';

    const csrftoken = getCSRFToken();

    fetch('/add_comment/', {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': csrftoken
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Comment submission response:', data);

        if (data.success) {
            showNotification('Comment posted successfully!', 'success');
            form.reset();

            // Reload page to show new comment
            setTimeout(() => {
                window.location.reload();
            }, 500);

        } else {
            throw new Error(data.error || 'Unknown error occurred');
        }
    })
    .catch(error => {
        console.error('Error posting comment:', error);
        showNotification('Error posting comment: ' + error.message, 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    });
}
// ==================== SHARE SYSTEM ====================
function sharePost(postId) {
    console.log('=== SHARING POST ===', postId);

    // Create a custom modal-like prompt for better UX
    const shareModal = `
        <div class="modal fade" id="shareModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Share Post</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p class="text-muted mb-2">Add your thoughts (optional)</p>
                        <textarea class="form-control" id="shareContent" placeholder="What do you want to say about this post?" rows="3"></textarea>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="confirmShare">Share</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('shareModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', shareModal);

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('shareModal'));
    modal.show();

    // Handle share confirmation
    document.getElementById('confirmShare').addEventListener('click', function() {
        const shareContent = document.getElementById('shareContent').value.trim();
        performShare(postId, shareContent, modal);
    });

    // Handle enter key in textarea
    document.getElementById('shareContent').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            performShare(postId, this.value.trim(), modal);
        }
    });
}

function performShare(postId, shareContent, modal) {
    const csrftoken = getCSRFToken();
    const shareBtn = document.getElementById('confirmShare');
    const originalText = shareBtn.innerHTML;

    // Disable button and show loading
    shareBtn.disabled = true;
    shareBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Sharing...';

    fetch('/share_post/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': csrftoken
        },
        body: `post_id=${postId}&content=${encodeURIComponent(shareContent || '')}`
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Share response:', data);

        if (data.success) {
            showNotification('Post shared successfully!', 'success');
            modal.hide();

            // Reload page to show the shared post
            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } else {
            throw new Error(data.error || 'Unknown error occurred');
        }
    })
    .catch(error => {
        console.error('Error sharing post:', error);
        showNotification('Error sharing post: ' + error.message, 'error');
        shareBtn.disabled = false;
        shareBtn.innerHTML = originalText;
    });
}
// ==================== UTILITY FUNCTIONS ====================
function initializeModals() {
    console.log('Initializing modals...');

    // Initialize all Bootstrap modals
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('hidden.bs.modal', function() {
            console.log('Modal hidden:', this.id);
        });
    });
}

function initializeAutoResize() {
    // Auto-resize textareas
    document.querySelectorAll('textarea').forEach(textarea => {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });

        // Trigger initial resize
        textarea.style.height = 'auto';
        textarea.style.height = (textarea.scrollHeight) + 'px';
    });
}

function getCSRFToken() {
    const csrfToken = document.querySelector('meta[name="csrf-token"]');
    return csrfToken ? csrfToken.getAttribute('content') : '';
}

function showNotification(message, type = 'info') {
    console.log(`Notification [${type}]:`, message);

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 80px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// ==================== ERROR HANDLING ====================
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
});

console.log('=== HOME.JS LOADED SUCCESSFULLY ===');