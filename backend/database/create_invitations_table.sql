-- Create table for manager invitations
CREATE TABLE IF NOT EXISTS manager_invitations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    nom VARCHAR(255) NULL,
    prenom VARCHAR(255) NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    status ENUM('pending', 'accepted', 'expired') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 DAY)),
    accepted_at TIMESTAMP NULL,
    INDEX idx_token (token),
    INDEX idx_email (email),
    INDEX idx_status (status)
);

-- Create table for invitation tracking
CREATE TABLE IF NOT EXISTS invitation_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invitation_id INT NOT NULL,
    action ENUM('created', 'sent', 'clicked', 'accepted', 'expired') NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invitation_id) REFERENCES manager_invitations(id) ON DELETE CASCADE,
    INDEX idx_invitation_id (invitation_id),
    INDEX idx_action (action)
);
