const db = require('../config/db');

class Order {
    static async createOrder(userId, totalAmount) {
        const [result] = await db.execute(
            'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
            [userId, totalAmount, 'Pending']
        );
        return result.insertId;
    }

    static async createOrderItem(orderId, productId, quantity, priceAtPurchase) {
        await db.execute(
            'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
            [orderId, productId, quantity, priceAtPurchase]
        );
    }

    static async updateStatus(orderId, status) {
        const [result] = await db.execute(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, orderId]
        );
        return result.affectedRows;
    }

    static async getOrdersByUser(userId) {
        const [orders] = await db.execute(
            'SELECT id, total_amount, status, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        return orders;
    }

    static async getOrderItems(orderId) {
        const [items] = await db.execute(
            `SELECT oi.product_id, oi.quantity, oi.price_at_purchase, p.name AS product_name
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = ?`,
            [orderId]
        );
        return items;
    }

    static async cancelUnconfirmedOrdersForProduct(productId) {
        // Cancel orders with this product that are not completed/cancelled
        const [rows] = await db.execute(
            `SELECT DISTINCT o.id
             FROM orders o
             JOIN order_items oi ON oi.order_id = o.id
             WHERE oi.product_id = ? AND o.status = 'Pending'`,
            [productId]
        );
        const ids = rows.map(r => r.id);
        if (!ids.length) return;
        await db.execute(
            `UPDATE orders SET status = 'Cancelled' WHERE id IN (${ids.map(() => '?').join(',')})`,
            ids
        );
    }
}

module.exports = Order;