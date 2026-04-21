const db = require('../config/db');

class Product {
    static async getAll() {
        const [rows] = await db.execute('SELECT * FROM products ORDER BY created_at DESC');
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.execute('SELECT * FROM products WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(name, description, price, stock_quantity, image_url) {
        const [result] = await db.execute(
            'INSERT INTO products (name, description, price, stock_quantity, image_url) VALUES (?, ?, ?, ?, ?)',
            [name, description, price, stock_quantity, image_url]
        );
        return result.insertId;
    }

    static async delete(id) {
        const [result] = await db.execute('DELETE FROM products WHERE id = ?', [id]);
        return result.affectedRows;
    }

    static async updateStock(id, stock) {
        const [result] = await db.execute(
            'UPDATE products SET stock_quantity = ? WHERE id = ?',
            [stock, id]
        );
        return result.affectedRows;
    }
}

module.exports = Product;