const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixTablesStructure() {
  try {
    console.log('=== Correction de la structure des tables ===');
    
    // Connexion à la base de données
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
      console.log('=== Ajout de la colonne status manquante ===');

      // Ajouter la colonne status à la table salles
      try {
        await conn.execute(`
          ALTER TABLE salles 
          ADD COLUMN IF NOT EXISTS 
          status ENUM('disponible', 'indisponible') DEFAULT 'disponible'
        `);
        console.log('✅ Colonne status ajoutée à la table salles');
      } catch (error) {
        if (error.code !== 'ER_DUP_FIELDNAME') {
          console.error('Erreur ajoutant status à salles:', error);
        } else {
          console.log('ℹ️ Colonne status existe déjà dans salles');
        }
      }

      // Ajouter la colonne status à la table vehicules
      try {
        await conn.execute(`
          ALTER TABLE vehicules 
          ADD COLUMN IF NOT EXISTS 
          status ENUM('disponible', 'indisponible') DEFAULT 'disponible'
        `);
        console.log('✅ Colonne status ajoutée à la table vehicules');
      } catch (error) {
        if (error.code !== 'ER_DUP_FIELDNAME') {
          console.error('Erreur ajoutant status à vehicules:', error);
        } else {
          console.log('ℹ️ Colonne status existe déjà dans vehicules');
        }
      }

      // Ajouter la colonne status à la table equipements
      try {
        await conn.execute(`
          ALTER TABLE equipements 
          ADD COLUMN IF NOT EXISTS 
          status ENUM('disponible', 'indisponible') DEFAULT 'disponible'
        `);
        console.log('✅ Colonne status ajoutée à la table equipements');
      } catch (error) {
        if (error.code !== 'ER_DUP_FIELDNAME') {
          console.error('Erreur ajoutant status à equipements:', error);
        } else {
          console.log('ℹ️ Colonne status existe déjà dans equipements');
        }
      }

      // Vérifier la structure finale
      console.log('\n=== Vérification de la structure ===');
      
      const [sallesStructure] = await conn.execute('DESCRIBE salles');
      console.log('Structure salles:', sallesStructure.map(col => `${col.Field} (${col.Type})`));
      
      const [vehiculesStructure] = await conn.execute('DESCRIBE vehicules');
      console.log('Structure vehicules:', vehiculesStructure.map(col => `${col.Field} (${col.Type})`));
      
      const [equipementsStructure] = await conn.execute('DESCRIBE equipements');
      console.log('Structure equipements:', equipementsStructure.map(col => `${col.Field} (${col.Type})`));

      console.log('\n=== Structure corrigée avec succès ===');

    } catch (error) {
      console.error('Erreur générale:', error);
    } finally {
      conn.release();
    }

    process.exit(0);

  } catch (error) {
    console.error('Erreur générale:', error);
    process.exit(1);
  }
}

fixTablesStructure();
