-- Création de la table categories
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Création de la table salles
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
);

-- Création de la table vehicules
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
);

-- Création de la table equipements
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
);

-- Insertion des 3 catégories principales
INSERT INTO categories (name, description, icon, color) VALUES 
('Salles', 'Salles de réunion et espaces', '🏢', 'from-blue-500 to-blue-600'),
('Véhicules', 'Flotte d''entreprise', '🚗', 'from-cyan-500 to-blue-600'),
('Équipements', 'Équipements et matériel', '🖥️', 'from-cyan-400 to-blue-500')
ON DUPLICATE KEY UPDATE 
    description = VALUES(description),
    icon = VALUES(icon),
    color = VALUES(color);
