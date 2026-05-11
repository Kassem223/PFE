-- Create invitations table for manager account invitations
CREATE TABLE IF NOT EXISTS invitations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    token VARCHAR(255) NOT NULL UNIQUE,
    role ENUM('manager', 'admin') NOT NULL DEFAULT 'manager',
    status ENUM('pending', 'accepted', 'expired') DEFAULT 'pending',
    invited_by INT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_email (email),
    INDEX idx_token (token),
    INDEX idx_status (status),
    INDEX idx_expires (expires_at)
);
