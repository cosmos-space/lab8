const user = JSON.parse(localStorage.getItem('user'));

if (!user || user.role !== 'admin') {
    alert('Access Denied');
    window.location.href = 'index.html';
}

async function addProduct(event) {
    event.preventDefault();

    const nameInput = document.querySelector('#product-name');
    const priceInput = document.querySelector('#product-price');
    const descriptionInput = document.querySelector('#product-description');
    const stockInput = document.querySelector('#product-stock');
    const imageFileInput = document.querySelector('#product-image');

    const formData = new FormData();
    formData.append('name', nameInput.value);
    formData.append('price', priceInput.value);
    formData.append('description', descriptionInput.value);
    formData.append('stock_quantity', stockInput.value);
    formData.append('image', imageFileInput.files[0]);

    await api.request('/products', 'POST', formData);
    alert('Product added successfully');
    event.target.reset();
}

async function updateStatus(orderId, newStatus) {
    await api.request(`/orders/${orderId}/status`, 'PUT', { status: newStatus });
    alert('Status Updated');
}

function renderUsers(users) {
    const tbody = document.getElementById('user-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    users.forEach((user) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
        `;
        tbody.appendChild(row);
    });
}

async function loadUsers() {
    try {
        const users = await api.request('/users', 'GET');
        renderUsers(users);
    } catch (error) {
        console.error('Failed to load users:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', addProduct);
    }
    loadUsers();
});

window.updateStatus = updateStatus;