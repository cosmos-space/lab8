function showModal(title, message, type = 'info') {
    const modal = document.getElementById('global-modal');
    if (!modal) {
        console.warn('showModal: #global-modal not found');
        return;
    }

    const card = modal.querySelector('.modal-card');
    const titleEl = modal.querySelector('h3');
    const msgEl = modal.querySelector('p');

    if (!card || !titleEl || !msgEl) {
        console.warn('showModal: modal structure missing');
        return;
    }

    // Normalize type
    let t = type;
    if (type === true) t = 'error';
    if (type === false || type === undefined || type === null) t = 'info';

    // Reset type classes
    card.classList.remove('error', 'success', 'warning');

    if (t === 'error') {
        card.classList.add('error');
    } else if (t === 'success') {
        card.classList.add('success');
    } else if (t === 'warning') {
        card.classList.add('warning');
    }

    titleEl.textContent = title;
    msgEl.textContent = message;

    modal.classList.add('visible');

    const closeBtn = modal.querySelector('button');
    if (closeBtn && !closeBtn._bound) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('visible');
        });
        closeBtn._bound = true;
    }

    // Close on backdrop click
    const backdrop = modal.querySelector('.modal-backdrop');
    if (backdrop && !backdrop._bound) {
        backdrop.addEventListener('click', () => {
            modal.classList.remove('visible');
        });
        backdrop._bound = true;
    }
}
