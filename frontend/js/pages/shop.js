async function loadProducts() {
    console.log('Loading products...');
    try {
        const products = await api.request('/products');
        console.log('Products received:', products);
        const grid = document.getElementById('product-grid');
        if (!grid) {
            console.error('Product grid not found');
            return;
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';

            const title = document.createElement('h3');
            title.textContent = product.name;

            const price = document.createElement('p');
            price.textContent = `$${ (Number(product.price) / 100).toFixed(2) }`; 

            const btn = document.createElement('button');
            btn.textContent = 'Add to Cart';
            btn.addEventListener('click', () => addToCart(product));

            card.append(title, price, btn);
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Could not load products:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadProducts);
