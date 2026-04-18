const Product = require('../models/Product');

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.getAll();
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

        if (!name || !price) {
            return res.status(400).json({ error: 'Name and price are required' });
        }

        const productId = await Product.create(
            name,
            description || '',
            Number(price),
            Number(stock_quantity) || 0,
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