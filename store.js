// Data layer. Everything is kept in the browser's localStorage so the MVP runs
// without a server. Replacing these functions with API calls is the first step
// toward a real backend; nothing else in the app touches storage directly.
const Store = (() => {
  const KEY = 'sst-data';

  // Stands in for the university's staff directory (see project assumptions).
  const USERS = [
    { id: 's1', name: 'Ahmad Khalil', role: 'student' },
    { id: 's2', name: 'Lina Haddad', role: 'student' },
    { id: 'a1', name: 'Sara Nasser', role: 'agent' },
    { id: 'a2', name: 'Omar Saleh', role: 'agent' },
    { id: 'm1', name: 'Rami Aziz', role: 'manager' },
  ];

  const CATEGORIES = ['Technical', 'Registration', 'Exams & grades', 'Financial', 'Other'];
  const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];

  function read() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || { tickets: [], lastNumber: 0 };
    } catch {
      return { tickets: [], lastNumber: 0 };
    }
  }

  function write(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function createTicket({ subject, description, category, studentId }) {
    const data = read();
    data.lastNumber += 1;
    const now = new Date().toISOString();
    const ticket = {
      id: 'TKT-' + String(data.lastNumber).padStart(4, '0'),
      subject,
      description,
      category,
      studentId,
      status: 'Open',
      assigneeId: null,
      comments: [],
      createdAt: now,
      updatedAt: now,
    };
    data.tickets.push(ticket);
    write(data);
    return ticket;
  }

  function allTickets() {
    return read().tickets;
  }

  function getTicket(id) {
    return read().tickets.find(t => t.id === id) || null;
  }

  function updateTicket(id, changes) {
    const data = read();
    const ticket = data.tickets.find(t => t.id === id);
    if (!ticket) return null;
    Object.assign(ticket, changes, { updatedAt: new Date().toISOString() });
    write(data);
    return ticket;
  }

  function user(id) {
    return USERS.find(u => u.id === id) || null;
  }

  function reset() {
    localStorage.removeItem(KEY);
  }

  return { USERS, CATEGORIES, STATUSES, createTicket, allTickets, getTicket, updateTicket, user, reset };
})();
