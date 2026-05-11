const db = require('./config/database');

(async () => {
  try {
    // Vérifier les réservations
    const [reservations] = await db.execute('SELECT * FROM reservations LIMIT 5');
    console.log('=== RÉSERVATIONS ===');
    console.log(JSON.stringify(reservations, null, 2));
    
    // Vérifier les équipements réservés
    const [equipments] = await db.execute('SELECT * FROM reservation_equipments LIMIT 10');
    console.log('\n=== RESERVATION_EQUIPMENTS ===');
    console.log(JSON.stringify(equipments, null, 2));
    
    // Vérifier la jointure
    const [joined] = await db.execute(`
      SELECT re.*, e.nom as equipement_nom
      FROM reservation_equipments re
      JOIN equipements e ON re.id_equipement = e.id
      LIMIT 10
    `);
    console.log('\n=== JOINTURE RESERVATION_EQUIPMENTS + EQUIPEMENTS ===');
    console.log(JSON.stringify(joined, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error.message);
    process.exit(1);
  }
})();
