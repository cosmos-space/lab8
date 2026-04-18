const mysql = require('mysql2/promise');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ecommerce_db',
    });

    // CHANGE THIS to the exact email you type in the login form:
    const email = 'admin@example.com';

    console.log('Using DB:', process.env.DB_NAME || 'ecommerce_db');
    console.log('Looking up user:', email);

    const [rows] = await conn.execute(
      'SELECT id, username, email, role FROM users WHERE email = ?',
      [email]
    );

    if (!rows.length) {
      console.log('No user found with that email.');
      await conn.end();
      return;
    }

    console.log('Before:', rows[0]);

    await conn.execute(
      'UPDATE users SET role = "admin" WHERE email = ?',
      [email]
    );

    const [after] = await conn.execute(
      'SELECT id, username, email, role FROM users WHERE email = ?',
      [email]
    );

    console.log('After:', after[0]);

    await conn.end();
  } catch (err) {
    console.error('Failed to set admin role:', err.message);
    console.error(err);
    process.exit(1);
  }
})();
