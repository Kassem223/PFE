-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
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

-- Create reservation_equipments table for multi-equipment reservations
CREATE TABLE IF NOT EXISTS reservation_equipments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_reservation INT NOT NULL,
    id_equipement INT NOT NULL,
    
    FOREIGN KEY (id_reservation) REFERENCES reservations(id_reservation) ON DELETE CASCADE,
    
    UNIQUE KEY unique_reservation_equipment (id_reservation, id_equipement)
);
