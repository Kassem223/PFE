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
        // Lien direct vers la page frontend d'inscription
        const acceptUrl = `http://localhost:5173/signup?token=${token}`;
        console.log('Sending email to:', email);
        console.log('Accept URL:', acceptUrl);
        
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
        
        console.log('Mail options:', JSON.stringify(mailOptions, null, 2));
        
        const transporter = require('../config/email').transporter;
        const info = await new Promise((resolve, reject) => {
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error('Email send error:', error);
              reject(error);
            } else {
              console.log('Email sent successfully:', info);
              resolve(info);
            }
          });
        });
        
        console.log('Email sent, messageId:', info.messageId);
      } catch (emailError) {
        console.error('Error sending manager invitation email:', emailError);
        console.error('Error stack:', emailError.stack);
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

      const invitation = rows[0];
      
      // Retourner les infos de l'invitation au frontend
      res.json({
        success: true,
        email: invitation.email,
        role: invitation.role
      });
    } catch (error) {
      console.error('Error verifying invitation:', error);
      res.status(500).json({ error: 'Failed to verify invitation' });
    }
  },

  async registerFromInvitation(req, res) {
    try {
      console.log('=== REGISTER FROM INVITATION ===');
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      
      const { token, nom, prenom, email, mdp, adresse, jobtitle, departement } = req.body;
      
      // Accepter soit 'password' soit 'mdp'
      const password = req.body.password || mdp;
      
      console.log('Parsed fields:', { token, nom, prenom, password, email, adresse, jobtitle, departement });
      
      if (!token || !nom || !prenom || !password) {
        console.log('Missing required fields:', { token: !!token, nom: !!nom, prenom: !!prenom, password: !!password });
        return res.status(400).json({ error: 'Missing required fields: token, nom, prenom, password' });
      }

      // Verify invitation
      const [invitationRows] = await db.execute(
        'SELECT * FROM manager_invitations WHERE token = ? AND status = "pending"',
        [token]
      );

      if (invitationRows.length === 0) {
        console.log('No invitation found for token:', token);
        return res.status(404).json({ error: 'Invalid or expired invitation' });
      }

      const invitation = invitationRows[0];
      console.log('Found invitation:', invitation);

      // Check if user already exists
      const existingUser = await User.getByEmail(invitation.email);
      if (existingUser) {
        console.log('User already exists with email:', invitation.email);
        return res.status(400).json({ error: 'User already exists' });
      }

      console.log('Creating user with data:', {
        nom,
        prenom,
        email: invitation.email,
        role: invitation.role,
        adresse: adresse || null,
        jobtitle: jobtitle || null,
        departement: departement || null
      });

      // Create user avec tous les champs
      const userId = await User.create({
        nom,
        prenom,
        email: invitation.email,
        password,
        role: invitation.role,
        adresse: adresse || null,
        jobtitle: jobtitle || null,
        departement: departement || null
      });

      console.log('User created with ID:', userId);

      // Update invitation status
      await db.execute(
        'UPDATE manager_invitations SET status = "accepted" WHERE id = ?',
        [invitation.id]
      );

      console.log('Invitation updated to accepted');

      // Get the created user
      const newUser = await User.getById(userId);
      console.log('Retrieved new user:', newUser);
      
      res.status(201).json({
        success: true,
        message: 'ajout avec succes',
        user: { ...newUser, password: undefined }
      });
    } catch (error) {
      console.error('Error registering from invitation:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ error: 'Failed to register from invitation' });
    }
  },

  async getUserNotifications(req, res) {
    try {
      const { id } = req.params;
      
      const [rows] = await db.execute(
        `SELECT * FROM notifications WHERE id_user = ? ORDER BY created_at DESC LIMIT 50`,
        [id]
      );

      res.json(rows);
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  },

  async healthCheck(req, res) {
    try {
      // Test database connection
      const [testResult] = await db.execute('SELECT 1 as test');
      
      res.json({
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Health check failed:', error);
      res.status(500).json({
        status: 'unhealthy',
        database: 'disconnected',
        timestamp: new Date().toISOString()
      });
    }
  }
};

module.exports = additionalController;
