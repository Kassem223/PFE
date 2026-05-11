const db = require('./backend/config/database');

async function checkDatabase() {
  try {
    console.log('Checking database connection...');
    
    // Check if reservations table exists
    const [tables] = await db.execute("SHOW TABLES LIKE 'reservations'");
    console.log('Reservations table exists:', tables.length > 0);
    
    if (tables.length > 0) {
      // Get table structure
      const [columns] = await db.execute("DESCRIBE reservations");
      console.log('Reservations table structure:');
      columns.forEach(col => {
        console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? 'KEY' : ''}`);
      });
      
      // Try a simple insert test
      console.log('\nTesting simple insert...');
      try {
        const [result] = await db.execute(
          'INSERT INTO reservations (id_equipement, id_user, date_reservation, time_start, time_end, nombre_personnes, statut) VALUES (?, ?, ?, ?, ?, ?, "en attente")',
          [1, 1, '2026-05-11', '09:00', '10:00', 1]
        );
        console.log('Insert successful, ID:', result.insertId);
        
        // Clean up test record
        await db.execute('DELETE FROM reservations WHERE id_reservation = ?', [result.insertId]);
        console.log('Test record cleaned up');
      } catch (insertError) {
        console.error('Insert test failed:', insertError.message);
      }
    }
    
  } catch (error) {
    console.error('Database check failed:', error.message);
  } finally {
    process.exit(0);
  }
}

checkDatabase();
