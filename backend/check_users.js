const db = require('./config/database');

async function checkUsers() {
  try {
    const [rows] = await db.execute('SELECT email FROM users');
    console.log(rows);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkUsers();
