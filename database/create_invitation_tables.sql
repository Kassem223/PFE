-- Create reservation_invitations table
CREATE TABLE IF NOT EXISTS reservation_invitations (
    id_invitation INT AUTO_INCREMENT PRIMARY KEY,
    id_reservation INT NOT NULL,
    id_user INT NULL, -- For internal users
    email VARCHAR(255) NOT NULL, -- For external users or internal user email
    type ENUM('internal', 'external') NOT NULL DEFAULT 'external',
    status ENUM('pending', 'accepted', 'refused') NOT NULL DEFAULT 'pending',
    refusal_reason TEXT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    invited_by INT NOT NULL, -- User who sent the invitation
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    FOREIGN KEY (id_reservation) REFERENCES reservations(id_reservation) ON DELETE CASCADE,
    FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create notifications table for in-app notifications
CREATE TABLE IF NOT EXISTS notifications (
    id_notification INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL,
    type ENUM('reservation_invitation', 'reservation_accepted', 'reservation_refused', 'reservation_reminder') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSON NULL, -- Additional data like reservation_id, invitation_id, etc.
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX idx_reservation_invitations_reservation ON reservation_invitations(id_reservation);
CREATE INDEX idx_reservation_invitations_user ON reservation_invitations(id_user);
CREATE INDEX idx_reservation_invitations_email ON reservation_invitations(email);
CREATE INDEX idx_reservation_invitations_token ON reservation_invitations(token);
CREATE INDEX idx_notifications_user ON notifications(id_user);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- Update reservations table to include total participants count
ALTER TABLE reservations ADD COLUMN total_participants INT DEFAULT 1 AFTER nombre_personnes;
