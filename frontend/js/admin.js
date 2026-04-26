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

    function showSection(sectionName) {
        sections.forEach(sec => {
            if (sec.id === `admin-section-${sectionName}`) {
                sec.classList.add('active');
            } else {
                sec.classList.remove('active');
            }
        });
        navLinks.forEach(btn => {
            if (btn.dataset.section === sectionName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    navLinks.forEach(btn => {
        btn.addEventListener('click', () => {
            showSection(btn.dataset.section);
        });
    });

    // Ensure default section is products
    showSection('products');

    // Admin logout button
    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await api.request('/auth/logout', 'POST');
            } catch (e) {
                console.error('Logout failed:', e);
            } finally {
                localStorage.removeItem('user');
                window.location.href = 'login.html';
            }
        });
    }

    // Simple client-side text sanitiser
    const hasEmojiOrNonAscii = (str) => /[^\x00-\x7F]/.test(str);
    const isBlank = (str) => !str || !str.trim();

    // Admin create user
    const adminUserForm = document.getElementById('admin-user-form');
    if (adminUserForm) {
        adminUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('admin-user-username').value;
            const email = document.getElementById('admin-user-email').value;
            const password = document.getElementById('admin-user-password').value;
            const role = document.getElementById('admin-user-role').value;

            if (isBlank(username) || username.trim().length < 3 || hasEmojiOrNonAscii(username)) {
                showModal('Invalid username', 'Username must be at least 3 ASCII characters.', true);
                return;
            }

            try {
                await api.request('/users', 'POST', {
                    username,
                    email,
                    password,
                    role
                });
                showModal('User created', 'New user has been registered.', 'success');
                adminUserForm.reset();
                await loadUsers();
            } catch (err) {
                showModal('Error', err.message, true);
            }
        });
    }

    // Add product
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const name = document.getElementById('product-name').value;
            const price = document.getElementById('product-price').value;
            const stock = document.getElementById('product-stock').value;

            if (isBlank(name) || hasEmojiOrNonAscii(name)) {
                showModal('Invalid name', 'Product name must be ASCII text and not empty.', true);
                return;
            }
            if (Number(price) <= 0) {
                showModal('Invalid price', 'Price must be a positive number.', true);
                return;
            }
            if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
                showModal('Invalid stock', 'Stock must be a non-negative integer.', true);
                return;
            }

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

    function paginate(items, page, perPage) {
        const total = items.length;
        const totalPages = Math.max(1, Math.ceil(total / perPage));
        const clampedPage = Math.min(Math.max(1, page), totalPages);
        const start = (clampedPage - 1) * perPage;
        const end = start + perPage;
        return {
            page: clampedPage,
            totalPages,
            items: items.slice(start, end)
        };
    }

    function renderPagination(containerId, page, totalPages, onChange) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';

        if (totalPages <= 1) return;

        const maxButtons = 5;
        let startPage = Math.max(1, page - Math.floor(maxButtons / 2));
        let endPage = startPage + maxButtons - 1;
        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxButtons + 1);
        }

        const prev = document.createElement('button');
        prev.textContent = '←';
        prev.disabled = page === 1;
        prev.addEventListener('click', () => onChange(page - 1));
        container.appendChild(prev);

        for (let p = startPage; p <= endPage; p++) {
            const btn = document.createElement('button');
            btn.textContent = String(p);
            if (p === page) {
                btn.disabled = true;
            }
            btn.addEventListener('click', () => onChange(p));
            container.appendChild(btn);
        }

        const next = document.createElement('button');
        next.textContent = '→';
        next.disabled = page === totalPages;
        next.addEventListener('click', () => onChange(page + 1));
        container.appendChild(next);
    }

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
                            await loadUsers(); // re-fetch
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

    await Promise.all([loadUsers(), loadProducts(), loadOrders()]);
});