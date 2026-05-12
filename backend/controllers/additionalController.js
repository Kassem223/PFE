const User = require('../models/User');
const Invitation = require('../models/Invitation');
const { sendInvitationEmail } = require('../config/email');
const crypto = require('crypto');
const db = require('../config/database');

const additionalController = {
  async inviteManager(req, res) {
    try {
      const { email, role = 'manager' } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Check if user already exists
      const existingUser = await User.getByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Generate invitation token
      const token = crypto.randomBytes(32).toString('hex');

      // Create invitation record
      const [result] = await db.execute(
        'INSERT INTO manager_invitations (email, role, token, status, created_at) VALUES (?, ?, ?, "pending", NOW())',
        [email, role, token]
      );

      // Send invitation email
      try {
        const acceptUrl = `http://localhost:5173/signup?token=${token}`;
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Invitation à rejoindre VEKTOR - Manager',
          html: `
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">VEKTOR</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Gestion des Réservations</p>
              </div>
              <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="color: #333; margin-bottom: 20px;">Invitation à devenir Manager</h2>
                <p style="color: #666; margin-bottom: 20px;">Vous avez été invité à rejoindre VEKTOR en tant que Manager.</p>
                <p style="color: #666; margin-bottom: 20px;">Cliquez sur ce lien pour accepter:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${acceptUrl}" style="display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Accepter l'invitation
                  </a>
                </div>
                <p style="color: #666; font-size: 12px; margin-top: 20px;">Si le bouton ne fonctionne pas, copiez ce lien: ${acceptUrl}</p>
              </div>
            </div>
          `
        };
        
        const transporter = require('../config/email').transporter;
        await new Promise((resolve, reject) => {
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) reject(error);
            else resolve(info);
          });
        });
      } catch (emailError) {
        console.error('Error sending manager invitation email:', emailError);
      }

      res.status(201).json({
        success: true,
        message: 'Manager invitation sent successfully',
        invitationId: result.insertId
      });
    } catch (error) {
      console.error('Error inviting manager:', error);
      res.status(500).json({ error: 'Failed to invite manager' });
    }
  },

  async verifyInvitation(req, res) {
    try {
      const { token } = req.params;
      const [rows] = await db.execute(
        'SELECT * FROM manager_invitations WHERE token = ? AND status = "pending"',
        [token]
      );
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Invalid or expired invitation' });
      }
      res.json({
        success: true,
        email: rows[0].email,
        role: rows[0].role
      });
    } catch (error) {
      console.error('Error verifying invitation:', error);
      res.status(500).json({ error: 'Failed to verify invitation' });
    }
  },

  async registerFromInvitation(req, res) {
    try {
      const { token, nom, prenom, mdp, adresse, jobtitle, departement } = req.body;
      const password = req.body.password || mdp;
      if (!token || !nom || !prenom || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const [invitationRows] = await db.execute(
        'SELECT * FROM manager_invitations WHERE token = ? AND status = "pending"',
        [token]
      );
      if (invitationRows.length === 0) {
        return res.status(404).json({ error: 'Invalid or expired invitation' });
      }
      const invitation = invitationRows[0];
      const existingUser = await User.getByEmail(invitation.email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }
      const userId = await User.create({
        nom, prenom, email: invitation.email, password, role: invitation.role,
        adresse: adresse || null, jobtitle: jobtitle || null, departement: departement || null
      });
      await db.execute('UPDATE manager_invitations SET status = "accepted" WHERE id = ?', [invitation.id]);
      const newUser = await User.getById(userId);
      res.status(201).json({
        success: true,
        message: 'ajout avec succes',
        user: { ...newUser, password: undefined }
      });
    } catch (error) {
      console.error('Error registering from invitation:', error);
      res.status(500).json({ error: 'Failed to register from invitation' });
    }
  },

  async getUserNotifications(req, res) {
    try {
      const { id } = req.params;
      const [notifications] = await db.execute(
        `SELECT * FROM notifications WHERE id_user = ? ORDER BY created_at DESC LIMIT 50`,
        [id]
      );
      const [invitations] = await db.execute(
        `SELECT id_invitation, status FROM reservation_invitations WHERE id_user = ? OR email = (SELECT email FROM users WHERE id = ?)`,
        [id, id]
      );
      const invitationStatuses = {};
      invitations.forEach(inv => {
        invitationStatuses[String(inv.id_invitation)] = String(inv.status).toLowerCase();
      });
      const filteredNotifications = notifications.filter(notif => {
        if (notif.is_read == 1 || notif.is_read === true) return false;
        const type = String(notif.type).toLowerCase();
        if (type !== 'reservation_invitation') return true;
        try {
          const data = typeof notif.data === 'string' ? JSON.parse(notif.data) : notif.data;
          const invitationId = data?.invitation_id || data?.id_invitation || data?.id;
          if (!invitationId) return true;
          const status = invitationStatuses[String(invitationId)];
          return status === 'pending';
        } catch (e) { return true; }
      });
      res.json(filteredNotifications);
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  },

  async markNotificationAsRead(req, res) {
    try {
      const { id } = req.params;
      const numericId = parseInt(id);
      console.log('Marking notification as read. ID:', id);
      const [result] = await db.execute(
        'UPDATE notifications SET is_read = 1 WHERE id_notification = ? OR id_notification = ?',
        [id, numericId]
      );
      if (result.affectedRows === 0) {
        await db.execute('UPDATE notifications SET is_read = 1 WHERE id = ? OR id = ?', [id, numericId]);
      }
      res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ error: 'Failed to update notification' });
    }
  },

  async healthCheck(req, res) {
    try {
      await db.execute('SELECT 1 as test');
      res.json({ status: 'healthy', database: 'connected', timestamp: new Date().toISOString() });
    } catch (error) {
      res.status(500).json({ status: 'unhealthy', database: 'disconnected', timestamp: new Date().toISOString() });
    }
  }
};

module.exports = additionalController;
