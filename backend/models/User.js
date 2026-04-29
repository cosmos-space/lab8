const db = require('../config/db');

class User {
    static async findByEmail(email) {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ? AND is_deleted = 0', [email]);
        return rows[0];
    }
    static async findById(id) {
        const [rows] = await db.execute('SELECT id, username, email, role, created_at FROM users WHERE id = ? AND is_deleted = 0', [id]);
        return rows[0];
    }
    static async create(username, email, password_hash, role = 'user') {
        const [result] = await db.execute(
            'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [username, email, password_hash, role]
        );
        return result.insertId;
    }
    static async getAll() {
        const [rows] = await db.execute('SELECT id, username, email, role, created_at FROM users WHERE is_deleted = 0 ORDER BY created_at DESC');
        return rows;
    }
    static async delete(id) {
        const [result] = await db.execute('UPDATE users SET is_deleted = 1 WHERE id = ?', [id]);
        return result.affectedRows;
    }
    static async updateById(id, updates) {
        const fields = [];
        const params = [];

        if (updates.username !== undefined) {
            fields.push('username = ?');
            params.push(updates.username);
        }
        if (updates.password_hash !== undefined) {
            fields.push('password_hash = ?');
            params.push(updates.password_hash);
        }
        if (updates.role !== undefined) {
            fields.push('role = ?');
            params.push(updates.role);
        }

        if (fields.length === 0) return 0;

        params.push(id);
        const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
        const [result] = await db.execute(sql, params);
        return result.affectedRows;
    }

    static async getArchivedUsers() {
        const [rows] = await db.execute('SELECT id, username, email, role, created_at FROM users WHERE is_deleted = 1 ORDER BY created_at DESC');
        return rows;
    }

    static async hardDelete(id) {
        const [result] = await db.execute('DELETE FROM users WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

module.exports = User;