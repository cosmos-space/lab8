const bcrypt = require('bcrypt');
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

    // SAME email as in setAdminRole.js
    const email = 'admin@example.com';
    const newPassword = 'Admin123!';

    console.log('Resetting password for:', email);

    const [rows] = await conn.execute(
      'SELECT id, username, email, role FROM users WHERE email = ?',
      [email]
    );

    if (!rows.length) {
      console.log('No user found with that email.');
      await conn.end();
      return;
    }

    console.log('User:', rows[0]);

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    await conn.execute(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [hash, email]
    );

    console.log('Password updated.');
    console.log('Login with:');
    console.log('  Email:    ' + email);
    console.log('  Password: ' + newPassword);

    await conn.end();
  } catch (err) {
    console.error('Failed to reset admin password:', err.message);
    console.error(err);
    process.exit(1);
  }
})();
