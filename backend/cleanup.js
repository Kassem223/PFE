const db = require('./config/database');

async function cleanupOldTable() {
  try {
    console.log('Checking for old equipement table...');
    
    // Check if table exists
    const [tables] = await db.execute(`
      SELECT TABLE_NAME FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'equipement'
    `);
    
    if (tables.length === 0) {
      console.log('Old equipement table does not exist');
      return;
    }
    
    console.log('Dropping old equipement table...');
    await db.execute('DROP TABLE equipement');
    console.log('Old equipement table dropped successfully');
    
  } catch (error) {
    console.error('Error dropping old equipement table:', error);
  }
}

cleanupOldTable().then(() => {
  console.log('Cleanup completed');
  process.exit(0);
}).catch(error => {
  console.error('Cleanup failed:', error);
  process.exit(1);
});
