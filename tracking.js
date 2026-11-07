// Feature 2: Status tracking & assignment (Jira epic "Status Tracking & Assignment")
(() => {
  const agents = () => Store.USERS.filter(u => u.role === 'agent');

  const assigneeName = t =>
    t.assigneeId ? App.esc(Store.user(t.assigneeId)?.name) : '<span class="muted">Not assigned yet</span>';

  function statusSelect(t) {
    return `<select data-action="status" data-id="${t.id}" aria-label="Status of ${t.id}">
      ${Store.STATUSES.map(s => `<option ${s === t.status ? 'selected' : ''}>${s}</option>`).join('')}
    </select>`;
  }

  function assignSelect(t) {
    return `<select data-action="assign" data-id="${t.id}" aria-label="Assignee of ${t.id}">
      <option value="">Unassigned</option>
      ${agents().map(a => `<option value="${a.id}" ${a.id === t.assigneeId ? 'selected' : ''}>${App.esc(a.name)}</option>`).join('')}
    </select>`;
  }

  // One handler for every status and assignee dropdown on the screen.
  function wireControls(main) {
    main.addEventListener('change', event => {
      const { action, id } = event.target.dataset;
      if (action === 'status') Store.updateTicket(id, { status: event.target.value });
      else if (action === 'assign') Store.updateTicket(id, { assigneeId: event.target.value || null });
      else return;
      App.render();
    });
  }

  const COLUMNS = {
    id: { label: 'ID', cell: t => `<a href="#/ticket/${t.id}">${t.id}</a>` },
    subject: { label: 'Subject', cell: t => App.esc(t.subject) },
    category: { label: 'Category', cell: t => App.esc(t.category) },
    student: { label: 'Student', cell: t => App.esc(Store.user(t.studentId)?.name) },
    status: { label: 'Status', cell: t => App.statusBadge(t.status) },
    statusEdit: { label: 'Status', cell: statusSelect },
    assignee: { label: 'Assigned to', cell: assigneeName },
    assignEdit: { label: 'Assigned to', cell: assignSelect },
    updated: { label: 'Last update', cell: t => App.formatDate(t.updatedAt) },
  };

  function table(tickets, columns, emptyText) {
    if (!tickets.length) return `<p class="empty">${emptyText}</p>`;
    const newestFirst = [...tickets].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return `<div class="table-wrap"><table class="tickets">
      <thead><tr>${columns.map(c => `<th>${c.label}</th>`).join('')}</tr></thead>
      <tbody>${newestFirst.map(t => `<tr>${columns.map(c => `<td>${c.cell(t)}</td>`).join('')}</tr>`).join('')}</tbody>
    </table></div>`;
  }

  App.addView({
    id: 'my-tickets',
    label: 'My tickets',
    roles: ['student'],
    render(main, params, user) {
      const mine = Store.allTickets().filter(t => t.studentId === user.id);
      main.innerHTML = '<h1>My tickets</h1>' + table(
        mine,
        [COLUMNS.id, COLUMNS.subject, COLUMNS.status, COLUMNS.assignee, COLUMNS.updated],
        'You have not submitted any tickets yet.'
      );
    },
  });

  App.addView({
    id: 'queue',
    label: 'My queue',
    roles: ['agent'],
    render(main, params, user) {
      const mine = Store.allTickets().filter(t => t.assigneeId === user.id);
      main.innerHTML = '<h1>Tickets assigned to me</h1>' + table(
        mine,
        [COLUMNS.id, COLUMNS.subject, COLUMNS.category, COLUMNS.student, COLUMNS.statusEdit, COLUMNS.updated],
        'No tickets are assigned to you.'
      );
      wireControls(main);
    },
  });

  App.addView({
    id: 'all',
    label: 'All tickets',
    roles: ['manager'],
    render(main, params) {
      const everything = Store.allTickets();
      const unassigned = everything.filter(t => !t.assigneeId);
      const showUnassigned = params[0] === 'unassigned';

      main.innerHTML = `
        <h1>All tickets</h1>
        <p class="filters">
          <a href="#/all" class="${showUnassigned ? '' : 'active'}">All (${everything.length})</a>
          <a href="#/all/unassigned" class="${showUnassigned ? 'active' : ''}">Unassigned (${unassigned.length})</a>
        </p>` + table(
        showUnassigned ? unassigned : everything,
        [COLUMNS.id, COLUMNS.subject, COLUMNS.category, COLUMNS.student, COLUMNS.status, COLUMNS.assignEdit, COLUMNS.updated],
        showUnassigned ? 'Every ticket has an owner.' : 'No tickets yet.'
      );
      wireControls(main);
    },
  });

  function canSee(user, t) {
    if (user.role === 'manager') return true;
    if (user.role === 'student') return t.studentId === user.id;
    return t.assigneeId === user.id;
  }

  App.addView({
    id: 'ticket',
    hidden: true,
    roles: ['student', 'agent', 'manager'],
    render(main, [id], user) {
      const t = Store.getTicket(id);
      if (!t || !canSee(user, t)) {
        main.innerHTML = '<p class="empty">This ticket does not exist or you do not have access to it.</p>';
        return;
      }

      main.innerHTML = `
        <p class="crumb"><a href="#/">&larr; Back</a></p>
        <h1><span class="muted">${t.id}</span> ${App.esc(t.subject)}</h1>
        <div class="card">
          <dl class="meta">
            <div><dt>Status</dt><dd>${user.role === 'agent' ? statusSelect(t) : App.statusBadge(t.status)}</dd></div>
            <div><dt>Assigned to</dt><dd>${user.role === 'manager' ? assignSelect(t) : assigneeName(t)}</dd></div>
            <div><dt>Category</dt><dd>${App.esc(t.category)}</dd></div>
            <div><dt>Student</dt><dd>${App.esc(Store.user(t.studentId)?.name)}</dd></div>
            <div><dt>Created</dt><dd>${App.formatDate(t.createdAt)}</dd></div>
          </dl>
          <p class="description">${App.esc(t.description)}</p>
        </div>`;

      App.ticketPanels().forEach(panel => panel(main, t, user));
      wireControls(main);
    },
  });
})();
