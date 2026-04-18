document.addEventListener('DOMContentLoaded', async () => {
    // Client-side admin guard
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user || user.role !== 'admin') {
        showModal('Access denied', 'Admin only.', true);
        setTimeout(() => { window.location.href = 'login.html'; }, 800);
        return;
    }

    // Add product
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(productForm);
            try {
                await api.request('/products', 'POST', formData);
                showModal('Product added', 'Product created successfully.');
                productForm.reset();
                await loadProducts();
            } catch (err) {
                showModal('Error', err.message, true);
            }
        });
    }

    async function loadUsers() {
        try {
            const users = await api.request('/users', 'GET');
            const tbody = document.getElementById('user-table-body');
            if (!tbody) return;
            tbody.innerHTML = '';

            users.forEach(u => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${u.id}</td>
                    <td>${u.username}</td>
                    <td>${u.email}</td>
                    <td>${u.role}</td>
                    <td><button class="btn-delete-user" data-id="${u.id}">Delete</button></td>
                `;
                tbody.appendChild(row);
            });

            tbody.querySelectorAll('.btn-delete-user').forEach(btn => {
                btn.addEventListener('click', async () => {
                    if (!confirm('Delete this user?')) return;
                    try {
                        await api.request(`/users/${btn.dataset.id}`, 'DELETE');
                        showModal('User deleted', 'User has been removed.');
                        await loadUsers();
                    } catch (err) {
                        showModal('Error', err.message, true);
                    }
                });
            });
        } catch (error) {
            console.error('Failed to load users:', error);
            showModal('Error', 'Failed to load users', true);
        }
    }

    async function loadProducts() {
        try {
            const products = await api.request('/products', 'GET');
            const tbody = document.getElementById('product-table-body');
            if (!tbody) return;
            tbody.innerHTML = '';

            products.forEach(p => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${p.id}</td>
                    <td>${p.name}</td>
                    <td>$${(Number(p.price)).toFixed(2)}</td>
                    <td>${p.stock_quantity}</td>
                    <td><button class="btn-delete-product" data-id="${p.id}">Delete</button></td>
                `;
                tbody.appendChild(row);
            });

            tbody.querySelectorAll('.btn-delete-product').forEach(btn => {
                btn.addEventListener('click', async () => {
                    if (!confirm('Delete this product?')) return;
                    try {
                        await api.request(`/products/${btn.dataset.id}`, 'DELETE');
                        showModal('Product deleted', 'Product has been removed.');
                        await loadProducts();
                    } catch (err) {
                        showModal('Error', err.message, true);
                    }
                });
            });
        } catch (err) {
            console.error('Failed to load products:', err);
            showModal('Error', 'Failed to load products', true);
        }
    }

    async function loadOrders() {
        try {
            const orders = await api.request('/orders', 'GET');
            const tbody = document.getElementById('order-table-body');
            if (!tbody) return;
            tbody.innerHTML = '';

            orders.forEach(o => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${o.id}</td>
                    <td>${o.username}</td>
                    <td>${o.email}</td>
                    <td>
                        <select class="order-status-select" data-id="${o.id}">
                            <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Completed" ${o.status === 'Completed' ? 'selected' : ''}>Completed</option>
                            <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </td>
                    <td>$${Number(o.total_amount).toFixed(2)}</td>
                    <td>${new Date(o.created_at).toLocaleString()}</td>
                `;
                tbody.appendChild(row);
            });

            tbody.querySelectorAll('.order-status-select').forEach(sel => {
                sel.addEventListener('change', async () => {
                    const orderId = sel.dataset.id;
                    const newStatus = sel.value;
                    try {
                        await api.request(`/orders/${orderId}/status`, 'PUT', { status: newStatus });
                        showModal('Status updated', `Order #${orderId} set to ${newStatus}.`);
                    } catch (err) {
                        showModal('Error', err.message, true);
                    }
                });
            });
        } catch (err) {
            console.error('Failed to load orders:', err);
            showModal('Error', 'Failed to load orders', true);
        }
    }

    await Promise.all([loadUsers(), loadProducts(), loadOrders()]);
});