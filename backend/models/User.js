const db = require('../config/db');

class User {
    static async findByEmail(email) {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }
    static async findById(id) {
        const [rows] = await db.execute('SELECT id, username, email, role, created_at FROM users WHERE id = ?', [id]);
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
        const [rows] = await db.execute('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC');
        return rows;
    }
    static async delete(id) {
        const [result] = await db.execute('DELETE FROM users WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = User; 