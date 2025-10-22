// Notifications functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeNotifications();
});

function initializeNotifications() {
    // Add event listeners to filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterNotifications(this);
        });
    });

    // Add click handlers to notification items
    const notificationItems = document.querySelectorAll('.notification-item');
    notificationItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Don't trigger if clicking action buttons
            if (!e.target.closest('.notification-actions')) {
                handleNotificationClick(this);
            }
        });
    });

    // Initialize notification dot
    updateNotificationDotFromDOM();
}

function updateNotificationDotFromDOM() {
    const unreadCount = document.querySelectorAll('.notification-item.unread').length;
    updateNotificationDot(unreadCount > 0);
}

function updateNotificationDot(show) {
    const navDot = document.getElementById('navNotificationDot');
    if (navDot) {
        navDot.style.display = show ? 'block' : 'none';
    }
    // Store in localStorage for persistence across pages
    localStorage.setItem('hasUnreadNotifications', show.toString());
}

function filterNotifications(button) {
    const filter = button.getAttribute('data-filter');

    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    button.classList.add('active');

    // Filter notifications
    const notifications = document.querySelectorAll('.notification-item');
    notifications.forEach(notification => {
        if (filter === 'all') {
            notification.style.display = 'flex';
        } else if (filter === 'unread') {
            if (notification.classList.contains('unread')) {
                notification.style.display = 'flex';
            } else {
                notification.style.display = 'none';
            }
        } else {
            const type = notification.getAttribute('data-type');
            if (type === filter) {
                notification.style.display = 'flex';
            } else {
                notification.style.display = 'none';
            }
        }
    });
}

function handleNotificationClick(notification) {
    // Mark as read when clicked
    if (notification.classList.contains('unread')) {
        markSingleAsRead(notification);
    }

    // You can add specific actions based on notification type
    const type = notification.getAttribute('data-type');
    switch(type) {
        case 'connection':
            // Redirect to connections page or profile
            console.log('Navigate to connections');
            break;
        case 'message':
            // Redirect to messages
            console.log('Navigate to messages');
            break;
        case 'like':
        case 'comment':
            // Redirect to post
            console.log('Navigate to post');
            break;
        default:
            // Do nothing for system notifications
            break;
    }
}

function markAsRead(button) {
    const notification = button.closest('.notification-item');
    markSingleAsRead(notification);
}

function markSingleAsRead(notification) {
    const notificationId = notification.getAttribute('data-id');

    // Show loading state
    const originalContent = notification.innerHTML;
    notification.innerHTML = '<div class="notification-content"><p>Marking as read...</p></div>';

    // Simulate API call
    setTimeout(() => {
        // Update UI
        notification.classList.remove('unread');

        // Remove mark as read button
        const actions = notification.querySelector('.notification-actions');
        const markReadBtn = actions.querySelector('.notification-action-btn:not(.primary)');
        if (markReadBtn && !markReadBtn.classList.contains('primary')) {
            markReadBtn.remove();
        }

        // Update notification dot
        updateNotificationDotFromDOM();

        showNotification('Notification marked as read', 'success');
    }, 500);
}

function markAllAsRead() {
    const unreadNotifications = document.querySelectorAll('.notification-item.unread');

    if (unreadNotifications.length === 0) {
        showNotification('All notifications are already read', 'info');
        return;
    }

    // Show loading state on button
    const button = document.querySelector('.mark-all-read-btn');
    const originalText = button.textContent;
    button.textContent = 'Marking All...';
    button.disabled = true;

    // Simulate API call for each notification
    let completed = 0;
    unreadNotifications.forEach(notification => {
        setTimeout(() => {
            notification.classList.remove('unread');

            // Remove mark as read buttons
            const actions = notification.querySelector('.notification-actions');
            const markReadBtn = actions.querySelector('.notification-action-btn:not(.primary)');
            if (markReadBtn && !markReadBtn.classList.contains('primary')) {
                markReadBtn.remove();
            }

            completed++;

            // When all are done
            if (completed === unreadNotifications.length) {
                button.textContent = originalText;
                button.disabled = false;
                updateNotificationDotFromDOM();
                showNotification('All notifications marked as read', 'success');
            }
        }, 100 * completed);
    });
}

function removeNotification(button) {
    const notification = button.closest('.notification-item');
    const notificationId = notification.getAttribute('data-id');

    // Show loading state
    notification.style.opacity = '0.5';

    // Simulate API call
    setTimeout(() => {
        // Remove from DOM with animation
        notification.style.transition = 'all 0.3s ease';
        notification.style.height = notification.offsetHeight + 'px';
        notification.offsetHeight; // Force reflow

        notification.style.height = '0';
        notification.style.marginBottom = '0';
        notification.style.paddingTop = '0';
        notification.style.paddingBottom = '0';
        notification.style.opacity = '0';
        notification.style.overflow = 'hidden';

        setTimeout(() => {
            notification.remove();
            updateNotificationDotFromDOM();
            checkEmptyState();
            showNotification('Notification dismissed', 'info');
        }, 300);
    }, 500);
}

function viewProfile(button) {
    const notification = button.closest('.notification-item');
    const notificationId = notification.getAttribute('data-id');

    // In a real app, this would redirect to the user's profile
    console.log('Viewing profile for notification:', notificationId);
    showNotification('Redirecting to profile...', 'info');

    // Simulate navigation delay
    setTimeout(() => {
        // window.location.href = `/profile/${userId}`;
    }, 1000);
}

function checkEmptyState() {
    const notifications = document.querySelectorAll('.notification-item');
    const emptyState = document.querySelector('.empty-state');
    const notificationList = document.getElementById('notificationList');

    if (notifications.length === 0 && !emptyState) {
        const newEmptyState = document.createElement('div');
        newEmptyState.className = 'empty-state';
        newEmptyState.innerHTML = `
            <div class="empty-state-icon">
                <i class="fa-solid fa-bell-slash"></i>
            </div>
            <h3>No Notifications</h3>
            <p>You're all caught up! New notifications will appear here.</p>
        `;
        notificationList.parentNode.replaceChild(newEmptyState, notificationList);

        // Remove filters and mark all button
        document.querySelector('.notification-filters')?.remove();
        document.querySelector('.mark-all-read-btn')?.remove();
    }
}

function showNotification(message, type = 'info') {
    // Create notification toast
    const toast = document.createElement('div');
    toast.className = `notification-toast notification-toast-${type}`;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
        padding: 12px 20px;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 300px;
        border-left: 4px solid ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    toast.textContent = message;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);

    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, 3000);
}

// Export for global access
window.Notifications = {
    markAllAsRead,
    markAsRead,
    removeNotification,
    filterNotifications
};