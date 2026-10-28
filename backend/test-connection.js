// Test database connection
require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    console.log('Testing MySQL connection...');
    console.log('Host:', process.env.DB_HOST);
    console.log('User:', process.env.DB_USER);
    console.log('Database:', process.env.DB_NAME);
    console.log('');

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Connected to MySQL successfully!');
    
    // Test query
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM products');
    console.log(`✅ Found ${rows[0].count} products in database`);
    
    await connection.end();
    console.log('✅ Connection closed');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('');
    console.log('Please check:');
    console.log('1. MySQL service is running');
    console.log('2. Database credentials in .env file are correct');
    console.log('3. Database "bms3_db" exists');
    process.exit(1);
  }
}

testConnection();
