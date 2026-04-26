const Order = require('../models/Order');

exports.getMyOrders = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const orders = await Order.getOrdersByUser(userId);
        const withItems = [];
        for (const order of orders) {
            const items = await Order.getOrderItems(order.id);
            withItems.push({ ...order, items });
        }
        res.json(withItems);
    } catch (error) {
        console.error('Get my orders error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAll = async (req, res) => {
    try {
        const db = require('../config/db');
        const [rows] = await db.execute(
            `SELECT o.id, o.total_amount, o.status, o.created_at,
                    u.username, u.email
             FROM orders o
             JOIN users u ON o.user_id = u.id
             ORDER BY o.created_at DESC`
        );
        res.json(rows);
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.checkout = async (req, res) => {
    try {
        const { items, total_amount } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Cart cannot be empty' });
        }

        // total_amount comes in as dollars
        const numericTotal = Number(total_amount);
        if (!Number.isFinite(numericTotal) || numericTotal <= 0) {
            return res.status(400).json({ error: 'Invalid total amount' });
        }

        const orderId = await Order.createOrder(userId, numericTotal);
        for (const item of items) {
            const priceAtPurchase = Number(item.price);
            await Order.createOrderItem(orderId, item.id, item.quantity, priceAtPurchase);
        }

        // Stock is NOT subtracted here; it will be adjusted when admin marks order as Completed.

        res.status(201).json({ message: 'Order placed successfully', orderId });
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        // Fetch current status to avoid double-applying stock
        const db = require('../config/db');
        const [rows] = await db.execute('SELECT status FROM orders WHERE id = ?', [orderId]);
        const existing = rows[0];
        if (!existing) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const prevStatus = existing.status;

        await Order.updateStatus(orderId, status);

        // When marking Completed for the first time, subtract stock for items
        if (status === 'Completed' && prevStatus !== 'Completed') {
            const Product = require('../models/Product');
            const items = await Order.getOrderItems(orderId);
            for (const item of items) {
                try {
                    const product = await Product.getById(item.product_id);
                    if (!product) continue;

                    const currentStock = Number(product.stock_quantity);
                    const delta = Number(item.quantity);
                    if (!Number.isFinite(currentStock) || !Number.isFinite(delta)) continue;

                    const newStock = Math.max(0, currentStock - delta);
                    await Product.updateStock(product.id, newStock);

                    // If stock hits zero, cancel other pending orders containing this product
                    if (newStock === 0) {
                        await Order.cancelUnconfirmedOrdersForProduct(product.id);
                    }
                } catch (e) {
                    console.error('Update status: stock update error for order', orderId, 'item', item, e);
                }
            }
        }

        res.json({ message: 'Order status updated' });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteMyOrder = async (req, res) => {
    try {
        const userId = req.user?.id;
        const orderId = req.params.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const db = require('../config/db');
        const [rows] = await db.execute('SELECT user_id FROM orders WHERE id = ?', [orderId]);
        const order = rows[0];
        if (!order || order.user_id !== userId) {
            return res.status(404).json({ error: 'Order not found' });
        }

        await db.execute('DELETE FROM order_items WHERE order_id = ?', [orderId]);
        await db.execute('DELETE FROM orders WHERE id = ?', [orderId]);
        res.json({ message: 'Order deleted' });
    } catch (error) {
        console.error('Delete my order error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};