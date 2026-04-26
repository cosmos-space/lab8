function requireLoginForAction(actionName) {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
        showModal(
            'Login required',
            `You need to log in to ${actionName}.` 
        );
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 800);
        return false;
    }
    return true;
}

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
        return null;
    }
}

function getCartKey() {
    const user = getCurrentUser();
    return user ? `cart_${user.id}` : 'cart_guest';
}

function getCart() {
    const cartKey = getCartKey();
    const raw = localStorage.getItem(cartKey);
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error('Failed to parse cart for key', cartKey, 'resetting cart', e);
        return [];
    }
}

function addToCart(product) {
    if (!requireLoginForAction('add items to your cart')) return;

    const cartKey = getCartKey();
    const cart = getCart();
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem(cartKey, JSON.stringify(cart));
    updateCartCount();
    const cartItemsElement = document.getElementById('cart-items');
    if (cartItemsElement) {
        renderCart();
    }
}

function removeFromCart(productId) {
    const cartKey = getCartKey();
    const cart = getCart();
    const filtered = cart.filter(item => item.id !== productId);
    localStorage.setItem(cartKey, JSON.stringify(filtered));
    updateCartCount();
    renderCart();
}

function updateCartCount() {
    const cart = getCart();
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
    }
}

function renderCart() {
    const cart = getCart();
    const cartItemsElement = document.getElementById('cart-items');
    const emptyMessage = document.getElementById('empty-cart-message');
    const totalEl = document.getElementById('cart-total');

    if (!cartItemsElement || !emptyMessage || !totalEl) return;

    // Clear previous items
    cartItemsElement.innerHTML = '';

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

        // Image cell
        const imgContainer = document.createElement('div');
        imgContainer.className = 'cart-item-image';
        if (item.image_url) {
            const img = document.createElement('img');
            img.src = item.image_url;
            img.alt = item.name;
            imgContainer.appendChild(img);
        }

        // Name + qty
        const nameQty = document.createElement('span');
        nameQty.textContent = `${item.name} x${item.quantity}`;

        // Price
        const price = document.createElement('span');
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        price.textContent = `$${itemTotal.toFixed(2)}`;

        // Remove button
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', () => {
            removeFromCart(item.id);
        });

        row.append(imgContainer, nameQty, price, removeBtn);
        cartItemsElement.appendChild(row);
    });

    totalEl.textContent = `$${total.toFixed(2)}`;
}

async function handleCheckout() { 
    if (!requireLoginForAction('checkout')) return;

    const cartKey = getCartKey();
    const cart = getCart();
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (cart.length === 0) {
        showModal('Cart empty', 'Your cart is empty.');
        return;
    }

    try {
        await api.request('/orders/checkout', 'POST', {
            items: cart,
            total_amount: total
        });
        localStorage.removeItem(cartKey);
        updateCartCount();
        renderCart();
        showModal('Transaction complete', 'Your order has been placed!', 'success');
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 1000);
    } catch (err) {
        showModal('Checkout failed', err.message, true);
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
window.updateCartCount = updateCartCount;
window.removeFromCart = removeFromCart;
