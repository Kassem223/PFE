const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  try {
    console.log('=== Configuration de la base de données ===');
    
    // Connexion sans spécifier de base de données
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'mysql' // Base de données système pour créer la nouvelle base
    });

    // Créer la base de données si elle n'existe pas
    try {
      await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'vektor_db'} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      console.log(`Base de données ${process.env.DB_NAME || 'vektor_db'} créée ou déjà existante`);
    } catch (error) {
      console.error('Erreur lors de la création de la base de données:', error);
    }

    await connection.end();

    // Connexion à la nouvelle base de données
    const db = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'vektor_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    const conn = await db.getConnection();

    try {
      console.log('=== Création des tables ===');

      // Table users
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nom VARCHAR(255) NOT NULL,
          prenom VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role ENUM('admin', 'user') DEFAULT 'user',
          adresse VARCHAR(255),
          jobtitle VARCHAR(255),
          profile_picture VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log('Table users créée');

      // Table salles
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS salles (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nom VARCHAR(255) NOT NULL,
          details TEXT,
          capacite INT,
          image_url VARCHAR(255),
          status ENUM('disponible', 'indisponible') DEFAULT 'disponible',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log('Table salles créée');

      // Table vehicules
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS vehicules (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nom VARCHAR(255) NOT NULL,
          details TEXT,
          image_url VARCHAR(255),
          status ENUM('disponible', 'indisponible') DEFAULT 'disponible',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log('Table vehicules créée');

      // Table equipements
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS equipements (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nom VARCHAR(255) NOT NULL,
          details TEXT,
          image_url VARCHAR(255),
          status ENUM('disponible', 'indisponible') DEFAULT 'disponible',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log('Table equipements créée');

      // Table reservations
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS reservations (
          id_reservation INT AUTO_INCREMENT PRIMARY KEY,
          id_equipement INT NOT NULL,
          id_user INT NOT NULL,
          date_reservation DATE NOT NULL,
          time_start TIME NOT NULL,
          time_end TIME NOT NULL,
          nombre_personnes INT DEFAULT 1,
          statut ENUM('en attente', 'confirmée', 'annulée') DEFAULT 'en attente',
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      console.log('Table reservations créée');

      // Table invitations
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS invitations (
          id_invitation INT AUTO_INCREMENT PRIMARY KEY,
          id_reservation INT NOT NULL,
          email VARCHAR(255) NOT NULL,
          status ENUM('pending', 'accepted', 'refused') DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (id_reservation) REFERENCES reservations(id_reservation) ON DELETE CASCADE
        )
      `);
      console.log('Table invitations créée');

      console.log('=== Configuration terminée ===');
      console.log('Base de données et tables créées avec succès !');

    } catch (error) {
      console.error('Erreur lors de la création des tables:', error);
    } finally {
      conn.release();
    }

    process.exit(0);

  } catch (error) {
    console.error('Erreur générale:', error);
    process.exit(1);
  }
}

setupDatabase();
