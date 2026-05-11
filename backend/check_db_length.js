const db = require('./config/database');

async function checkDb() {
  try {
    const [rows] = await db.execute('SELECT id, email, length(email) FROM users');
    console.log(rows);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkDb();
