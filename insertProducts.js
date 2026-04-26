const mysql = require('mysql2/promise');
require('dotenv').config({ path: __dirname + '/backend/.env' });

async function insertProducts() {
    console.log('Starting product insertion...');
    console.log('DB Config:', {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME
    });

    let connection;
    try {
        // First, connect without a database to check available databases
        const tempConn = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
        });

        console.log('✓ Connected to MySQL');

        // Check available databases
        const [databases] = await tempConn.execute('SHOW DATABASES');
        const dbList = databases.map(db => db.Database);
        console.log('Available databases:', dbList);

        const selectedDb = process.env.DB_NAME || 'ecommerce_db';
        
        if (!dbList.includes(selectedDb)) {
            console.error(`✗ Database "${selectedDb}" not found`);
            console.log('Please create the database first or update DB_NAME in .env');
            await tempConn.end();
            return;
        }

        console.log(`✓ Found database: ${selectedDb}`);
        await tempConn.end();

        // Now connect to the specific database
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: selectedDb
        });

        console.log(`✓ Connected to database: ${selectedDb}`);

        // Check if products table exists
        const [tables] = await connection.execute(
            "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products'",
            [selectedDb]
        );

        if (tables.length === 0) {
            console.log('Creating products table...');
            await connection.execute(`
                CREATE TABLE products (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    price DECIMAL(10, 2) NOT NULL,
                    stock_quantity INT DEFAULT 0,
                    image_url VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
            console.log('✓ Products table created');
        } else {
            console.log('✓ Products table already exists');
        }

        // Optional: clear existing products
        // const [delResult] = await connection.execute('DELETE FROM products');
        // console.log(`✓ Cleared existing products (${delResult.affectedRows} rows deleted)`);

        // Insert sample products
        const products = [
            ['Laptop', 'High-performance laptop with 16GB RAM', 1299.99, 10, 'https://via.placeholder.com/300?text=Laptop'],
            ['Smartphone', 'Latest smartphone with 5G support', 899.99, 25, 'https://via.placeholder.com/300?text=Smartphone'],
            ['Headphones', 'Wireless noise-cancelling headphones', 199.99, 50, 'https://via.placeholder.com/300?text=Headphones'],
            ['Tablet', '10-inch tablet for work and entertainment', 599.99, 15, 'https://via.placeholder.com/300?text=Tablet'],
            ['Smart Watch', 'Fitness tracking smartwatch', 299.99, 30, 'https://via.placeholder.com/300?text=SmartWatch'],
            ['Keyboard', 'Mechanical gaming keyboard', 149.99, 40, 'https://via.placeholder.com/300?text=Keyboard'],
            ['Mouse', 'Ergonomic wireless mouse', 79.99, 60, 'https://via.placeholder.com/300?text=Mouse'],
            ['Monitor', '4K ultra-wide monitor', 799.99, 8, 'https://via.placeholder.com/300?text=Monitor']
        ];

        for (const product of products) {
            await connection.execute(
                'INSERT INTO products (name, description, price, stock_quantity, image_url) VALUES (?, ?, ?, ?, ?)',
                product
            );
        }

        console.log(`✓ Inserted ${products.length} products successfully`);

        // Verify
        const [result] = await connection.execute('SELECT COUNT(*) as count FROM products');
        console.log(`✓ Total products in database: ${result[0].count}`);
        
        // List all products
        const [allProducts] = await connection.execute('SELECT id, name, price, stock_quantity FROM products');
        console.log('\nProducts in database:');
        allProducts.forEach(p => {
            console.log(`  - ${p.name} ($${p.price}) - Stock: ${p.stock_quantity}`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

insertProducts();
 