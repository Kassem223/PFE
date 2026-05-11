const db = require('./backend/config/database');

async function debugSimple() {
  try {
    // Simple test to check reservation data
    const [reservations] = await db.execute('SELECT id_reservation, id_equipement FROM reservations WHERE id_reservation = 95');
    console.log('Réservation 95:', reservations[0]);
    
    // Check if equipment exists
    const [equipment] = await db.execute('SELECT id, nom FROM equipements WHERE id = ?', [reservations[0].id_equipement]);
    console.log('Équipement associé:', equipment);
    
    await db.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

debugSimple();
