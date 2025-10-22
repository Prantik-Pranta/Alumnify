// network.js — AlumniFy Network Page (Redirect-based, fully compatible with Django backend)

document.addEventListener('DOMContentLoaded', function() {
    console.log('=== ALUMNIFY NETWORK PAGE LOADED ===');
    initializeNetworkPage();
});

function initializeNetworkPage() {
    initializeConnectionActions();
    initializeSuggestions();
    initializeEventListeners();
    console.log('Network page initialized successfully');
}

// ==================== CONNECTION ACTIONS ====================
function initializeConnectionActions() {
    document.addEventListener('click', function(e) {
        const target = e.target.closest('button');
        if (!target) return;

        // Accept request
        if (target.classList.contains('btn-accept')) {
            const id = target.dataset.senderId;
            if (confirm("Accept this connection request?")) {
                window.location.href = `/accept_request/${id}/`;
            }
        }

        // Ignore request
        if (target.classList.contains('btn-ignore')) {
            const id = target.dataset.senderId;
            if (confirm("Ignore this connection request?")) {
                window.location.href = `/delete_request/${id}/`;
            }
        }

        // Remove existing connection
        if (target.classList.contains('btn-connected')) {
            const id = target.dataset.userId;
            if (confirm("Remove this connection?")) {
                window.location.href = `/remove_connection/${id}/`;
            }
        }
    });
}

// ==================== SUGGESTIONS ====================
function initializeSuggestions() {
    document.addEventListener('click', function(e) {
        const btn = e.target.closest('.btn-connect');
        if (!btn) return;

        const id = btn.dataset.userId;
        if (confirm("Send a connection request?")) {
            btn.disabled = true;
            btn.textContent = "Request Sent";
            btn.classList.remove("btn-connect");
            btn.classList.add("btn-connected");
            window.location.href = `/send_request/${id}/`;
        }
    });
}

// ==================== FORM & FEEDBACK ====================
function initializeEventListeners() {
    // Search validation
    const searchForm = document.querySelector('form[action*="search_results"]');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            const input = searchForm.querySelector('input[name="search_input"]');
            if (!input.value.trim()) {
                e.preventDefault();
                showNotification('Please enter a search term', 'warning');
            }
        });
    }

    // ESC closes notifications
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeAllNotifications();
    });
}

// ==================== NOTIFICATIONS ====================
function showNotification(message, type = 'info') {
    closeAllNotifications();

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 80px; right: 20px; z-index: 9999; min-width: 300px; max-width: 400px;';
    alertDiv.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fa-solid ${getNotificationIcon(type)} me-2"></i>
            <div class="flex-grow-1">${message}</div>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;

    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 4000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || 'fa-info-circle';
}

function closeAllNotifications() {
    document.querySelectorAll('.alert.position-fixed').forEach(el => el.remove());
}

// ==================== ERROR HANDLING ====================
window.addEventListener('error', e => console.error('Global error:', e.error));
window.addEventListener('unhandledrejection', e => console.error('Unhandled promise rejection:', e.reason));

console.log('=== NETWORK.JS FULLY UPDATED ===');
