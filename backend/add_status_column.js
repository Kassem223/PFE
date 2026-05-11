const mysql = require('mysql2/promise');
require('dotenv').config();

async function addStatusColumn() {
  try {
    console.log('=== Ajout de la colonne status aux tables ===');
    
    const db = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'reservi_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    const conn = await db.getConnection();

    try {
      // Ajouter la colonne status à la table salles
      await conn.execute(`
        ALTER TABLE salles 
        ADD COLUMN IF NOT EXISTS 
        status ENUM('disponible', 'indisponible') DEFAULT 'disponible'
      `);
      console.log('✅ Colonne status ajoutée à salles');

      // Ajouter la colonne status à la table vehicules
      await conn.execute(`
        ALTER TABLE vehicules 
        ADD COLUMN IF NOT EXISTS 
        status ENUM('disponible', 'indisponible') DEFAULT 'disponible'
      `);
      console.log('✅ Colonne status ajoutée à vehicules');

      // Ajouter la colonne status à la table equipements
      await conn.execute(`
        ALTER TABLE equipements 
        ADD COLUMN IF NOT EXISTS 
        status ENUM('disponible', 'indisponible') DEFAULT 'disponible'
      `);
      console.log('✅ Colonne status ajoutée à equipements');

      console.log('\n=== Colonnes status ajoutées avec succès ===');
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout des colonnes status:', error);
    } finally {
      conn.release();
    }

    process.exit(0);

  } catch (error) {
    console.error('Erreur générale:', error);
    process.exit(1);
  }
}

addStatusColumn();
