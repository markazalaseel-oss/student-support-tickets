// Feature 1: Ticket submission (Jira epic "Ticket Submission")
App.addView({
  id: 'submit',
  label: 'New ticket',
  roles: ['student'],
  render(main, params, user) {
    main.innerHTML = `
      <h1>Submit a support ticket</h1>
      <form class="card form" novalidate>
        <label>Subject
          <input name="subject" maxlength="120" required>
        </label>
        <label>Category
          <select name="category" required>
            <option value="">Choose a category</option>
            ${Store.CATEGORIES.map(c => `<option>${App.esc(c)}</option>`).join('')}
          </select>
        </label>
        <label>Description
          <textarea name="description" rows="6" required></textarea>
        </label>
        <p class="error" hidden></p>
        <button type="submit">Submit ticket</button>
      </form>
      <div class="confirmation"></div>`;

    const form = main.querySelector('form');
    const error = main.querySelector('.error');

    form.addEventListener('submit', event => {
      event.preventDefault();
      const subject = form.elements.subject.value.trim();
      const category = form.elements.category.value;
      const description = form.elements.description.value.trim();

      if (!subject || !category || !description) {
        error.textContent = 'Please fill in the subject, category and description.';
        error.hidden = false;
        return;
      }

      const ticket = Store.createTicket({ subject, description, category, studentId: user.id });
      form.reset();
      error.hidden = true;

      const link = App.hasView('ticket') ? ` <a href="#/ticket/${ticket.id}">View ticket</a>` : '';
      main.querySelector('.confirmation').innerHTML = `
        <div class="notice success" role="status">
          Your ticket was created. Ticket ID: <strong>${ticket.id}</strong>.
          Keep this ID to follow up on your request.${link}
        </div>`;
    });
  },
});
