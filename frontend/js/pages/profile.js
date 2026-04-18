document.addEventListener('DOMContentLoaded', async () => {
    // Ensure logged in on client side
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (!storedUser) {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('profile-username').textContent = storedUser.username;
    document.getElementById('profile-email').textContent = storedUser.email;

    // Load order history
    try {
        const orders = await api.request('/orders/my', 'GET');
        const tbody = document.getElementById('order-table-body');
        tbody.innerHTML = '';

        if (!orders.length) {
            tbody.innerHTML = '<tr><td colspan="4">No orders yet.</td></tr>';
            return;
        }

        for (const order of orders) {
            const itemsText = (order.items || [])
                .map(i => `${i.product_name} (x${i.quantity})`)
                .join(', ');

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${new Date(order.created_at).toLocaleString()}</td>
                <td>${order.status}</td>
                <td>${itemsText}</td>
                <td>$${Number(order.total_amount).toFixed(2)}</td>
            `;
            tbody.appendChild(tr);
        }
    } catch (err) {
        console.error(err);
        showModal('Error', 'Could not load order history', true);
    }

    // Logout
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await api.request('/auth/logout', 'POST', {});
            } catch (_) {}
            localStorage.removeItem('user');
            showModal('Logged out', 'You have been logged out.');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 800);
        });
    }

    // Update cart badge
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
});
