document.addEventListener('DOMContentLoaded', async () => {
    // Client-side admin guard
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user || user.role !== 'admin') {
        showModal('Access denied', 'Admin only.', 'error');
        setTimeout(() => { window.location.href = 'login.html'; }, 800);
        return;
    }

    // Left sidebar tab switching
    const navLinks = document.querySelectorAll('.admin-nav-link');
    const sections = document.querySelectorAll('.admin-section');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const targetSection = link.dataset.section;
            
            // Update nav links
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Update sections
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `admin-section-${targetSection}`) {
                    section.classList.add('active');
                }
            });

            // Load archived data when archived tab is clicked
            if (targetSection === 'archived') {
                loadArchivedUsers();
                loadArchivedProducts();
                loadArchivedOrders();
            }
        });
    });

    // Logout
    document.getElementById('admin-logout-btn')?.addEventListener('click', () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });

    // Product form
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(productForm);
            try {
                await api.request('/products', 'POST', formData, true);
                showModal('Success', 'Product added successfully', 'success');
                productForm.reset();
                await loadProducts();
            } catch (err) {
                showModal('Error', err.message, true);
            }
        });
    }

    // User form
    const userForm = document.getElementById('admin-user-form');
    if (userForm) {
        userForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(userForm);
            const data = Object.fromEntries(formData.entries());
            try {
                await api.request('/users', 'POST', data);
                showModal('Success', 'User created successfully', 'success');
                userForm.reset();
                await loadUsers();
            } catch (err) {
                showModal('Error', err.message, true);
            }
        });
    }

    // Pagination helper
    function paginate(items, page, perPage) {
        const start = (page - 1) * perPage;
        const end = start + perPage;
        return {
            items: items.slice(start, end),
            totalPages: Math.ceil(items.length / perPage)
        };
    }

    // Render pagination
    function renderPagination(containerId, currentPage, totalPages, render) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        if (totalPages <= 1) return;

        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.className = i === currentPage ? 'active' : '';
            btn.onclick = () => render(i);
            container.appendChild(btn);
        }
    }

    // Load users
    async function loadUsers() {
        try {
            const allUsers = await api.request('/users', 'GET');
            const tbody = document.getElementById('user-table-body');
            const searchInput = document.getElementById('user-search');
            if (!tbody) return;

            let filtered = allUsers;
            let currentPage = 1;
            const perPage = 15;

            function render(page = 1) {
                const term = (searchInput?.value || '').toLowerCase().trim();
                filtered = allUsers.filter(u =>
                    !term ||
                    u.username.toLowerCase().includes(term) ||
                    u.email.toLowerCase().includes(term) ||
                    String(u.id).includes(term)
                );

                const { items, totalPages } = paginate(filtered, page, perPage);
                currentPage = page;

                tbody.innerHTML = '';
                items.forEach(u => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${u.id}</td>
                        <td>${u.username}</td>
                        <td>${u.email}</td>
                        <td>
                            <select class="user-role-select" data-id="${u.id}">
                                <option value="user" ${u.role === 'user' ? 'selected' : ''}>user</option>
                                <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>admin</option>
                            </select>
                        </td>
                        <td><button class="btn-delete-user" data-id="${u.id}">Delete</button></td>
                    `;
                    tbody.appendChild(row);
                });

                // Role change
                tbody.querySelectorAll('.user-role-select').forEach(sel => {
                    sel.addEventListener('change', async () => {
                        const id = sel.dataset.id;
                        const newRole = sel.value;
                        try {
                            await api.request(`/users/${id}/role`, 'PUT', { role: newRole });
                            showModal('Role updated', `User #${id} is now ${newRole}.`);
                        } catch (err) {
                            showModal('Error', err.message, true);
                        }
                    });
                });

                // Delete
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

                renderPagination('user-pagination', currentPage, totalPages, render);
            }

            if (searchInput) {
                searchInput.addEventListener('input', () => render(1));
            }

            render(1);
        } catch (error) {
            console.error('Failed to load users:', error);
            showModal('Error', 'Failed to load users', true);
        }
    }

    // Load products
    async function loadProducts() {
        try {
            const allProducts = await api.request('/products', 'GET');
            const tbody = document.getElementById('product-table-body');
            const searchInput = document.getElementById('product-search');
            if (!tbody) return;

            let filtered = allProducts;
            let currentPage = 1;
            const perPage = 15;

            function render(page = 1) {
                const term = (searchInput?.value || '').toLowerCase().trim();
                filtered = allProducts.filter(p =>
                    !term ||
                    p.name.toLowerCase().includes(term) ||
                    String(p.id).includes(term) ||
                    String(p.price).includes(term)
                );

                const { items, totalPages } = paginate(filtered, page, perPage);
                currentPage = page;

                tbody.innerHTML = '';
                items.forEach(p => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${p.id}</td>
                        <td>${p.name}</td>
                        <td>$${(Number(p.price)).toFixed(2)}</td>
                        <td>
                            <input type="number" min="0" value="${p.stock_quantity}" 
                                   class="stock-input" data-id="${p.id}" style="width:80px;">
                            <button class="btn-save-stock" data-id="${p.id}">Save</button>
                        </td>
                        <td><button class="btn-delete-product" data-id="${p.id}">Delete</button></td>
                    `;
                    tbody.appendChild(row);
                });

                // Delete product
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

                // Save stock
                tbody.querySelectorAll('.btn-save-stock').forEach(btn => {
                    btn.addEventListener('click', async () => {
                        const id = btn.dataset.id;
                        const input = tbody.querySelector(`.stock-input[data-id="${id}"]`);
                        const value = Number(input.value);

                        if (!Number.isInteger(value) || value < 0) {
                            showModal('Invalid stock', 'Stock must be a non-negative integer.', true);
                            return;
                        }

                        try {
                            await api.request(`/products/${id}/stock`, 'PUT', { stock_quantity: value });
                            showModal('Stock updated', 'Product stock has been updated.', 'success');
                        } catch (err) {
                            showModal('Error', err.message, true);
                        }
                    });
                });

                renderPagination('product-pagination', currentPage, totalPages, render);
            }

            if (searchInput) {
                searchInput.addEventListener('input', () => render(1));
            }

            render(1);
        } catch (err) {
            console.error('Failed to load products:', err);
            showModal('Error', 'Failed to load products', true);
        }
    }

    // Load orders
    async function loadOrders() {
        try {
            const allOrders = await api.request('/orders', 'GET');
            const tbody = document.getElementById('order-table-body');
            const searchInput = document.getElementById('order-search');
            if (!tbody) return;

            let filtered = allOrders;
            let currentPage = 1;
            const perPage = 15;

            function render(page = 1) {
                const term = (searchInput?.value || '').toLowerCase().trim();
                filtered = allOrders.filter(o =>
                    !term ||
                    String(o.id).includes(term) ||
                    (o.username && o.username.toLowerCase().includes(term)) ||
                    (o.email && o.email.toLowerCase().includes(term)) ||
                    (o.status && o.status.toLowerCase().includes(term))
                );

                const { items, totalPages } = paginate(filtered, page, perPage);
                currentPage = page;

                tbody.innerHTML = '';
                items.forEach(o => {
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

                // Status change
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

                renderPagination('order-pagination', currentPage, totalPages, render);
            }

            if (searchInput) {
                searchInput.addEventListener('input', () => render(1));
            }

            render(1);
        } catch (err) {
            console.error('Failed to load orders:', err);
            showModal('Error', 'Failed to load orders', true);
        }
    }

    // Archived data loading functions
    async function loadArchivedUsers() {
        try {
            const users = await api.request('/users/archived', 'GET');
            const tbody = document.getElementById('archived-user-table');

            tbody.innerHTML = '';

            users.forEach(u => {
                const tr = document.createElement('tr');

                tr.innerHTML = `
                    <td>${u.id}</td>
                    <td>${u.username}</td>
                    <td>${u.email}</td>
                    <td>${u.role}</td>
                    <td>
                        <button data-id="${u.id}" class="delete-user">
                            Delete permanently
                        </button>
                    </td>
                `;

                tbody.appendChild(tr);
            });

            document.querySelectorAll('.delete-user').forEach(btn => {
                btn.onclick = async () => {
                    if (!confirm('Permanent delete?')) return;

                    try {
                        await api.request(`/users/${btn.dataset.id}/hard`, 'DELETE');
                        await loadArchivedUsers();
                        showModal('Success', 'User permanently deleted', 'success');
                    } catch (err) {
                        showModal('Error', err.message, true);
                    }
                };
            });
        } catch (err) {
            console.error('Failed to load archived users:', err);
            showModal('Error', 'Failed to load archived users', true);
        }
    }

    async function loadArchivedProducts() {
        try {
            const products = await api.request('/products/archived', 'GET');
            const tbody = document.getElementById('archived-product-table');

            tbody.innerHTML = '';

            products.forEach(p => {
                const tr = document.createElement('tr');

                tr.innerHTML = `
                    <td>${p.id}</td>
                    <td>${p.name}</td>
                    <td>$${p.price}</td>
                    <td>${p.stock_quantity}</td>
                    <td>
                        <button data-id="${p.id}" class="delete-product">
                            Delete permanently
                        </button>
                    </td>
                `;

                tbody.appendChild(tr);
            });

            document.querySelectorAll('.delete-product').forEach(btn => {
                btn.onclick = async () => {
                    if (!confirm('Permanent delete?')) return;

                    try {
                        await api.request(`/products/${btn.dataset.id}/hard`, 'DELETE');
                        await loadArchivedProducts();
                        showModal('Success', 'Product permanently deleted', 'success');
                    } catch (err) {
                        showModal('Error', err.message, true);
                    }
                };
            });
        } catch (err) {
            console.error('Failed to load archived products:', err);
            showModal('Error', 'Failed to load archived products', true);
        }
    }

    async function loadArchivedOrders() {
        try {
            const orders = await api.request('/orders/archived', 'GET');
            const tbody = document.getElementById('archived-order-table');

            tbody.innerHTML = '';

            orders.forEach(o => {
                const tr = document.createElement('tr');

                tr.innerHTML = `
                    <td>${o.id}</td>
                    <td>$${o.total_amount}</td>
                    <td>${o.status}</td>
                    <td>${new Date(o.created_at).toLocaleDateString()}</td>
                    <td>
                        <button data-id="${o.id}" class="delete-order">
                            Delete permanently
                        </button>
                    </td>
                `;

                tbody.appendChild(tr);
            });

            document.querySelectorAll('.delete-order').forEach(btn => {
                btn.onclick = async () => {
                    if (!confirm('Permanent delete?')) return;

                    try {
                        await api.request(`/orders/${btn.dataset.id}/hard`, 'DELETE');
                        await loadArchivedOrders();
                        showModal('Success', 'Order permanently deleted', 'success');
                    } catch (err) {
                        showModal('Error', err.message, true);
                    }
                };
            });
        } catch (err) {
            console.error('Failed to load archived orders:', err);
            showModal('Error', 'Failed to load archived orders', true);
        }
    }

    await Promise.all([loadUsers(), loadProducts(), loadOrders()]);
});
