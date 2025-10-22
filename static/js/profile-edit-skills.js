// Edit skill functionality
function openEditSkillModal(skillId) {
    const modalHtml = `
        <div class="modal fade" id="editSkillModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Edit Skill</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editSkillForm" action="{% url 'edit_skill' %}" method="POST">
                            {% csrf_token %}
                            <input type="hidden" name="skill_id" value="${skillId}">
                            <div class="mb-3">
                                <label class="form-label">Skill Name</label>
                                <input type="text" class="form-control" name="skill_name" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Related Experiences</label>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" name="experiences" value="">
                                    <label class="form-check-label">No related experiences</label>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Related Educations</label>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" name="educations" value="">
                                    <label class="form-check-label">No related educations</label>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Related Licenses & Certifications</label>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" name="licenses" value="">
                                    <label class="form-check-label">No related licenses</label>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="document.getElementById('editSkillForm').submit()">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('editSkillModal'));
    modal.show();
}