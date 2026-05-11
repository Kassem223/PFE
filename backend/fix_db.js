const db = require('./config/database');

async function fixDb() {
  try {
    const token = 'a6b14b213cfcb1f99bf620a51833f9e6dd23cfa18a32ad2c45c14ce535ec03e2';
    const [invRows] = await db.execute('SELECT email FROM manager_invitations WHERE token = ?', [token]);
    if (invRows.length > 0) {
      const email = invRows[0].email;
      console.log('Found email for token:', email);
      
      // Delete from users
      const [res] = await db.execute('DELETE FROM users WHERE email = ?', [email]);
      console.log('Deleted users:', res.affectedRows);
      
      // Reset status if it was changed
      const [res2] = await db.execute('UPDATE manager_invitations SET status = "pending" WHERE token = ?', [token]);
      console.log('Reset invitation:', res2.affectedRows);
    } else {
      console.log('Token not found.');
    }
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

fixDb();
