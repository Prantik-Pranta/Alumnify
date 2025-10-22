// edit-profile.js
function openEditUserProfileModal(userProfileId) {
    console.log('Opening edit profile modal for:', userProfileId);

    // For now, we'll populate with existing data from the page
    // In a real application, you'd fetch this from an API
    const profileName = document.querySelector('.profile-name').textContent;
    const profileHeadline = document.querySelector('.profile-headline')?.textContent || '';
    const profileLocation = document.querySelector('.profile-location')?.textContent || '';

    // Populate form fields
    document.getElementById('edit-userprofile-full-name').value = profileName;
    document.getElementById('edit-userprofile-headline').value = profileHeadline;
    document.getElementById('edit-userprofile-location').value = profileLocation;
    document.getElementById('edit-userprofile-id').value = userProfileId;

    // Update character counts
    updateCharCount('edit-userprofile-headline', 'edit-userprofile-headline-count');
    updateCharCount('edit-userprofile-summary', 'edit-userprofile-summary-count');

    // Show modal using Bootstrap
    const modalElement = document.getElementById('edit-userprofile-modal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

function closeEditUserProfileModal() {
    const modalElement = document.getElementById('edit-userprofile-modal');
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) {
        modal.hide();
    }
}

function updateCharCount(textareaId, countSpanId) {
    const textarea = document.getElementById(textareaId);
    const countSpan = document.getElementById(countSpanId);

    if (textarea && countSpan) {
        textarea.addEventListener('input', function() {
            countSpan.textContent = this.value.length;
        });

        // Initialize count
        countSpan.textContent = textarea.value.length;
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Edit profile JS loaded');

    // Set up character counters if elements exist
    const headlineTextarea = document.getElementById('edit-userprofile-headline');
    const summaryTextarea = document.getElementById('edit-userprofile-summary');

    if (headlineTextarea) {
        updateCharCount('edit-userprofile-headline', 'edit-userprofile-headline-count');
    }
    if (summaryTextarea) {
        updateCharCount('edit-userprofile-summary', 'edit-userprofile-summary-count');
    }

    // Close button event listener
    const closeBtn = document.querySelector('.edit-userprofile-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeEditUserProfileModal);
    }
});