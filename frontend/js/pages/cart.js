function addToCart(product) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-count');
    if (badge) badge.textContent = count;
}

function renderCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const list = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    const emptyMessage = document.getElementById('empty-cart-message');

    if (!list || !totalEl || !emptyMessage) return;

    list.innerHTML = '';

    if (cart.length === 0) {
        emptyMessage.classList.remove('hidden');
        totalEl.textContent = '$0.00';
        return;
    }

    emptyMessage.classList.add('hidden');
    let total = 0;

    cart.forEach((item) => {
        const row = document.createElement('div');
        row.className = 'cart-item';
        const name = document.createElement('span');
        name.textContent = item.name;
        const qty = document.createElement('span');
        qty.textContent = `x${item.quantity}`;
        const price = document.createElement('span');
        const itemTotal = (item.price * item.quantity) / 100;
        total += itemTotal;
        price.textContent = `$${itemTotal.toFixed(2)}`;
        row.append(name, qty, price);
        list.appendChild(row);
    });

    totalEl.textContent = `$${total.toFixed(2)}`;
}

async function handleCheckout() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (cart.length === 0) {
        alert('Your cart is empty.');
        return;
    }

    try {
        await api.request('/orders/checkout', 'POST', {
            items: cart,
            total_amount: total
        });
        alert('Order placed!');
        localStorage.removeItem('cart');
        updateCartCount();
        renderCart();
        window.location.href = 'index.html';
    } catch (err) {
        alert('Checkout failed: ' + err.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    renderCart();
    const checkoutButton = document.getElementById('checkout-button');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', handleCheckout);
    }
});

window.addToCart = addToCart;
window.handleCheckout = handleCheckout;
