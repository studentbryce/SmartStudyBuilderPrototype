function initializeSupportTabs() {
    const tabButtons = document.querySelectorAll('.tab-button[data-view]');
    const panels = {
        'getting-started': document.getElementById('getting-started-view'),
        features: document.getElementById('features-view'),
        troubleshooting: document.getElementById('troubleshooting-view')
    };

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const view = this.dataset.view;

            tabButtons.forEach(item => {
                item.classList.remove('active');
                item.setAttribute('aria-selected', 'false');
            });

            this.classList.add('active');
            this.setAttribute('aria-selected', 'true');

            Object.keys(panels).forEach(key => {
                const panel = panels[key];
                if (!panel) {
                    return;
                }
                panel.hidden = key !== view;
            });
        });
    });
}

function dismissSupportAlert() {
    const alert = document.getElementById('support-alert');
    if (!alert) {
        return;
    }

    alert.style.opacity = '0';
    alert.style.transform = 'translateY(-10px)';

    setTimeout(() => {
        alert.style.display = 'none';
    }, 250);
}

function toggleFaq(button) {
    const answer = button.nextElementSibling;
    const isExpanded = button.getAttribute('aria-expanded') === 'true';

    button.setAttribute('aria-expanded', String(!isExpanded));
    if (answer) {
        answer.hidden = isExpanded;
    }
}

function focusSupportForm() {
    const subjectInput = document.getElementById('support-subject');
    if (!subjectInput) {
        return;
    }

    subjectInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => subjectInput.focus(), 150);
}

function submitSupportRequest(event) {
    event.preventDefault();

    const topic = document.getElementById('support-topic');
    const urgency = document.getElementById('support-urgency');
    const subject = document.getElementById('support-subject');
    const message = document.getElementById('support-message');

    if (!topic || !urgency || !subject || !message) {
        return;
    }

    if (!topic.value || !urgency.value || !subject.value.trim() || !message.value.trim()) {
        showSupportToast('Please complete all fields before submitting.');
        return;
    }

    showSupportToast(`Help request sent: ${topic.value} (${urgency.value} priority).`);
    event.target.reset();
}

function showSupportToast(text) {
    const toast = document.getElementById('support-toast');
    if (!toast) {
        return;
    }

    const message = toast.querySelector('.toast-message');
    if (message) {
        message.textContent = text;
    }

    toast.classList.add('show');
    window.clearTimeout(showSupportToast.timeoutId);
    showSupportToast.timeoutId = window.setTimeout(hideSupportToast, 3200);
}

function hideSupportToast() {
    const toast = document.getElementById('support-toast');
    if (!toast) {
        return;
    }

    toast.classList.remove('show');
}

document.addEventListener('DOMContentLoaded', function() {
    initializeSupportTabs();
});
