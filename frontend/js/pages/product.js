document.addEventListener('DOMContentLoaded', async () => {
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) {
        showModal('Error', 'No product selected.', true);
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 800);
        return;
    }

    const backBtn = document.getElementById('product-back');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.history.back();
        });
    }

    const nameEl = document.getElementById('product-detail-name');
    const priceEl = document.getElementById('product-detail-price');
    const descEl = document.getElementById('product-detail-description');
    const imgWrap = document.getElementById('product-detail-image');
    const qtyInput = document.getElementById('product-detail-qty');
    const addBtn = document.getElementById('product-detail-add');

    try {
        const product = await api.request(`/products/public/${id}`, 'GET');

        nameEl.textContent = product.name;
        priceEl.textContent = `$${Number(product.price).toFixed(2)}`;
        descEl.textContent = product.description || '';

        imgWrap.innerHTML = '';
        if (product.image_url) {
            const img = document.createElement('img');
            img.className = 'product-image';
            img.src = product.image_url;
            img.alt = product.name;
            imgWrap.appendChild(img);
        }

        if (addBtn) {
            addBtn.addEventListener('click', () => {
                const quantity = Math.max(1, Number(qtyInput.value) || 1);
                const item = { ...product, quantity };
                // reuse global addToCart; it expects product without quantity and increments; here we call it multiple times
                for (let i = 0; i < quantity; i++) {
                    addToCart(product);
                }
            });
        }
    } catch (e) {
        console.error('Failed to load product', e);
        showModal('Error', 'Failed to load product.', true);
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 800);
    }
});
