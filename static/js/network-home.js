// Network functionality for home page sidebar
document.addEventListener('DOMContentLoaded', function() {
    initializeNetworkFunctions();
});

function initializeNetworkFunctions() {
    // Add event listeners to all network buttons
    const acceptButtons = document.querySelectorAll('.network-btn-accept');
    const ignoreButtons = document.querySelectorAll('.network-btn-ignore');
    const connectButtons = document.querySelectorAll('.network-btn-connect');
    const connectedButtons = document.querySelectorAll('.network-btn-connected');

    acceptButtons.forEach(button => {
        button.addEventListener('click', function() {
            acceptRequest(this);
        });
    });

    ignoreButtons.forEach(button => {
        button.addEventListener('click', function() {
            ignoreRequest(this);
        });
    });

    connectButtons.forEach(button => {
        button.addEventListener('click', function() {
            sendConnectionRequest(this);
        });
    });

    connectedButtons.forEach(button => {
        button.addEventListener('click', function() {
            removeConnection(this);
        });
    });
}

function acceptRequest(button) {
    const senderId = button.getAttribute('data-sender-id');
    const userCard = button.closest('.network-user-card');

    console.log('Accepting connection request from user:', senderId);

    // Show loading state
    showButtonLoading(button, 'Accepting...');

    // Simulate API call delay
    setTimeout(() => {
        // Remove the user card from pending requests
        if (userCard) {
            userCard.style.opacity = '0';
            setTimeout(() => {
                userCard.remove();
                updateNetworkStats();
                showNotification('Connection request accepted successfully!', 'success');
            }, 300);
        }
    }, 1000);
}

function ignoreRequest(button) {
    const senderId = button.getAttribute('data-sender-id');
    const userCard = button.closest('.network-user-card');

    console.log('Ignoring connection request from user:', senderId);

    // Show loading state
    showButtonLoading(button, 'Ignoring...');

    // Simulate API call delay
    setTimeout(() => {
        // Remove the user card from pending requests
        if (userCard) {
            userCard.style.opacity = '0';
            setTimeout(() => {
                userCard.remove();
                updateNetworkStats();
                showNotification('Connection request ignored.', 'info');
            }, 300);
        }
    }, 1000);
}

function sendConnectionRequest(button) {
    const userId = button.getAttribute('data-user-id');
    const userCard = button.closest('.network-user-card');

    console.log('Sending connection request to user:', userId);

    // Show loading state
    showButtonLoading(button, 'Sending...');

    // Simulate API call delay
    setTimeout(() => {
        // Change button state to pending
        button.innerHTML = '<i class="fa-solid fa-clock me-1"></i>Pending';
        button.classList.remove('network-btn-connect');
        button.classList.add('network-btn-ignore');
        button.onclick = function() {
            cancelConnectionRequest(this);
        };

        showNotification('Connection request sent!', 'success');
        updateNetworkStats();
    }, 1000);
}

function cancelConnectionRequest(button) {
    const userId = button.getAttribute('data-user-id');
    const userCard = button.closest('.network-user-card');

    console.log('Canceling connection request to user:', userId);

    // Show loading state
    showButtonLoading(button, 'Canceling...');

    // Simulate API call delay
    setTimeout(() => {
        // Change button back to connect state
        button.innerHTML = '<i class="fa-solid fa-user-plus me-1"></i>Connect';
        button.classList.remove('network-btn-ignore');
        button.classList.add('network-btn-connect');
        button.onclick = function() {
            sendConnectionRequest(this);
        };

        showNotification('Connection request canceled.', 'info');
        updateNetworkStats();
    }, 1000);
}

function removeConnection(button) {
    const userId = button.getAttribute('data-user-id');
    const userCard = button.closest('.network-user-card');

    console.log('Removing connection with user:', userId);

    if (confirm('Are you sure you want to remove this connection?')) {
        // Show loading state
        showButtonLoading(button, 'Removing...');

        // Simulate API call delay
        setTimeout(() => {
            // Remove the user card from connections
            if (userCard) {
                userCard.style.opacity = '0';
                setTimeout(() => {
                    userCard.remove();
                    updateNetworkStats();
                    showNotification('Connection removed successfully.', 'info');
                }, 300);
            }
        }, 1000);
    }
}

function showButtonLoading(button, text) {
    const originalHTML = button.innerHTML;
    button.innerHTML = `<i class="fa-solid fa-spinner fa-spin me-1"></i>${text}`;
    button.disabled = true;

    // Store original content for potential restoration
    button.setAttribute('data-original-html', originalHTML);
}

function restoreButton(button, newHTML = null) {
    if (newHTML) {
        button.innerHTML = newHTML;
    } else {
        const originalHTML = button.getAttribute('data-original-html');
        if (originalHTML) {
            button.innerHTML = originalHTML;
        }
    }
    button.disabled = false;
}

function updateNetworkStats() {
    // Update connection count
    const connectionCards = document.querySelectorAll('.network-section-card:nth-child(3) .network-user-card');
    const connectionsStat = document.querySelector('.network-stats .stat-item:nth-child(1) .stat-number');
    if (connectionsStat) {
        connectionsStat.textContent = connectionCards.length;
    }

    // Update pending requests count
    const pendingCards = document.querySelectorAll('.network-section-card:nth-child(2) .network-user-card:not(.text-center)');
    const pendingStat = document.querySelector('.network-stats .stat-item:nth-child(2) .stat-number');
    if (pendingStat) {
        pendingStat.textContent = pendingCards.length;
    }

    // Update suggestions count
    const suggestionCards = document.querySelectorAll('.network-section-card:nth-child(4) .network-user-card:not(.text-center)');
    const suggestionsStat = document.querySelector('.network-stats .stat-item:nth-child(3) .stat-number');
    if (suggestionsStat) {
        suggestionsStat.textContent = suggestionCards.length;
    }

    // Check for empty states
    checkEmptyStates();
}

function checkEmptyStates() {
    const sections = document.querySelectorAll('.network-section-card');

    sections.forEach(section => {
        const userCards = section.querySelectorAll('.network-user-card:not(.text-center)');
        const emptyState = section.querySelector('.network-empty-state');

        if (userCards.length === 0 && !emptyState) {
            createEmptyState(section);
        } else if (userCards.length > 0 && emptyState) {
            emptyState.remove();
        }
    });
}

function createEmptyState(section) {
    const sectionHeader = section.querySelector('.network-section-header h3').textContent;
    let emptyStateHTML = '';

    if (sectionHeader.includes('Invitations')) {
        emptyStateHTML = `
            <div class="network-empty-state">
                <div class="network-empty-state-icon">
                    <i class="fa-solid fa-user-clock"></i>
                </div>
                <h4>No Pending Requests</h4>
                <p>You have no pending connection requests.</p>
            </div>
        `;
    } else if (sectionHeader.includes('People You May Know')) {
        emptyStateHTML = `
            <div class="network-empty-state">
                <div class="network-empty-state-icon">
                    <i class="fa-solid fa-user-plus"></i>
                </div>
                <h4>No Suggestions</h4>
                <p>We'll suggest people as your network grows.</p>
            </div>
        `;
    }

    if (emptyStateHTML) {
        const sectionContent = section.querySelector('.network-section-content');
        sectionContent.innerHTML = emptyStateHTML;
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Export functions for global access (if needed)
window.NetworkHome = {
    acceptRequest,
    ignoreRequest,
    sendConnectionRequest,
    removeConnection,
    cancelConnectionRequest,
    updateNetworkStats
};