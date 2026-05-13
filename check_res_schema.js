const db = require('./backend/config/database');

async function checkSchema() {
  try {
    const [rows] = await db.execute('DESCRIBE reservations');
    console.log(rows);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkSchema();
