// Profile main functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Profile page loaded');

    // Initialize photo uploads
    initializePhotoUploads();
});

function initializePhotoUploads() {
    // Cover photo preview
    const coverPhotoInput = document.getElementById('coverPhotoInput');
    if (coverPhotoInput) {
        coverPhotoInput.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.querySelector('.profile-cover').style.backgroundImage = `url(${e.target.result})`;
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        });
    }

    // Profile photo preview
    const profilePhotoInput = document.getElementById('profilePhotoInput');
    if (profilePhotoInput) {
        profilePhotoInput.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.querySelector('.profile-picture img').src = e.target.result;
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        });
    }
}

function showSuccess(message) {
    alert('Success: ' + message);
}

function showError(message) {
    alert('Error: ' + message);
}