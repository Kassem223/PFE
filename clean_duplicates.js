const db = require('./backend/config/database');

async function cleanDuplicates() {
  try {
    // Supprimer les doublons en gardant les premiers IDs
    await db.execute(`
      DELETE e1 FROM equipements e1
      INNER JOIN equipements e2 
      WHERE e1.id > e2.id 
      AND e1.nom = e2.nom 
      AND e1.category_id = e2.category_id
    `);
    
    // Vérifier les équipements restants
    const [equipment] = await db.execute('SELECT id, nom, category_id FROM equipements WHERE category_id = 3 ORDER BY id');
    console.log('Équipements restants après nettoyage:', equipment);
    
    await db.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

cleanDuplicates();
