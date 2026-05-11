const db = require('./backend/config/database');

async function testBackendQuery() {
  try {
    // Tester la requête SQL directement
    const [rows] = await db.execute(`
      SELECT r.*, u.prenom, u.nom, main_eq.nom as equipement_nom,
        GROUP_CONCAT(
          CASE 
            WHEN eq.id IS NOT NULL THEN eq.nom
            ELSE NULL
          END, 
          ', '
        ) as additional_equipements
      FROM reservations r
      JOIN users u ON r.id_user = u.id
      LEFT JOIN equipements main_eq ON r.id_equipement = main_eq.id
      LEFT JOIN reservation_equipments re ON r.id_reservation = re.id_reservation
      LEFT JOIN equipements eq ON re.id_equipement = eq.id
      WHERE r.id_reservation = 95
      GROUP BY r.id_reservation
    `);
    
    console.log('Test direct de la requête pour réservation 95:');
    console.log(JSON.stringify(rows[0], null, 2));
    
    await db.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

testBackendQuery();
