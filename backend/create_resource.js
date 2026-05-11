const db = require('./config/database');

async function createFlotteResource() {
  try {
    const [result] = await db.execute(
      'INSERT INTO resources (name, description, image_url) VALUES (?, ?, ?)',
      ['Flotte d entreprise', 'Flotte d entreprise pour les véhicules', null]
    );
    console.log('Ressource Flotte d entreprise créée avec ID:', result.insertId);
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la création:', error);
    process.exit(1);
  }
}

createFlotteResource();
