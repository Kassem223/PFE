const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function check() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    const [rows] = await db.execute('DESCRIBE notifications');
    console.log('Notifications table columns:', rows.map(r => r.Field));
    
    const [invRows] = await db.execute('DESCRIBE reservation_invitations');
    console.log('Reservation_invitations table columns:', invRows.map(r => r.Field));
  } catch (e) {
    console.error('Check failed:', e.message);
  } finally {
    await db.end();
  }
}

check();
