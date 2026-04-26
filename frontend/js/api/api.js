const api = {
    async request(path, method = 'GET', body = null) {
        const options = {
            method,
            credentials: 'include',
            headers: {}
        };

        if (body instanceof FormData) {
            // Let browser set Content-Type for multipart
            options.body = body;
        } else if (body) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }

        const res = await fetch('/api' + path, options);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            throw new Error(data.error || data.message || `Request failed: ${res.status}`);
        }
        return data;
    }
};

// Global modal: success/error confirmation
function showModal(title, message, type = 'info') {
    let modal = document.getElementById('global-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'global-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-card">
                <h3 id="modal-title"></h3>
                <p id="modal-message"></p>
                <button id="modal-close">OK</button>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('modal-close').addEventListener('click', () => {
            modal.classList.remove('visible');
        });
        modal.querySelector('.modal-backdrop').addEventListener('click', () => {
            modal.classList.remove('visible');
        });
    }

    const card = modal.querySelector('.modal-card');
    // Reset type classes
    card.classList.remove('error', 'success', 'warning');

    if (type === true || type === 'error') {
        card.classList.add('error');
    } else if (type === 'success') {
        card.classList.add('success');
    } else if (type === 'warning') {
        card.classList.add('warning');
    }

    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-message').textContent = message;
    modal.classList.add('visible');
}

window.api = api;
window.showModal = showModal;