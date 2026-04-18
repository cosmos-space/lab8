const Order = require('../models/Order');

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