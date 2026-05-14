const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vektor_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Database migration to add missing columns
db.getConnection(async (err, connection) => {
  if (err) {
    console.error('Error getting database connection for migration:', err);
    return;
  }
  
  try {
    // Check and add adresse column
    try {
      await connection.execute('ALTER TABLE users ADD COLUMN adresse VARCHAR(255)');
      console.log('Added adresse column to users table');
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME') {
        console.error('Error adding adresse column:', error);
      }
    }

    // Check and add jobtitle column
    try {
      await connection.execute('ALTER TABLE users ADD COLUMN jobtitle VARCHAR(255)');
      console.log('Added jobtitle column to users table');
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME') {
        console.error('Error adding jobtitle column:', error);
      }
    }

    // Check and add profile_picture column
    try {
      await connection.execute('ALTER TABLE users ADD COLUMN profile_picture VARCHAR(255)');
      console.log('Added profile_picture column to users table');
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME') {
        console.error('Error adding profile_picture column:', error);
      }
    }

    console.log('Database migration completed');
  } catch (error) {
    console.error('Error during database migration:', error);
  } finally {
    connection.release();
  }
});

module.exports = db;
