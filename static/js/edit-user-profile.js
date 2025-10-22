// Edit profile functionality
function openEditUserProfileModal(userId) {
    const modalHtml = `
        <div class="modal fade" id="editProfileModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Edit Profile</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editProfileForm" action="{% url 'update_profile_info' %}" method="POST">
                            {% csrf_token %}
                            <div class="mb-3">
                                <label class="form-label">Full Name</label>
                                <input type="text" class="form-control" name="full_name" value="${document.querySelector('.card-title').textContent}" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Headline</label>
                                <input type="text" class="form-control" name="headline" value="${document.querySelector('.profile-info .text-muted')?.textContent || ''}">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Location</label>
                                <input type="text" class="form-control" name="location" value="${document.querySelector('.fa-map-marker-alt')?.parentElement?.textContent?.trim() || ''}">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Bio</label>
                                <textarea class="form-control" name="bio" rows="4">${document.querySelector('.profile-info .card-text')?.textContent || ''}</textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="document.getElementById('editProfileForm').submit()">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('editProfileModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('editProfileModal'));
    modal.show();
}