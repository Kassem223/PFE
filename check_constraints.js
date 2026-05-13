const db = require('./backend/config/database');

async function checkSchema() {
  try {
    const [rows] = await db.execute('SHOW CREATE TABLE reservation_equipments');
    console.log(rows[0]['Create Table']);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkSchema();
