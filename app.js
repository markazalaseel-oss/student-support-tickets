// App shell: who is signed in, the navigation bar, and a small hash router.
// Each feature file registers its own screens with App.addView(), so a feature
// can be added or removed by including or dropping its <script> tag.
const App = (() => {
  const USER_KEY = 'sst-current-user';
  const ROLE_LABELS = { student: 'Student', agent: 'Support agent', manager: 'Support manager' };
  const views = [];
  const ticketPanels = []; // extra sections other features add to the ticket page

  function addView(view) {
    views.push(view);
  }

  function addTicketPanel(panel) {
    ticketPanels.push(panel);
  }

  function hasView(id) {
    return views.some(v => v.id === id);
  }

  function currentUser() {
    return Store.user(localStorage.getItem(USER_KEY)) || Store.USERS[0];
  }

  function render() {
    const user = currentUser();
    const [id, ...params] = location.hash.replace(/^#\/?/, '').split('/');
    const available = views.filter(v => v.roles.includes(user.role));
    const view = available.find(v => v.id === id) || available.find(v => !v.hidden);

    document.getElementById('nav').innerHTML = available
      .filter(v => !v.hidden)
      .map(v => `<a href="#/${v.id}" class="${v === view ? 'active' : ''}">${v.label}</a>`)
      .join('');

    // A fresh container each time, so event listeners from the previous screen go away with it.
    const section = document.createElement('section');
    document.getElementById('main').replaceChildren(section);
    if (view) view.render(section, params, user);
    else section.innerHTML = '<p class="empty">Nothing here for this role yet.</p>';
  }

  function esc(value) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(value ?? '').replace(/[&<>"']/g, c => map[c]);
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
  }

  function statusBadge(status) {
    return `<span class="badge badge-${status.toLowerCase().replace(' ', '-')}">${status}</span>`;
  }

  function roleLabel(role) {
    return ROLE_LABELS[role] || '';
  }

  function start() {
    const select = document.getElementById('user-select');
    select.innerHTML = Store.USERS
      .map(u => `<option value="${u.id}">${esc(u.name)} (${roleLabel(u.role)})</option>`)
      .join('');
    select.value = currentUser().id;
    select.addEventListener('change', () => {
      localStorage.setItem(USER_KEY, select.value);
      location.hash = '#/'; // land on the new role's home screen
      render();
    });

    document.getElementById('reset').addEventListener('click', () => {
      if (confirm('Delete all demo tickets?')) {
        Store.reset();
        render();
      }
    });

    window.addEventListener('hashchange', render);
    render();
  }

  document.addEventListener('DOMContentLoaded', start);

  return { addView, addTicketPanel, hasView, ticketPanels: () => ticketPanels, render, esc, formatDate, statusBadge, roleLabel };
})();
