-- Script complet pour créer toutes les tables nécessaires
-- Exécuter ce script dans votre base de données MySQL/MariaDB

-- Supprimer les anciennes tables si elles existent
DROP TABLE IF EXISTS reservation_invitations;
DROP TABLE IF EXISTS reservation_equipments;
DROP TABLE IF EXISTS reservations;

-- Recréer la table reservations avec la bonne structure
CREATE TABLE reservations (
    id_reservation INT AUTO_INCREMENT PRIMARY KEY,
    id_equipement INT NOT NULL,
    id_user INT NOT NULL,
    date_reservation DATE NOT NULL,
    time_start TIME NOT NULL,
    time_end TIME NOT NULL,
    nombre_personnes INT DEFAULT 1,
    statut ENUM('en_attente', 'confirmée', 'annulée', 'terminée') DEFAULT 'en_attente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_date (date_reservation),
    INDEX idx_equipement (id_equipement),
    INDEX idx_user (id_user),
    INDEX idx_statut (statut)
);

-- Créer la table reservation_equipements pour les équipements supplémentaires
CREATE TABLE reservation_equipments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_reservation INT NOT NULL,
    id_equipement INT NOT NULL,
    
    FOREIGN KEY (id_reservation) REFERENCES reservations(id_reservation) ON DELETE CASCADE,
    
    UNIQUE KEY unique_reservation_equipment (id_reservation, id_equipement)
);

-- Créer la table reservation_invitations pour les invitations
CREATE TABLE reservation_invitations (
    id_invitation INT AUTO_INCREMENT PRIMARY KEY,
    id_reservation INT NOT NULL,
    id_user INT NULL,
    email VARCHAR(255) NULL,
    type ENUM('internal', 'external') NOT NULL,
    status ENUM('pending', 'accepted', 'refused') DEFAULT 'pending',
    token VARCHAR(255) NOT NULL,
    invited_by INT NOT NULL,
    refusal_reason TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    
    FOREIGN KEY (id_reservation) REFERENCES reservations(id_reservation) ON DELETE CASCADE,
    FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_reservation (id_reservation),
    INDEX idx_user (id_user),
    INDEX idx_status (status),
    INDEX idx_token (token)
);

-- Afficher un message de confirmation
SELECT 'Tables créées avec succès!' AS message;
