const mysql = require('mysql2/promise');
require('dotenv').config();

async function ensureTablesExist() {
  try {
    console.log('=== Checking Database Tables ===');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'reservi_db'
    });

    try {
      // Check if reservation_equipments table exists
      const [tables] = await connection.execute(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'reservation_equipments'
      `);

      if (tables.length === 0) {
        console.log('⚠️  reservation_equipments table NOT found. Creating it now...');
        
        await connection.execute(`
          CREATE TABLE IF NOT EXISTS reservation_equipments (
              id INT AUTO_INCREMENT PRIMARY KEY,
              id_reservation INT NOT NULL,
              id_equipement INT NOT NULL,
              
              FOREIGN KEY (id_reservation) REFERENCES reservations(id_reservation) ON DELETE CASCADE,
              
              UNIQUE KEY unique_reservation_equipment (id_reservation, id_equipement)
          )
        `);
        
        console.log('✓ reservation_equipments table created successfully!');
      } else {
        console.log('✓ reservation_equipments table already exists');
      }

      // Check if reservations table has correct ENUM
      const [columns] = await connection.execute(`
        SELECT COLUMN_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'reservations' 
        AND COLUMN_NAME = 'statut'
        AND TABLE_SCHEMA = DATABASE()
      `);

      if (columns.length > 0) {
        console.log('✓ Reservations table ENUM type:', columns[0].COLUMN_TYPE);
      } else {
        console.log('⚠️  Could not verify reservations table structure');
      }

      // List all tables
      const [allTables] = await connection.execute(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = DATABASE()
        ORDER BY TABLE_NAME
      `);

      console.log('\n✓ All existing tables:');
      allTables.forEach(table => {
        console.log('  - ' + table.TABLE_NAME);
      });

    } finally {
      await connection.end();
    }

    console.log('\n=== Check Complete ===');
    console.log('Your database is ready for reservations!');
    process.exit(0);

  } catch (error) {
    console.error('Error checking database tables:', error.message);
    console.error('\nPlease ensure:');
    console.error('1. Your .env file has correct DB_HOST, DB_USER, DB_PASSWORD, DB_NAME');
    console.error('2. MySQL server is running');
    console.error('3. The database exists');
    process.exit(1);
  }
}

ensureTablesExist();
