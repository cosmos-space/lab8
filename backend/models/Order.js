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
}

module.exports = Order;