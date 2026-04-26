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

        orders.forEach(order => {
            const itemsSummary = (order.items || [])
                .map(i => `${i.product_name} x${i.quantity}`)
                .join(', ');

            let actionHtml = '';
            if (order.status === 'Pending') {
                actionHtml = `<button class="btn-cancel-order" data-id="${order.id}">Cancel</button>`;
            } else if (order.status === 'Completed') {
                actionHtml = `<button class="btn-received-order" data-id="${order.id}">Order received</button>`;
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${new Date(order.created_at).toLocaleString()}</td>
                <td>${order.status}</td>
                <td>${itemsSummary}</td>
                <td>$${Number(order.total_amount).toFixed(2)}</td>
                <td>${actionHtml}</td>
            `;
            tbody.appendChild(tr);
        });

        // Cancel pending order
        tbody.querySelectorAll('.btn-cancel-order').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                if (!confirm('Cancel this order?')) return;
                try {
                    await api.request(`/orders/my/${id}`, 'DELETE');
                    showModal('Order cancelled', 'Your order has been cancelled.');
                    location.reload();
                } catch (err) {
                    showModal('Error', err.message, true);
                }
            });
        });

        // Order received – remove completed order from list
        tbody.querySelectorAll('.btn-received-order').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                if (!confirm('Mark this order as received and remove it from your history?')) return;
                try {
                    await api.request(`/orders/my/${id}`, 'DELETE');
                    showModal('Order received', 'Order has been removed from your history.');
                    location.reload();
                } catch (err) {
                    showModal('Error', err.message, true);
                }
            });
        });
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
