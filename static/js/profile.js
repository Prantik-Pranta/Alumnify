// Profile page functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeProfileFunctions();
});

function initializeProfileFunctions() {
    // Add event listeners to connection buttons
    const connectButtons = document.querySelectorAll('.btn-connect, .btn-pending, .btn-connected, .btn-accept, .btn-ignore');

    connectButtons.forEach(button => {
        button.addEventListener('click', function() {
            handleConnectionAction(this);
        });
    });
}

function handleConnectionAction(button) {
    const csrftoken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    const userId = button.getAttribute('data-user-id') || button.getAttribute('data-sender-id');
    const actionDiv = button.closest('.profile-actions');

    if (button.classList.contains('btn-connect')) {
        // Send connection request
        sendConnectionRequest(button, userId, csrftoken);
    }
    else if (button.classList.contains('btn-pending')) {
        // Cancel pending request
        cancelConnectionRequest(button, userId, csrftoken);
    }
    else if (button.classList.contains('btn-connected')) {
        // Remove connection
        removeConnection(button, userId, csrftoken);
    }
    else if (button.classList.contains('btn-accept')) {
        // Accept connection request
        acceptConnectionRequest(actionDiv, userId, csrftoken);
    }
    else if (button.classList.contains('btn-ignore')) {
        // Ignore connection request
        ignoreConnectionRequest(actionDiv, userId, csrftoken);
    }
}

function sendConnectionRequest(button, userId, csrftoken) {
    // Show loading state
    const originalText = button.textContent;
    button.textContent = 'Sending...';
    button.disabled = true;

    // Simulate API call
    setTimeout(() => {
        button.textContent = 'Pending';
        button.className = 'btn btn-pending';
        button.disabled = false;

        showNotification('Connection request sent!', 'success');
    }, 1000);
}

function cancelConnectionRequest(button, userId, csrftoken) {
    // Show loading state
    const originalText = button.textContent;
    button.textContent = 'Canceling...';
    button.disabled = true;

    // Simulate API call
    setTimeout(() => {
        button.textContent = 'Connect';
        button.className = 'btn btn-connect';
        button.disabled = false;

        showNotification('Connection request canceled.', 'info');
    }, 1000);
}

function removeConnection(button, userId, csrftoken) {
    if (confirm('Are you sure you want to remove this connection?')) {
        // Show loading state
        const originalText = button.textContent;
        button.textContent = 'Removing...';
        button.disabled = true;

        // Simulate API call
        setTimeout(() => {
            button.textContent = 'Connect';
            button.className = 'btn btn-connect';
            button.disabled = false;

            showNotification('Connection removed successfully.', 'info');
        }, 1000);
    }
}

function acceptConnectionRequest(actionDiv, userId, csrftoken) {
    // Show loading state on both buttons
    const buttons = actionDiv.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.textContent = 'Processing...';
        btn.disabled = true;
    });

    // Simulate API call
    setTimeout(() => {
        actionDiv.innerHTML = '<button class="btn btn-connected" data-user-id="' + userId + '">Connected</button>';

        // Re-add event listener to the new button
        const newButton = actionDiv.querySelector('button');
        newButton.addEventListener('click', function() {
            handleConnectionAction(this);
        });

        showNotification('Connection request accepted!', 'success');
    }, 1000);
}

function ignoreConnectionRequest(actionDiv, userId, csrftoken) {
    // Show loading state on both buttons
    const buttons = actionDiv.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.textContent = 'Processing...';
        btn.disabled = true;
    });

    // Simulate API call
    setTimeout(() => {
        actionDiv.innerHTML = '<button class="btn btn-connect" data-user-id="' + userId + '">Connect</button>';

        // Re-add event listener to the new button
        const newButton = actionDiv.querySelector('button');
        newButton.addEventListener('click', function() {
            handleConnectionAction(this);
        });

        showNotification('Connection request ignored.', 'info');
    }, 1000);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
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

// Export functions for global access
window.ProfileFunctions = {
    handleConnectionAction,
    sendConnectionRequest,
    cancelConnectionRequest,
    removeConnection,
    acceptConnectionRequest,
    ignoreConnectionRequest
};