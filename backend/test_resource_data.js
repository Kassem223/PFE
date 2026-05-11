const db = require('./config/database');

(async () => {
  try {
    const [rows] = await db.execute(`
      SELECT r.id_reservation, r.id_equipement, 
        COALESCE(s.nom, v.nom, e.nom) as resource_nom, 
        COALESCE(s.image_url, v.image_url, e.image_url) as resource_image
      FROM reservations r 
      LEFT JOIN salles s ON r.id_equipement = s.id 
      LEFT JOIN vehicules v ON r.id_equipement = v.id 
      LEFT JOIN equipements e ON r.id_equipement = e.id 
      LIMIT 3
    `);
    console.log('Données des réservations avec resource_nom et resource_image:');
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error.message);
    process.exit(1);
  }
})();
