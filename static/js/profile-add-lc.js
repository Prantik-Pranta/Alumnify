// Add license & certification functionality
document.addEventListener('DOMContentLoaded', function() {
    const addLicenseCertBtn = document.getElementById('addLicenseCertBtn');
    if (addLicenseCertBtn) {
        addLicenseCertBtn.addEventListener('click', openLCModal);
    }
});

function openLCModal() {
    const modalHtml = `
        <div class="modal fade" id="addLCModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add License & Certification</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addLCForm" action="{% url 'add_license_certificate' %}" method="POST" enctype="multipart/form-data">
                            {% csrf_token %}
                            <div class="mb-3">
                                <label class="form-label">Name</label>
                                <input type="text" class="form-control" name="name" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Issuing Organization</label>
                                <input type="text" class="form-control" name="issuing_org" required>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Issue Date</label>
                                        <input type="date" class="form-control" name="issue_date" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Expiry Date</label>
                                        <input type="date" class="form-control" name="expiry_date">
                                        <div class="form-check mt-2">
                                            <input class="form-check-input" type="checkbox" id="noExpiry">
                                            <label class="form-check-label" for="noExpiry">
                                                This credential does not expire
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Certificate File</label>
                                <input type="file" class="form-control" name="certificate_file" accept=".pdf,.jpg,.jpeg,.png">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="document.getElementById('addLCForm').submit()">Save</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('addLCModal'));
    modal.show();

    // Handle no expiry checkbox
    document.getElementById('noExpiry').addEventListener('change', function() {
        document.querySelector('input[name="expiry_date"]').disabled = this.checked;
    });
}