// profile-edit.js - Simple solution for edit buttons
document.addEventListener('DOMContentLoaded', function() {
    console.log('Profile edit JS loaded');

    // Handle all edit buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-outline-secondary')) {
            const button = e.target.closest('.btn-outline-secondary');
            const targetModal = button.getAttribute('data-bs-target');

            if (targetModal) {
                const modalId = targetModal.replace('#', '');
                const modalElement = document.getElementById(modalId);

                if (modalElement) {
                    // Use Bootstrap to show modal
                    const modal = new bootstrap.Modal(modalElement);
                    modal.show();
                } else {
                    console.log('Modal not found, creating dynamic modal for:', modalId);
                    createDynamicModal(modalId, button);
                }
            }
        }
    });
});

// Create modal dynamically if it doesn't exist
function createDynamicModal(modalId, button) {
    // Extract item ID from modalId (e.g., "editExperienceModal-5" -> 5)
    const itemId = modalId.split('-')[1];
    const modalType = modalId.split('-')[0]; // "editExperienceModal" or "editEducationModal"

    // Create a simple modal form
    const modalHTML = `
        <div class="modal fade" id="${modalId}" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Edit ${getModalTitle(modalType)}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="${modalId}-form">
                            <div class="mb-3">
                                <label class="form-label">Title</label>
                                <input type="text" class="form-control" name="title" value="Loading...">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Description</label>
                                <textarea class="form-control" name="description" rows="3"></textarea>
                            </div>
                        </form>
                        <div class="alert alert-warning">
                            This is a temporary modal. Add the actual modal HTML to your template.
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="saveChanges('${modalId}', ${itemId})">Save</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Show the modal
    const modalElement = document.getElementById(modalId);
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

function getModalTitle(modalType) {
    if (modalType.includes('Experience')) return 'Experience';
    if (modalType.includes('Education')) return 'Education';
    if (modalType.includes('License')) return 'License/Certificate';
    return 'Item';
}

function saveChanges(modalId, itemId) {
    alert(`Saving changes for item ${itemId}. Add your save logic here.`);
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
    modal.hide();
}