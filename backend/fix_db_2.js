const db = require('./config/database');

async function fixDb() {
  try {
    const [res] = await db.execute('DELETE FROM users WHERE email = ?', ['kasem.hafsi@gmail.com']);
    console.log('Deleted users:', res.affectedRows);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

fixDb();
