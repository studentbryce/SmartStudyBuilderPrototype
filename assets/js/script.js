// ===========================
// STATE MANAGEMENT
// ===========================

let assignments = [
    {
        id: 0,
        course: 'AI and Algorithms',
        title: 'As 1: Search and Heuristic Models',
        dueDate: 'Friday, March 19',
        daysUntil: 4,
        estimatedTime: '2-3 hours reading',
        status: 'not-started',
        progress: 0
    },
    {
        id: 1,
        course: 'Cyber Security',
        title: 'As 1: Threat Modeling Report',
        dueDate: 'Thursday, March 18',
        daysUntil: 3,
        estimatedTime: '3-4 hours',
        status: 'in-progress',
        progress: 40
    },
    {
        id: 2,
        course: 'Human Computer Interaction',
        title: 'As 1: Usability Evaluation Plan',
        dueDate: 'Monday, March 22',
        daysUntil: 7,
        estimatedTime: '4-6 hours total',
        status: 'not-started',
        progress: 0
    }
];

let lastAction = null;
let editingAssignmentId = null;
let currentView = 'week';
let listSort = {
    field: 'due',
    direction: 'asc'
};

// ===========================
// INITIALIZATION
// ===========================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Smart Study Schedule Builder loaded');
    initializeTabSwitching();
    renderAssignments();
    switchView('week', true);
    
    // Simulate sync animation stopping after 5 seconds
    setTimeout(() => {
        const syncIndicator = document.querySelector('.sync-indicator');
        if (syncIndicator) {
            syncIndicator.style.animation = 'none';
            syncIndicator.textContent = '✓';
        }
    }, 5000);
});

// ===========================
// TAB SWITCHING
// ===========================

function initializeTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get the view type
            const view = this.dataset.view;
            
            switchView(view);
        });
    });
}

function switchView(viewType, silent = false) {
    console.log(`Switching to ${viewType} view`);

    currentView = viewType;

    const panels = {
        week: document.getElementById('week-view'),
        month: document.getElementById('month-view'),
        list: document.getElementById('list-view'),
        timeline: document.getElementById('timeline-view')
    };

    Object.keys(panels).forEach(key => {
        const panel = panels[key];
        if (!panel) return;
        panel.hidden = key !== viewType;
    });

    renderSupplementaryViews(getFilteredAssignments());

    if (!silent) {
        showToast(`Switched to ${viewType} view`);
    }
}

// ===========================
// ALERT MANAGEMENT
// ===========================

function dismissAlert() {
    const alert = document.getElementById('workload-alert');
    if (alert) {
        alert.style.opacity = '0';
        alert.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            alert.style.display = 'none';
        }, 300);
    }
}

// ===========================
// ASSIGNMENT ACTIONS
// ===========================

function markInProgress(assignmentId) {
    const assignment = getAssignmentById(assignmentId);
    if (!assignment) return;
    
    // Store for undo
    lastAction = {
        type: 'markInProgress',
        assignmentId: assignmentId,
        previousStatus: assignment.status
    };
    
    // Update state
    assignment.status = 'in-progress';
    assignment.progress = 10; // Start at 10%
    
    // Update UI
    updateAssignmentCard(assignmentId);
    
    // Show toast
    showToast(`Started working on ${assignment.title}`, true);
}

function continueWork(assignmentId) {
    const assignment = getAssignmentById(assignmentId);
    if (!assignment) return;
    showToast(`Continuing ${assignment.title}...`);
    
    // In a real app, this might open a study interface or navigate to content
    console.log(`Opening ${assignment.title}`);
}

function markComplete(assignmentId) {
    const assignment = getAssignmentById(assignmentId);
    if (!assignment) return;
    
    // Store for undo
    lastAction = {
        type: 'markComplete',
        assignmentId: assignmentId,
        previousStatus: assignment.status,
        previousProgress: assignment.progress
    };
    
    // Update state
    assignment.status = 'completed';
    assignment.progress = 100;
    
    // Update UI
    updateAssignmentCard(assignmentId);
    
    // Show celebration toast
    showToast(`🎉 Completed "${assignment.title}"!`, true);
}

function updateAssignmentCard(assignmentId) {
    const assignment = getAssignmentById(assignmentId);
    if (!assignment) return;

    console.log(`Updated assignment ${assignmentId}:`, assignment);
    renderAssignments();
    applyFilters(true);
}

function showDetails(assignmentId) {
    const assignment = getAssignmentById(assignmentId);
    if (!assignment) return;
    const modal = document.getElementById('modal-overlay');
    const modalBody = document.getElementById('modal-body');
    
    // Populate modal with assignment details
    modalBody.innerHTML = `
        <div class="card-header" style="margin-bottom: var(--spacing-lg);">
            <div class="course-tag ${getCourseClass(assignment.course)}">${assignment.course}</div>
            <div class="priority-badge ${getPriorityClass(assignment.daysUntil)}">${getPriorityText(assignment.daysUntil)}</div>
        </div>
        
        <h3 style="margin-bottom: var(--spacing-lg);">${assignment.title}</h3>
        
        <div class="modal-info-grid">
            <div class="modal-info-label">📅 Due Date:</div>
            <div class="modal-info-value">
                ${assignment.dueDate}
                <span class="due-badge ${getUrgencyClass(assignment.daysUntil)}">
                    IN ${assignment.daysUntil} DAYS
                </span>
            </div>
            
            <div class="modal-info-label">📊 Status:</div>
            <div class="modal-info-value">
                <span class="status-label ${assignment.status.replace('-', '')}">
                    ${formatStatus(assignment.status, assignment.progress)}
                </span>
            </div>
            
            <div class="modal-info-label">⏱️ Estimated Time:</div>
            <div class="modal-info-value">${assignment.estimatedTime}</div>
        </div>
        
        <div class="modal-section">
            <h4>📏 Description</h4>
            <div class="modal-description">
                ${getAssignmentDescription(assignmentId)}
            </div>
        </div>
        
        <div class="modal-section">
            <h4>📎 Resources</h4>
            <ul class="modal-list">
                <li>Lecture slides: Week 5-7</li>
                <li>Textbook: Chapters 3-5</li>
                <li>Practice materials (Moodle)</li>
            </ul>
        </div>
        
        <div class="modal-section">
            <h4>🔔 Reminders</h4>
            <ul class="modal-list">
                <li>✓ 1 week before (sent)</li>
                <li>✓ 3 days before (sent)</li>
                <li>⏰ 1 day before (pending)</li>
            </ul>
        </div>
        
        <div style="background-color: #e8f4fd; padding: var(--spacing-md); border-radius: var(--radius-md); margin-top: var(--spacing-lg);">
            <h4 style="margin-bottom: var(--spacing-sm); color: var(--primary-color);">💡 Smart Suggestion</h4>
            <p style="margin: 0; color: var(--text-primary);">
                ${getSmartSuggestion(assignment)}
            </p>
        </div>
    `;
    
    // Show modal
    modal.classList.add('show');
    
    // Set focus to close button for accessibility
    setTimeout(() => {
        document.querySelector('.modal-close').focus();
    }, 100);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('modal-overlay');
    modal.classList.remove('show');
    
    // Restore body scroll
    document.body.style.overflow = '';
}

function openInMoodle() {
    // In real implementation, this would open the actual Moodle assignment page
    showToast('Opening in Moodle...');
    setTimeout(() => {
        closeModal();
    }, 1000);
}

// Helper functions for modal content
function getCourseClass(courseName) {
    const courseMap = {
        'AI and Algorithms': 'ai',
        'Cyber Security': 'cybersecurity',
        'Human Computer Interaction': 'hci',
        'Software Engineering': 'software',
        'Project Management': 'project'
    };
    return courseMap[courseName] || 'ai';
}

function getPriorityClass(daysUntil) {
    if (daysUntil <= 3) return 'high';
    if (daysUntil <= 7) return 'medium';
    return 'low';
}

function getPriorityText(daysUntil) {
    if (daysUntil <= 3) return 'High Priority';
    if (daysUntil <= 7) return 'Medium Priority';
    return 'Plan Ahead';
}

function getUrgencyClass(daysUntil) {
    if (daysUntil <= 3) return 'urgent';
    if (daysUntil <= 7) return 'important';
    return 'normal';
}

function formatStatus(status, progress) {
    if (status === 'completed') return 'Completed ✓';
    if (status === 'in-progress') return `In Progress (${progress}%)`;
    return 'Not Started';
}

function getAssignmentDescription(assignmentId) {
    const descriptions = {
        0: `This paper focuses on AI and algorithmic reasoning, including:
           <ul style="margin: var(--spacing-sm) 0; padding-left: var(--spacing-lg);">
               <li>State-space search strategies</li>
               <li>Heuristic evaluation and admissibility</li>
               <li>Comparing informed vs uninformed search</li>
           </ul>
           <strong>Format:</strong> Structured short-answer paper<br>
           <strong>Length:</strong> 1200 words<br>
           <strong>References:</strong> Minimum 5 academic sources`,
        1: `Develop a cyber security threat-modeling paper. Include:
           <ul style="margin: var(--spacing-sm) 0; padding-left: var(--spacing-lg);">
               <li>System scope and trust boundaries</li>
               <li>Threat analysis using STRIDE</li>
               <li>Risk ranking and mitigation strategies</li>
               <li>Reflection on residual risk</li>
           </ul>
           Submit as PDF with diagrams and a mitigation table.`,
        2: `Create a Human Computer Interaction paper presenting:
           <ul style="margin: var(--spacing-sm) 0; padding-left: var(--spacing-lg);">
               <li>User personas and usage context</li>
               <li>Task flow and pain-point analysis</li>
               <li>Usability testing plan and metrics</li>
               <li>Accessibility and inclusive design approach</li>
               <li>Expected UX outcomes</li>
           </ul>
           Include annotated mockups and evaluation criteria.`
    };
    return descriptions[assignmentId] || 'No description available.';
}

function getAssignmentById(assignmentId) {
    return assignments.find(item => item.id === assignmentId);
}

function renderAssignments() {
    const assignmentsGrid = document.querySelector('.assignments-grid');
    if (!assignmentsGrid) return;

    assignmentsGrid.innerHTML = assignments.map(assignment => {
        const cardPriorityClass = getUrgencyClass(assignment.daysUntil);
        const statusText = formatStatus(assignment.status, assignment.progress);
        const needsProgress = assignment.status === 'in-progress' || assignment.status === 'completed';
        const primaryAction = assignment.status === 'in-progress'
            ? `<button class="btn btn-primary" onclick="continueWork(${assignment.id})">Continue</button>`
            : `<button class="btn btn-primary" onclick="markInProgress(${assignment.id})">Start Now</button>`;

        return `
            <div class="assignment-card ${cardPriorityClass}" data-assignment-id="${assignment.id}">
                <div class="card-header">
                    <div class="course-tag ${getCourseClass(assignment.course)}">${assignment.course}</div>
                    <div class="priority-badge ${getPriorityClass(assignment.daysUntil)}">${getPriorityText(assignment.daysUntil)}</div>
                </div>
                <h4 class="assignment-title">${assignment.title}</h4>
                <div class="assignment-meta">
                    <div class="meta-item">
                        <span class="icon">📅</span>
                        <span class="meta-text">Due: ${assignment.dueDate}</span>
                        <span class="due-badge ${cardPriorityClass}">IN ${assignment.daysUntil} DAYS</span>
                    </div>
                    <div class="meta-item">
                        <span class="icon">⏱️</span>
                        <span class="meta-text">Est. Time: ${assignment.estimatedTime}</span>
                    </div>
                    <div class="meta-item">
                        <span class="icon">📊</span>
                        <span class="status-label ${assignment.status}">${statusText}</span>
                    </div>
                </div>
                ${needsProgress ? `<div class="progress-bar"><div class="progress-fill" style="width: ${assignment.progress}%"></div></div>` : ''}
                <div class="card-actions">
                    ${primaryAction}
                    <button class="btn btn-success" onclick="markComplete(${assignment.id})">Mark Complete</button>
                    <button class="btn btn-edit" onclick="openEditCard(${assignment.id})">Edit Card</button>
                </div>
                <button class="btn btn-secondary" style="width: 100%; margin-top: 8px;" onclick="showDetails(${assignment.id})">View Details</button>
            </div>
        `;
    }).join('');

    applyFilters(true);
}

function getNextAssignmentId() {
    if (assignments.length === 0) {
        return 0;
    }

    return Math.max(...assignments.map(item => item.id)) + 1;
}

function openCardManager() {
    const manager = document.getElementById('card-manager-overlay');
    if (!manager) return;

    manager.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeCardManager() {
    const manager = document.getElementById('card-manager-overlay');
    if (!manager) return;

    manager.classList.remove('show');
    document.body.style.overflow = '';
}

function openEditCard(assignmentId) {
    const assignment = getAssignmentById(assignmentId);
    if (!assignment) return;

    editingAssignmentId = assignmentId;

    document.getElementById('card-course').value = assignment.course;
    document.getElementById('card-title').value = assignment.title;
    document.getElementById('card-due-date').value = assignment.dueDate;
    document.getElementById('card-days-until').value = assignment.daysUntil;
    document.getElementById('card-estimated-time').value = assignment.estimatedTime;
    document.getElementById('card-status').value = assignment.status;
    document.getElementById('card-progress').value = assignment.progress;
    document.getElementById('card-form-submit').textContent = 'Update Card';

    openCardManager();
}

function resetCardForm() {
    editingAssignmentId = null;
    const form = document.getElementById('card-manager-form');
    if (form) {
        form.reset();
    }

    const progressInput = document.getElementById('card-progress');
    if (progressInput) {
        progressInput.value = 0;
    }

    const submit = document.getElementById('card-form-submit');
    if (submit) {
        submit.textContent = 'Create Card';
    }
}

function submitCardForm(event) {
    event.preventDefault();

    const formData = {
        course: document.getElementById('card-course').value.trim(),
        title: document.getElementById('card-title').value.trim(),
        dueDate: document.getElementById('card-due-date').value.trim(),
        daysUntil: Number(document.getElementById('card-days-until').value),
        estimatedTime: document.getElementById('card-estimated-time').value.trim(),
        status: document.getElementById('card-status').value,
        progress: Number(document.getElementById('card-progress').value)
    };

    if (editingAssignmentId === null) {
        const newAssignment = {
            id: getNextAssignmentId(),
            ...formData
        };

        assignments.push(newAssignment);
        showToast(`Created card: ${newAssignment.title}`);
    } else {
        const assignment = getAssignmentById(editingAssignmentId);
        if (!assignment) return;

        Object.assign(assignment, formData);
        showToast(`Updated card: ${assignment.title}`);
    }

    renderAssignments();
    resetCardForm();
    closeCardManager();
}

function getSmartSuggestion(assignment) {
    if (assignment.daysUntil <= 3) {
        return `Start working on this today! You have ${assignment.daysUntil} days until the deadline. Aim to complete it in one focused session.`;
    } else if (assignment.daysUntil <= 7) {
        return `Plan to start this in the next 2-3 days. Break it into sessions across multiple days for better retention.`;
    } else {
        return `You have time! Start early next week to avoid the rush. Your future self will thank you.`;
    }
}

// ===========================
// SCHEDULING ACTIONS
// ===========================

function scheduleTask(assignmentId, timeframe) {
    const assignment = getAssignmentById(assignmentId);
    if (!assignment) return;
    const timeframeText = {
        'today': 'today 2:00-5:00 PM',
        'wednesday': 'Wednesday evening',
        'weekend': 'this weekend'
    };
    
    showToast(`Scheduled: ${assignment.title} for ${timeframeText[timeframe]}`);
    
    // In real implementation, this would:
    // - Add to user's calendar
    // - Set reminders
    // - Update the schedule view
}

// ===========================
// TOAST NOTIFICATIONS
// ===========================

function showToast(message, showUndo = false) {
    const toast = document.getElementById('toast');
    const toastMessage = toast.querySelector('.toast-message');
    const toastUndo = toast.querySelector('.toast-undo');
    
    // Set message
    toastMessage.textContent = message;
    
    // Show/hide undo button
    if (showUndo) {
        toastUndo.style.display = 'inline-block';
    } else {
        toastUndo.style.display = 'none';
    }
    
    // Show toast
    toast.classList.add('show');
    
    // Hide after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

function undoAction() {
    if (!lastAction) {
        return;
    }
    
    const assignment = getAssignmentById(lastAction.assignmentId);
    if (!assignment) return;
    
    if (lastAction.type === 'markInProgress' || lastAction.type === 'markComplete') {
        // Revert status
        assignment.status = lastAction.previousStatus;
        assignment.progress = lastAction.previousProgress || 0;
        
        // Update UI
        updateAssignmentCard(lastAction.assignmentId);
        
        // Hide toast
        const toast = document.getElementById('toast');
        toast.classList.remove('show');
        
        // Clear last action
        lastAction = null;
        
        // Show confirmation
        setTimeout(() => {
            showToast('Action undone');
        }, 300);
    }
}

// ===========================
// FILTER FUNCTIONS
// ===========================

function toggleFilter() {
    const filterPanel = document.getElementById('filter-panel');
    filterPanel.classList.toggle('show');
}

function closeFilter() {
    const filterPanel = document.getElementById('filter-panel');
    filterPanel.classList.remove('show');
}

function applyFilters() {
    const filteredAssignments = getFilteredAssignments();
    const selectedCourses = getSelectedFilterValues(0);
    const selectedStatuses = getSelectedFilterValues(1);
    const allCourseOptions = getAllFilterValues(0);
    const cards = document.querySelectorAll('.assignment-card[data-assignment-id]');

    cards.forEach(card => {
        const assignmentId = Number(card.dataset.assignmentId);
        const assignment = getAssignmentById(assignmentId);

        if (!assignment) {
            return;
        }

        const courseIsFilterable = allCourseOptions.includes(assignment.course);
        const matchesCourse = !courseIsFilterable || selectedCourses.includes(assignment.course);
        const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(assignment.status);
        const shouldShow = matchesCourse && matchesStatus;

        card.style.display = shouldShow ? '' : 'none';
    });

    renderSupplementaryViews(filteredAssignments);
}

function clearFilters() {
    // Reset all checkboxes to checked
    const checkboxes = document.querySelectorAll('.filter-checkbox input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = true);
    applyFilters();
    showToast('Filters cleared');
}

function getSelectedFilterValues(sectionIndex) {
    const filterSections = document.querySelectorAll('.filter-section');
    const section = filterSections[sectionIndex];

    if (!section) {
        return [];
    }

    const checkedInputs = section.querySelectorAll('input[type="checkbox"]:checked');
    return Array.from(checkedInputs).map(input => input.value);
}

function getAllFilterValues(sectionIndex) {
    const filterSections = document.querySelectorAll('.filter-section');
    const section = filterSections[sectionIndex];

    if (!section) {
        return [];
    }

    const inputs = section.querySelectorAll('input[type="checkbox"]');
    return Array.from(inputs).map(input => input.value);
}

function getFilteredAssignments() {
    const selectedCourses = getSelectedFilterValues(0);
    const selectedStatuses = getSelectedFilterValues(1);
    const allCourseOptions = getAllFilterValues(0);

    return assignments.filter(assignment => {
        const courseIsFilterable = allCourseOptions.includes(assignment.course);
        const matchesCourse = !courseIsFilterable || selectedCourses.includes(assignment.course);
        const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(assignment.status);
        return matchesCourse && matchesStatus;
    });
}

function renderSupplementaryViews(filteredAssignments) {
    renderMonthView(filteredAssignments);
    renderListView(filteredAssignments);
    renderTimelineView(filteredAssignments);
}

function renderMonthView(filteredAssignments) {
    const monthGrid = document.getElementById('month-grid');
    const monthLabel = document.getElementById('month-view-label');
    if (!monthGrid) return;

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    if (monthLabel) {
        monthLabel.textContent = new Date(year, month, 1).toLocaleString('en-NZ', {
            month: 'long',
            year: 'numeric'
        });
    }

    const startDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const assignmentsByDate = {};
    filteredAssignments.forEach(item => {
        const due = new Date(today);
        due.setDate(today.getDate() + item.daysUntil);
        if (due.getFullYear() === year && due.getMonth() === month) {
            const day = due.getDate();
            if (!assignmentsByDate[day]) {
                assignmentsByDate[day] = [];
            }
            assignmentsByDate[day].push(item);
        }
    });

    const markup = [];
    dayNames.forEach(name => {
        markup.push(`<div class="month-day-name">${name}</div>`);
    });

    for (let i = 0; i < startDay; i += 1) {
        markup.push('<div class="month-cell is-padding"></div>');
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
        const isToday = day === today.getDate();
        const entries = assignmentsByDate[day] || [];
        const itemsMarkup = entries.slice(0, 2).map(item => `
            <div class="month-item ${getUrgencyClass(item.daysUntil)}" title="${item.title}">${item.title}</div>
        `).join('');

        const moreMarkup = entries.length > 2
            ? `<div class="month-item normal">+${entries.length - 2} more</div>`
            : '';

        markup.push(`
            <div class="month-cell ${isToday ? 'today' : ''}">
                <div class="month-date">${day}</div>
                ${itemsMarkup}
                ${moreMarkup}
            </div>
        `);
    }

    monthGrid.innerHTML = markup.join('');
}

function renderListView(filteredAssignments) {
    const tbody = document.getElementById('list-view-body');
    if (!tbody) return;

    const sorted = [...filteredAssignments].sort((a, b) => compareAssignments(a, b, listSort.field, listSort.direction));

    if (sorted.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6"><div class="view-empty">No assignments match the active filters.</div></td></tr>`;
        return;
    }

    tbody.innerHTML = sorted.map(item => `
        <tr>
            <td><span class="course-tag ${getCourseClass(item.course)}">${item.course}</span></td>
            <td>${item.title}</td>
            <td>${item.dueDate} (${item.daysUntil} days)</td>
            <td><span class="status-label ${item.status}">${formatStatus(item.status, item.progress)}</span></td>
            <td>${item.estimatedTime}</td>
            <td>
                <button class="btn-link" onclick="showDetails(${item.id})">Details</button>
            </td>
        </tr>
    `).join('');
}

function renderTimelineView(filteredAssignments) {
    const track = document.getElementById('timeline-track');
    if (!track) return;

    const groups = [
        { key: 'this-week', label: 'This Week', test: value => value <= 6 },
        { key: 'next-week', label: 'Next Week', test: value => value >= 7 && value <= 13 },
        { key: 'later', label: 'Later', test: value => value >= 14 }
    ];

    const rows = groups.map(group => {
        const items = filteredAssignments.filter(item => group.test(item.daysUntil));
        const content = items.length === 0
            ? '<div class="view-empty">No items in this range.</div>'
            : `<div class="timeline-items">${items.map(item => `
                <div class="timeline-item ${getUrgencyClass(item.daysUntil)}">
                    <div class="timeline-item-title">${item.title}</div>
                    <div class="timeline-item-meta">${item.course} • ${item.dueDate}</div>
                </div>
            `).join('')}</div>`;

        return `
            <div class="timeline-row">
                <div class="timeline-label">${group.label}</div>
                ${content}
            </div>
        `;
    });

    track.innerHTML = rows.join('');
}

function compareAssignments(a, b, field, direction) {
    const multiplier = direction === 'asc' ? 1 : -1;

    if (field === 'course') {
        return a.course.localeCompare(b.course) * multiplier;
    }

    if (field === 'status') {
        const order = {
            'not-started': 0,
            'in-progress': 1,
            completed: 2
        };
        return (order[a.status] - order[b.status]) * multiplier;
    }

    return (a.daysUntil - b.daysUntil) * multiplier;
}

function setListSort(field) {
    listSort.field = field;
    renderListView(getFilteredAssignments());
}

function toggleListSortDirection() {
    listSort.direction = listSort.direction === 'asc' ? 'desc' : 'asc';
    const directionButton = document.getElementById('list-sort-direction');
    if (directionButton) {
        directionButton.textContent = listSort.direction === 'asc' ? 'Ascending' : 'Descending';
    }
    renderListView(getFilteredAssignments());
}

// ===========================
// UTILITY FUNCTIONS
// ===========================

function formatDate(dateString) {
    // Simple date formatting utility
    // In production, use a library like date-fns or Luxon
    return dateString;
}

function calculateDaysUntil(dueDate) {
    // Calculate days until due date
    // In production, implement proper date math
    return 0;
}

// ===========================
// ACCESSIBILITY HELPERS
// ===========================

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Don't trigger if user is typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }
    
    // Close modal on Escape
    if (e.key === 'Escape') {
        const cardManager = document.getElementById('card-manager-overlay');
        if (cardManager && cardManager.classList.contains('show')) {
            closeCardManager();
            return;
        }

        const modal = document.getElementById('modal-overlay');
        if (modal.classList.contains('show')) {
            closeModal();
            return;
        }
        
        const filterPanel = document.getElementById('filter-panel');
        if (filterPanel.classList.contains('show')) {
            closeFilter();
            return;
        }
        
        dismissAlert();
        return;
    }
    
    switch(e.key) {
        case 'w':
        case 'W':
            // Focus on "This Week" tab
            document.querySelector('[data-view="week"]').click();
            break;
        case 'm':
        case 'M':
            // Focus on "Month View" tab
            document.querySelector('[data-view="month"]').click();
            break;
        case 'l':
        case 'L':
            // Focus on "List View" tab
            document.querySelector('[data-view="list"]').click();
            break;
            case 't':
            case 'T':
            // Focus on "Timeline View" tab
            document.querySelector('[data-view="timeline"]').click();
            break;
        case 'f':
        case 'F':
            // Toggle filter
            toggleFilter();
            break;
    }
});

// Focus management for modal dialogs
function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    element.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    });
}

// ===========================
// DEMO/TESTING FEATURES
// ===========================

// Add a function to simulate new assignment appearing
function simulateNewAssignment() {
    const newAssignment = {
        id: getNextAssignmentId(),
        course: 'Software Engineering',
        title: 'Agile Sprint Report',
        dueDate: 'Tuesday, March 23',
        daysUntil: 8,
        estimatedTime: '2-3 hours',
        status: 'not-started',
        progress: 0
    };
    
    assignments.push(newAssignment);
    renderAssignments();
    applyFilters(true);
    showToast('New assignment added: Agile Sprint Report');
    console.log('New assignment added:', newAssignment);
}

// Expose some functions to window for console testing
window.demoFunctions = {
    simulateNewAssignment,
    markComplete,
    markInProgress,
    showToast
};

console.log('Demo functions available: window.demoFunctions');
