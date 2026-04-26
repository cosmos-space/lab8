const Product = require('../models/Product');

exports.getAllProducts = async (req, res) => {
    try {
        const {
            search,
            category,
            sort,
            sortDir,
            priceMin,
            priceMax
        } = req.query;

        const filters = {
            search,
            category,
            sort,
            sortDir,
        };

        if (priceMin !== undefined) filters.priceMin = Number(priceMin);
        if (priceMax !== undefined) filters.priceMax = Number(priceMax);

        const products = await Product.getAll(filters);
        res.json(products);
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.getById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, stock_quantity } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const trimmedName = (name || '').trim();
        const trimmedDesc = (description || '').trim();

        // Basic emoji / non-ASCII check
        const hasEmojiOrNonAscii = (str) => /[^\x00-\x7F]/.test(str);

        if (!trimmedName) {
            return res.status(400).json({ error: 'Name is required' });
        }
        if (hasEmojiOrNonAscii(trimmedName)) {
            return res.status(400).json({ error: 'Name cannot contain emojis or non-ASCII characters' });
        }
        if (hasEmojiOrNonAscii(trimmedDesc)) {
            return res.status(400).json({ error: 'Description cannot contain emojis or non-ASCII characters' });
        }

        const numericPrice = Number(price);
        const numericStock = Number(stock_quantity);

        if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
            return res.status(400).json({ error: 'Price must be a positive number' });
        }
        if (!Number.isInteger(numericStock) || numericStock < 0) {
            return res.status(400).json({ error: 'Stock quantity must be a non-negative integer' });
        }

        const productId = await Product.create(
            trimmedName,
            trimmedDesc,
            numericPrice,
            numericStock,
            imageUrl
        );

        res.status(201).json({ message: 'Product created', productId });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const deleted = await Product.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateStock = async (req, res) => {
    try {
        const id = req.params.id;
        const { stock_quantity } = req.body;

        const numericStock = Number(stock_quantity);
        if (!Number.isInteger(numericStock) || numericStock < 0) {
            return res.status(400).json({ error: 'Stock quantity must be a non-negative integer' });
        }

        const updated = await Product.updateStock(id, numericStock);
        if (!updated) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (numericStock === 0) {
            const OrderModel = require('../models/Order');
            await OrderModel.cancelUnconfirmedOrdersForProduct(id);
        }

        res.json({ message: 'Stock updated' });
    } catch (error) {
        console.error('Update stock error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};