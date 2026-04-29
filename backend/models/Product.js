const db = require('../config/db');

class Product {
    static async getAll(filters = {}) {
        const {
            search,
            category,
            sort = 'name',
            sortDir = 'asc',
            priceMin,
            priceMax
        } = filters;

        const whereParts = [];
        const params = [];

        // Always filter out deleted products
        whereParts.push('is_deleted = 0');

        if (search) {
            whereParts.push('name LIKE ?');
            params.push(`%${search}%`);
        }
        if (category) {
            whereParts.push('category LIKE ?');
            params.push(`%${category}%`);
        }
        if (priceMin !== undefined) {
            whereParts.push('price >= ?');
            params.push(priceMin);
        }
        if (priceMax !== undefined) {
            whereParts.push('price <= ?');
            params.push(priceMax);
        }

        let whereClause = '';
        if (whereParts.length > 0) {
            whereClause = 'WHERE ' + whereParts.join(' AND ');
        }

        const sortMap = { name: 'name', date: 'created_at', price: 'price' };
        const sortCol = sortMap[sort] || 'name';
        const direction = sortDir === 'desc' ? 'DESC' : 'ASC';

        const sql = `SELECT * FROM products ${whereClause} ORDER BY ${sortCol} ${direction}`;
        const [rows] = await db.execute(sql, params);
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.execute('SELECT * FROM products WHERE id = ? AND is_deleted = 0', [id]);
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
        const [result] = await db.execute('UPDATE products SET is_deleted = 1 WHERE id = ?', [id]);
        return result.affectedRows;
    }

    static async updateStock(id, stock) {
        const [result] = await db.execute(
            'UPDATE products SET stock_quantity = ? WHERE id = ?',
            [stock, id]
        );
        return result.affectedRows;
    }

    static async getArchivedProducts() {
        const [rows] = await db.execute('SELECT id, name, price, stock_quantity, created_at FROM products WHERE is_deleted = 1 ORDER BY created_at DESC');
        return rows;
    }

    static async hardDelete(id) {
        const [result] = await db.execute('DELETE FROM products WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = Product;