const mysql = require('mysql2/promise');
require('dotenv').config();

async function testDatabaseStructure() {
  const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'vektor_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    // Check if users table exists and get its structure
    console.log('Checking users table structure...');
    const [columns] = await db.execute('DESCRIBE users');
    console.log('Users table columns:');
    columns.forEach(col => {
      console.log(`- ${col.Field} (${col.Type})`);
    });

    // Check if there are any users
    const [users] = await db.execute('SELECT COUNT(*) as count FROM users');
    console.log(`\nTotal users in database: ${users[0].count}`);

    // Check a sample user (if any exist)
    if (users[0].count > 0) {
      const [sampleUser] = await db.execute('SELECT * FROM users LIMIT 1');
      console.log('\nSample user data:');
      Object.keys(sampleUser[0]).forEach(key => {
        console.log(`- ${key}: ${sampleUser[0][key] ? 'has value' : 'NULL/undefined'}`);
      });
    }

  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await db.end();
  }
}

testDatabaseStructure();
