-- ============================================================
-- VEKTOR — Complete Database Setup Script
-- Compatible with MySQL 8 / WAMP
-- ============================================================

CREATE DATABASE IF NOT EXISTS vektor_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE vektor_db;

-- ============================================================
-- USERS
-- VARCHAR(191) on indexed cols = 191 × 4 = 764 bytes < 767 limit
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(191) NOT NULL,
    mdp VARCHAR(255) NOT NULL,
    role ENUM('admin','manager','user') DEFAULT 'user',
    departement VARCHAR(100) NULL,
    adresse VARCHAR(191) NULL,
    jobtitle VARCHAR(191) NULL,
    profile_picture VARCHAR(191) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_email (email(191))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- ============================================================
-- CATEGORIES (3 static: Salles, Véhicules, Équipements)
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_name (name(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

INSERT INTO categories (name, description, icon, color) VALUES
  ('Salles',       'Salles de réunion et espaces',  '🏢', 'from-blue-500 to-blue-600'),
  ('Véhicules',    'Flotte d''entreprise',           '🚗', 'from-cyan-500 to-blue-600'),
  ('Équipements',  'Équipements et matériel',        '🖥️', 'from-cyan-400 to-blue-500')
ON DUPLICATE KEY UPDATE
  description = VALUES(description),
  icon        = VALUES(icon),
  color       = VALUES(color);

-- ============================================================
-- SALLES (Rooms)
-- ============================================================
CREATE TABLE IF NOT EXISTS salles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    nom VARCHAR(255) NOT NULL,
    details TEXT,
    image_url VARCHAR(500),
    capacite INT DEFAULT 0,
    disponibilite BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- ============================================================
-- VEHICULES (Vehicles)
-- ============================================================
CREATE TABLE IF NOT EXISTS vehicules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    nom VARCHAR(255) NOT NULL,
    details TEXT,
    image_url VARCHAR(500),
    marque VARCHAR(100),
    modele VARCHAR(100),
    immatriculation VARCHAR(50),
    disponibilite BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- ============================================================
-- EQUIPEMENTS (Equipment)
-- ============================================================
CREATE TABLE IF NOT EXISTS equipements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    nom VARCHAR(255) NOT NULL,
    details TEXT,
    image_url VARCHAR(500),
    type_equipement VARCHAR(100),
    etat VARCHAR(50) DEFAULT 'bon',
    disponibilite BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- ============================================================
-- RESERVATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS reservations (
    id_reservation INT AUTO_INCREMENT PRIMARY KEY,
    id_equipement INT NOT NULL,
    id_user INT NOT NULL,
    date_reservation DATE NOT NULL,
    time_start TIME NOT NULL,
    time_end TIME NOT NULL,
    nombre_personnes INT DEFAULT 1,
    total_participants INT DEFAULT 1,
    statut ENUM('en_attente','confirmée','annulée','terminée') DEFAULT 'en_attente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_date (date_reservation),
    INDEX idx_equipement (id_equipement),
    INDEX idx_user (id_user),
    INDEX idx_statut (statut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- ============================================================
-- RESERVATION_EQUIPMENTS (extra equipment linked to a booking)
-- ============================================================
CREATE TABLE IF NOT EXISTS reservation_equipments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_reservation INT NOT NULL,
    id_equipement INT NOT NULL,
    FOREIGN KEY (id_reservation) REFERENCES reservations(id_reservation) ON DELETE CASCADE,
    UNIQUE KEY uq_res_eq (id_reservation, id_equipement)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- ============================================================
-- RESERVATION_INVITATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS reservation_invitations (
    id_invitation INT AUTO_INCREMENT PRIMARY KEY,
    id_reservation INT NOT NULL,
    id_user INT NULL,
    email VARCHAR(191) NOT NULL,
    type ENUM('internal','external') NOT NULL DEFAULT 'external',
    status ENUM('pending','accepted','refused') NOT NULL DEFAULT 'pending',
    refusal_reason TEXT NULL,
    token VARCHAR(191) NOT NULL,
    invited_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    FOREIGN KEY (id_reservation) REFERENCES reservations(id_reservation) ON DELETE CASCADE,
    FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_token (token(191)),
    INDEX idx_reservation (id_reservation),
    INDEX idx_user (id_user),
    INDEX idx_email (email(191)),
    INDEX idx_token (token(191))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id_notification INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL,
    type ENUM('reservation_invitation','reservation_accepted','reservation_refused','reservation_reminder') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSON NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (id_user),
    INDEX idx_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- ============================================================
-- DEFAULT ADMIN ACCOUNT
-- Email:    admin@vektor.com
-- Password: Admin123!
-- ============================================================
INSERT IGNORE INTO users (nom, prenom, email, mdp, role) VALUES
(
  'Admin',
  'VEKTOR',
  'admin@vektor.com',
  '$2b$10$9Ky.eFzJABf.pPxA7vOxueH1T.pnPuUk5XuK9XaE6V2lB0oqv.8.O',
  'admin'
);

-- Confirmation
SELECT 'Setup complete!' AS Status;
SELECT role, COUNT(*) AS count FROM users GROUP BY role;
SELECT name FROM categories;
