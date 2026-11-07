// Feature 3: Communication thread (Jira epic "Communication Thread")
App.addTicketPanel((main, ticket, user) => {
  const comments = ticket.comments || [];
  const section = document.createElement('section');
  section.className = 'card thread';

  const list = comments.length
    ? `<ol class="comments">${comments.map(c => {
        const author = Store.user(c.authorId);
        const side = author?.role === 'student' ? 'from-student' : 'from-staff';
        return `<li class="comment ${side}">
          <div class="comment-head">
            <strong>${App.esc(author?.name)}</strong>
            <span class="muted">${App.roleLabel(author?.role)} &middot; ${App.formatDate(c.at)}</span>
          </div>
          <p>${App.esc(c.text)}</p>
        </li>`;
      }).join('')}</ol>`
    : '<p class="empty">No messages yet.</p>';

  const form = ticket.status === 'Closed'
    ? '<p class="muted">This ticket is closed, so no new messages can be added.</p>'
    : `<form class="reply">
        <label for="reply-text">Add a message</label>
        <textarea id="reply-text" name="text" rows="3" required></textarea>
        <button type="submit">Send</button>
      </form>`;

  section.innerHTML = `<h2>Conversation</h2>${list}${form}`;

  section.querySelector('form')?.addEventListener('submit', event => {
    event.preventDefault();
    const text = event.target.elements.text.value.trim();
    if (!text) return;
    const latest = Store.getTicket(ticket.id);
    Store.updateTicket(ticket.id, {
      comments: [...(latest.comments || []), { authorId: user.id, text, at: new Date().toISOString() }],
    });
    App.render();
  });

  main.append(section);
});
