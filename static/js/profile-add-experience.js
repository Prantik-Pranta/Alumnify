// Add experience functionality
function openExperienceModal() {
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    const modalHtml = `
        <div class="modal fade" id="addExperienceModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add Experience</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addExperienceForm" action="/add_experience" method="POST">
                            <input type="hidden" name="csrfmiddlewaretoken" value="${csrfToken}">
                            <div class="mb-3">
                                <label class="form-label">Title</label>
                                <input type="text" class="form-control" name="title" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Company</label>
                                <input type="text" class="form-control" name="company" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Location</label>
                                <input type="text" class="form-control" name="location">
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Start Date</label>
                                        <input type="month" class="form-control" name="start_date" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">End Date</label>
                                        <input type="month" class="form-control" name="end_date">
                                        <div class="form-check mt-2">
                                            <input class="form-check-input" type="checkbox" id="currentJob">
                                            <label class="form-check-label" for="currentJob">
                                                I currently work here
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Description</label>
                                <textarea class="form-control" name="description" rows="4"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="document.getElementById('addExperienceForm').submit()">Save</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('addExperienceModal'));
    modal.show();

    // Handle current job checkbox
    document.getElementById('currentJob').addEventListener('change', function() {
        document.querySelector('input[name="end_date"]').disabled = this.checked;
    });
}