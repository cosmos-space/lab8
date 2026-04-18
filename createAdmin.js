const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const path = require('path');

// Load same env as server
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'ecommerce_db',
        });

        const username = 'admin';
        const email = 'admin@example.com';
        const password = 'Admin123!';

        console.log('Creating admin user:', email);

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        // Check if admin already exists
        const [existing] = await conn.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );
        if (existing.length) {
            console.log('Admin user already exists with this email.');
            await conn.end();
            return;
        }

        await conn.execute(
            'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [username, email, hash, 'admin']
        );

        console.log('Admin created successfully.');
        console.log('Login with:');
        console.log('  Email:    ' + email);
        console.log('  Password: ' + password);

        await conn.end();
    } catch (err) {
        console.error('Failed to create admin:', err.message);
        console.error(err);
        process.exit(1);
    }
})();
