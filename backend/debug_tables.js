const db = require('./config/database');

async function checkTables() {
  try {
    console.log('=== Vérification des tables ===');
    
    // Vérifier les tables
    const [tables] = await db.execute('SHOW TABLES');
    console.log('Tables disponibles:', tables.map(t => t[0]));
    
    // Vérifier la structure de la table reservations
    if (tables.some(t => t[0] === 'reservations')) {
      const [structure] = await db.execute('DESCRIBE reservations');
      console.log('Structure de reservations:', structure);
    }
    
    // Vérifier quelques données
    const [reservationsCount] = await db.execute('SELECT COUNT(*) as count FROM reservations');
    console.log('Nombre de réservations:', reservationsCount[0].count);
    
    // Tester la requête du modèle Reservation
    try {
      const [testRows] = await db.execute(`
        SELECT r.*, u.prenom, u.nom, 
          CASE 
            WHEN s.id IS NOT NULL THEN s.nom
              WHEN v.id IS NOT NULL THEN v.nom
              WHEN e.id IS NOT NULL THEN e.nom
              ELSE 'Équipement inconnu'
          END as equipement_nom,
          CASE 
            WHEN s.id IS NOT NULL THEN s.status
              WHEN v.id IS NOT NULL THEN v.status
              WHEN e.id IS NOT NULL THEN e.status
              ELSE 'inconnu'
          END as equipement_status
        FROM reservations r
        JOIN users u ON r.id_user = u.id
        LEFT JOIN salles s ON r.id_equipement = s.id
        LEFT JOIN vehicules v ON r.id_equipement = v.id
        LEFT JOIN equipements e ON r.id_equipement = e.id
        ORDER BY r.created_at DESC
        LIMIT 5
      `);
      console.log('Test requête réussie, nombre de résultats:', testRows.length);
    } catch (testError) {
      console.error('Erreur lors du test de requête:', testError);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

checkTables();
