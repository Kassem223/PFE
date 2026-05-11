const db = require('./config/database');

async function checkInv() {
  try {
    const [rows] = await db.execute('DESCRIBE manager_invitations');
    console.log(rows);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkInv();
