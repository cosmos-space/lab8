function buildQuery(params) {
    const usp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
            usp.append(k, v);
        }
    });
    return `?${usp.toString()}`;
}

async function loadProducts(filters = {}) {
    console.log('Loading products...');
    try {
        const products = await api.request(`/products${buildQuery(filters)}`);
        console.log('Products received:', products);
        const grid = document.getElementById('product-grid');
        if (!grid) {
            console.error('Product grid not found');
            return;
        }

        // Always clear previous cards before rendering new ones
        grid.innerHTML = '';

        if (!products || products.length === 0) {
            const msg = document.createElement('p');
            msg.className = 'empty-message';
            msg.textContent = 'No products found.';
            grid.appendChild(msg);
            return;
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';

            // Clickable area for product view
            const viewLink = document.createElement('a');
            viewLink.href = `product.html?id=${product.id}`;
            viewLink.style.textDecoration = 'none';
            viewLink.style.color = 'inherit';

            if (product.image_url) {
                const imgWrapper = document.createElement('div');
                imgWrapper.className = 'product-image-wrapper';

                const img = document.createElement('img');
                img.className = 'product-image';
                img.src = product.image_url;
                img.alt = product.name;

                imgWrapper.appendChild(img);
                viewLink.appendChild(imgWrapper);
            }

            const title = document.createElement('h3');
            title.textContent = product.name;
            viewLink.appendChild(title);

            card.appendChild(viewLink);

            const price = document.createElement('p');
            price.textContent = `$${ Number(product.price).toFixed(2) }`; 

            const btn = document.createElement('button');
            btn.textContent = 'Add to Cart';
            btn.addEventListener('click', () => addToCart(product));

            card.append(price, btn);
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Could not load products:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('product-filters');
    const advToggle = document.getElementById('search-advanced-toggle');
    const advSection = document.getElementById('search-advanced');

    if (advToggle && advSection) {
        advToggle.addEventListener('click', () => {
            advSection.classList.toggle('hidden');
        });
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const rawSearch = form.search.value.trim();
            const field = form.field.value;

            const filters = {
                sort: form.sort.value,
                sortDir: form.sortDir.value,
            };

            // Route search into appropriate field(s)
            if (rawSearch) {
                if (field === 'name') {
                    filters.search = rawSearch;
                } else if (field === 'category') {
                    filters.category = rawSearch;
                } else {
                    // "all": send as name search for now (you could extend to more fields later)
                    filters.search = rawSearch;
                }
            }

            loadProducts(filters);
        });
    }

    loadProducts();
});
