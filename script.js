(() => {
  'use strict';

  const STORAGE_KEY = 'student-opportunity-tracker-v1';
  const CATEGORIES = ['Scholarship', 'Internship', 'Course', 'Event', 'Job', 'Volunteer', 'Other'];
  const STATUSES = ['Interested', 'Applied', 'Waiting', 'Accepted', 'Not selected'];
  const PRIORITIES = ['High', 'Medium', 'Low'];

  const form = document.querySelector('#add-form');
  const formMessage = document.querySelector('#form-message');
  const list = document.querySelector('#opportunity-list');
  const search = document.querySelector('#search');
  const categoryFilter = document.querySelector('#category-filter');
  const statusFilter = document.querySelector('#status-filter');
  const sortOrder = document.querySelector('#sort-order');
  const exportButton = document.querySelector('#export-button');
  let opportunities = loadOpportunities();

  function loadOpportunities() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((item) => item && typeof item === 'object' && typeof item.title === 'string')
        .map((item) => ({
          id: typeof item.id === 'string' ? item.id : makeId(),
          title: item.title.slice(0, 120),
          category: CATEGORIES.includes(item.category) ? item.category : 'Other',
          deadline: isValidDate(item.deadline) ? item.deadline : '',
          priority: PRIORITIES.includes(item.priority) ? item.priority : 'Medium',
          status: STATUSES.includes(item.status) ? item.status : 'Interested',
          notes: typeof item.notes === 'string' ? item.notes.slice(0, 1000) : '',
          url: safeUrl(item.url) || '',
          createdAt: Number.isFinite(item.createdAt) ? item.createdAt : Date.now(),
        }));
    } catch {
      return [];
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(opportunities));
      formMessage.textContent = '';
    } catch {
      formMessage.textContent = 'Could not save in this browser. Check available storage or browser privacy settings.';
    }
  }

  function makeId() {
    return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function isValidDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parsed = new Date(`${value}T00:00:00`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }

  function safeUrl(value) {
    if (typeof value !== 'string' || !value.trim()) return '';
    try {
      const url = new URL(value.trim());
      return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : '';
    } catch {
      return '';
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[char]);
  }

  function dateLabel(isoDate) {
    if (!isoDate) return 'No deadline';
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(`${isoDate}T00:00:00`));
  }

  function daysUntil(isoDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(`${isoDate}T00:00:00`);
    return Math.round((due - today) / 86400000);
  }

  function updateStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inSevenDays = new Date(today.getTime() + 7 * 86400000);
    const upcoming = opportunities.filter((item) => {
      if (!item.deadline || item.status === 'Accepted' || item.status === 'Not selected') return false;
      const due = new Date(`${item.deadline}T00:00:00`);
      return due >= today && due <= inSevenDays;
    }).length;
    const progress = opportunities.filter((item) => item.status === 'Applied' || item.status === 'Waiting').length;
    document.querySelector('#stat-total').textContent = String(opportunities.length);
    document.querySelector('#stat-upcoming').textContent = String(upcoming);
    document.querySelector('#stat-progress').textContent = String(progress);
  }

  function visibleOpportunities() {
    const query = search.value.trim().toLocaleLowerCase();
    return opportunities.filter((item) => {
      const searchable = `${item.title} ${item.category} ${item.notes}`.toLocaleLowerCase();
      return (!query || searchable.includes(query))
        && (categoryFilter.value === 'all' || item.category === categoryFilter.value)
        && (statusFilter.value === 'all' || item.status === statusFilter.value);
    }).sort((a, b) => {
      if (sortOrder.value === 'priority') return PRIORITIES.indexOf(a.priority) - PRIORITIES.indexOf(b.priority) || compareDeadline(a, b);
      if (sortOrder.value === 'newest') return b.createdAt - a.createdAt;
      return compareDeadline(a, b);
    });
  }

  function compareDeadline(a, b) {
    return (a.deadline || '9999-12-31').localeCompare(b.deadline || '9999-12-31');
  }

  function render() {
    updateStats();
    const visible = visibleOpportunities();
    document.querySelector('#list-summary').textContent = `${visible.length} of ${opportunities.length} ${opportunities.length === 1 ? 'opportunity' : 'opportunities'} shown`;
    if (!visible.length) {
      const message = opportunities.length ? 'Try changing your search or filters.' : 'Add a scholarship, internship, course, job, or other opportunity to get started.';
      list.innerHTML = `<div class="empty-state"><h3>${opportunities.length ? 'No matching opportunities' : 'Your list is ready when you are'}</h3><p>${message}</p></div>`;
      return;
    }
    list.innerHTML = visible.map((item) => {
      const days = item.deadline ? daysUntil(item.deadline) : null;
      const deadlineClass = days !== null && days < 0 ? 'deadline-overdue' : days !== null && days <= 7 ? 'deadline-soon' : '';
      const deadlineText = days === null ? 'No deadline' : days < 0 ? `${dateLabel(item.deadline)} · ${Math.abs(days)} days overdue` : days === 0 ? `${dateLabel(item.deadline)} · due today` : days <= 7 ? `${dateLabel(item.deadline)} · ${days} days left` : dateLabel(item.deadline);
      const link = safeUrl(item.url);
      const options = STATUSES.map((status) => `<option${item.status === status ? ' selected' : ''}>${status}</option>`).join('');
      return `<article class="opportunity-card">
        <div>
          <div class="card-title-row"><h3>${escapeHtml(item.title)}</h3><span class="pill">${escapeHtml(item.category)}</span><span class="pill priority-${item.priority.toLowerCase()}">${escapeHtml(item.priority)} priority</span></div>
          <div class="card-meta"><span class="${deadlineClass}">Deadline: ${escapeHtml(deadlineText)}</span><span>Added ${dateLabel(new Date(item.createdAt).toISOString().slice(0, 10))}</span></div>
          ${item.notes ? `<p class="card-notes">${escapeHtml(item.notes)}</p>` : ''}
          ${link ? `<a class="official-link" href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">Open official opportunity link <span aria-hidden="true">↗</span></a>` : ''}
        </div>
        <div class="card-actions"><label class="visually-hidden" for="status-${escapeHtml(item.id)}">Status for ${escapeHtml(item.title)}</label><select class="status-select" id="status-${escapeHtml(item.id)}" data-status-id="${escapeHtml(item.id)}" aria-label="Status for ${escapeHtml(item.title)}">${options}</select><button class="icon-button" type="button" data-delete-id="${escapeHtml(item.id)}" aria-label="Delete ${escapeHtml(item.title)}">Delete</button></div>
      </article>`;
    }).join('');
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const title = String(data.get('title') || '').trim();
    const deadline = String(data.get('deadline') || '');
    const rawUrl = String(data.get('url') || '').trim();
    const url = rawUrl ? safeUrl(rawUrl) : '';
    if (!title || !isValidDate(deadline)) {
      formMessage.textContent = 'Enter a name and a valid deadline.';
      return;
    }
    if (rawUrl && !url) {
      formMessage.textContent = 'Please use a valid http or https link.';
      return;
    }
    opportunities.push({
      id: makeId(), title, deadline, url,
      category: CATEGORIES.includes(data.get('category')) ? data.get('category') : 'Other',
      priority: PRIORITIES.includes(data.get('priority')) ? data.get('priority') : 'Medium',
      status: STATUSES.includes(data.get('status')) ? data.get('status') : 'Interested',
      notes: String(data.get('notes') || '').trim().slice(0, 1000),
      createdAt: Date.now(),
    });
    save();
    form.reset();
    document.querySelector('#category').value = 'Scholarship';
    document.querySelector('#priority').value = 'Medium';
    document.querySelector('#status').value = 'Interested';
    render();
    document.querySelector('#title').focus();
  });

  list.addEventListener('change', (event) => {
    const select = event.target.closest('[data-status-id]');
    if (!select) return;
    const item = opportunities.find((opportunity) => opportunity.id === select.dataset.statusId);
    if (item && STATUSES.includes(select.value)) {
      item.status = select.value;
      save();
      render();
    }
  });

  list.addEventListener('click', (event) => {
    const button = event.target.closest('[data-delete-id]');
    if (!button) return;
    const item = opportunities.find((opportunity) => opportunity.id === button.dataset.deleteId);
    if (!item || !window.confirm(`Delete “${item.title}” from your list?`)) return;
    opportunities = opportunities.filter((opportunity) => opportunity.id !== item.id);
    save();
    render();
  });

  [search, categoryFilter, statusFilter, sortOrder].forEach((control) => {
    control.addEventListener(control === search ? 'input' : 'change', render);
  });

  exportButton.addEventListener('click', () => {
    const backup = new Blob([JSON.stringify(opportunities, null, 2)], { type: 'application/json' });
    const downloadUrl = URL.createObjectURL(backup);
    const anchor = document.createElement('a');
    anchor.href = downloadUrl;
    anchor.download = 'student-opportunities-backup.json';
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(downloadUrl);
  });

  render();
})();
