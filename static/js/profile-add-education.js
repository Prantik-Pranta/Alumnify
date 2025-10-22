// Add education functionality
function openEducationModal() {
    const modalHtml = `
        <div class="modal fade" id="addEducationModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add Education</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addEducationForm" action="{% url 'add_education' %}" method="POST">
                            {% csrf_token %}
                            <div class="mb-3">
                                <label class="form-label">School</label>
                                <input type="text" class="form-control" name="school" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Degree</label>
                                <input type="text" class="form-control" name="degree" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Field of Study</label>
                                <input type="text" class="form-control" name="field_of_study">
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
                                            <input class="form-check-input" type="checkbox" id="currentEducation">
                                            <label class="form-check-label" for="currentEducation">
                                                I currently study here
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
                        <button type="button" class="btn btn-primary" onclick="document.getElementById('addEducationForm').submit()">Save</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('addEducationModal'));
    modal.show();
}