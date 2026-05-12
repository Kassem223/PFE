const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  try {
    const db = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'vektor_db'
    });
    console.log('Successfully connected to the database!');
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM users');
    console.log('User count:', rows[0].count);
    await db.end();
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
