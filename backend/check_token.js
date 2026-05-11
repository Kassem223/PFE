const db = require('./config/database');

async function checkToken() {
  try {
    const [rows] = await db.execute('SELECT * FROM manager_invitations WHERE token = ?', ['a6b14b213cfcb1f99bf620a51833f9e6dd23cfa18a32ad2c45c14ce535ec03e2']);
    console.log(rows);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkToken();
