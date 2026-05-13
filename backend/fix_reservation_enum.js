const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixReservationEnum() {
  try {
    console.log('=== Fixing Reservation ENUM Values ===');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'reservi_db'
    });

    try {
      // Check current ENUM values
      const [columns] = await connection.execute(`
        SELECT COLUMN_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'reservations' 
        AND COLUMN_NAME = 'statut'
      `);

      if (columns.length > 0) {
        console.log('Current ENUM definition:', columns[0].COLUMN_TYPE);
        
        // Fix the ENUM values
        console.log('Updating ENUM values to use spaces instead of underscores...');
        
        await connection.execute(`
          ALTER TABLE reservations 
          MODIFY COLUMN statut ENUM('en attente', 'confirmée', 'annulée') DEFAULT 'en attente'
        `);
        
        console.log('✓ ENUM values fixed successfully!');
        console.log('✓ Valid values are now: "en attente", "confirmée", "annulée"');
      } else {
        console.log('Could not find statut column in reservations table');
      }

    } finally {
      await connection.end();
    }

    console.log('\n=== Fix Complete ===');
    console.log('Your reservation table should now accept the correct status values.');
    process.exit(0);

  } catch (error) {
    console.error('Error fixing reservation enum:', error);
    console.error('\nPlease ensure:');
    console.error('1. Your .env file has correct DB_HOST, DB_USER, DB_PASSWORD, DB_NAME');
    console.error('2. MySQL server is running');
    console.error('3. The reservations table exists');
    process.exit(1);
  }
}

fixReservationEnum();
