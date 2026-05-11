const db = require('./config/database');
const fs = require('fs');

async function setupDatabase() {
  try {
    console.log('Création des tables...');
    
    // Lire et exécuter le fichier SQL
    const sql = fs.readFileSync('./create_tables.sql', 'utf8');
    
    // Séparer les requêtes SQL
    const queries = sql.split(';').filter(query => query.trim());
    
    for (const query of queries) {
      if (query.trim()) {
        console.log('Exécution:', query.trim().substring(0, 100) + '...');
        await db.execute(query.trim());
      }
    }
    
    console.log('Tables créées avec succès!');
    
    // Vérifier les catégories créées
    const [categories] = await db.execute('SELECT * FROM categories');
    console.log('Catégories créées:', categories);
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la création des tables:', error);
    process.exit(1);
  }
}

setupDatabase();
