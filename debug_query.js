const db = require('./backend/config/database');

async function debugQuery() {
  try {
    // Vérifier d'abord les données brutes
    console.log('=== Vérification des données brutes ===');
    
    // 1. Vérifier la réservation 95
    const [reservation] = await db.execute('SELECT * FROM reservations WHERE id_reservation = 95');
    console.log('Réservation 95:', reservation);
    
    // 2. Vérifier l'équipement principal
    const [mainEquip] = await db.execute('SELECT * FROM equipements WHERE id = ?', [reservation[0].id_equipement]);
    console.log('Équipement principal:', mainEquip);
    
    // 3. Vérifier les équipements additionnels
    const [addEquip] = await db.execute('SELECT * FROM reservation_equipments WHERE id_reservation = 95');
    console.log('Équipements additionnels:', addEquip);
    
    // 4. Tester la requête complète étape par étape
    console.log('\n=== Test de la requête complète ===');
    const [fullQuery] = await db.execute(`
      SELECT 
        r.id_reservation,
        r.id_equipement,
        main_eq.nom as equipement_nom
      FROM reservations r
      LEFT JOIN equipements main_eq ON r.id_equipement = main_eq.id
      WHERE r.id_reservation = 95
    `);
    console.log('Résultat requête simple:', fullQuery);
    
    await db.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

debugQuery();
