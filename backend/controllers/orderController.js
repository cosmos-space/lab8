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

        const orderId = await Order.createOrder(userId, total_amount);
        for (const item of items) {
            await Order.createOrderItem(orderId, item.id, item.quantity, item.price / 100);
        }

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

        await Order.updateStatus(orderId, status);
        res.json({ message: 'Order status updated' });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}; 