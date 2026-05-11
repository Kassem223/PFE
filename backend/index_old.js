const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const nodemailer = require('nodemailer');
const axios = require('axios');
const crypto = require('crypto'); // Add this at the top of the file to use for token generation
require('dotenv').config();


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Get invitations for multiple reservation IDs
app.get('/api/reservations/invitations', async (req, res) => {
  try {
    let { ids } = req.query;
    if (!ids) {
      return res.status(400).json({ error: 'Missing ids parameter' });
    }
    // Support both comma-separated string and array
    if (typeof ids === 'string') {
      ids = ids.split(',').map(id => id.trim()).filter(Boolean);
    }
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Invalid ids parameter' });
    }
    // Build placeholders for SQL IN clause
    const placeholders = ids.map(() => '?').join(',');
    const [invitations] = await db.execute(
      `SELECT id_invitation, id_reservation, id_user, email, type, status, refusal_reason, token, invited_by, created_at, responded_at
       FROM reservation_invitations
       WHERE id_reservation IN (${placeholders})`,
      ids
    );
    res.json(invitations);
  } catch (error) {
    console.error('Error fetching invitations for multiple reservations:', error);
    res.status(500).json({ error: 'Failed to fetch invitations for multiple reservations' });
  }
});

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Database connection
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vektor_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Database migration to add missing columns
db.getConnection(async (err, connection) => {
  if (err) {
    console.error('Error getting database connection for migration:', err);
    return;
  }
  
  try {
    // Check and add adresse column
    try {
      await connection.execute('ALTER TABLE users ADD COLUMN adresse VARCHAR(255)');
      console.log('Added adresse column to users table');
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME') {
        console.error('Error adding adresse column:', error);
      }
    }

    // Check and add jobtitle column
    try {
      await connection.execute('ALTER TABLE users ADD COLUMN jobtitle VARCHAR(255)');
      console.log('Added jobtitle column to users table');
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME') {
        console.error('Error adding jobtitle column:', error);
      }
    }

    // Check and add profile_picture column
    try {
      await connection.execute('ALTER TABLE users ADD COLUMN profile_picture VARCHAR(255)');
      console.log('Added profile_picture column to users table');
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME') {
        console.error('Error adding profile_picture column:', error);
      }
    }

    console.log('Database migration completed');
  } catch (error) {
    console.error('Error during database migration:', error);
  } finally {
    connection.release();
  }
});

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Helper function to send invitation email
const sendInvitationEmail = async (recipientEmail, reservationId, invitationId) => {
  const acceptUrl = `http://localhost:3000/api/invitations/${invitationId}/accept`;
  const refuseUrl = `http://localhost:3000/api/invitations/${invitationId}/refuse`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: 'Invitation à une réservation - VEKTOR',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">VEKTOR</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Gestion des Réservations</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Vous êtes invité à une réservation!</h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; color: #666; font-size: 16px;">
              Vous avez été invité à rejoindre une réservation. Veuillez cliquer sur l'un des boutons ci-dessous pour répondre à cette invitation.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${acceptUrl}" style="display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">
              ✅ Accepter
            </a>
            <a href="${refuseUrl}" style="display: inline-block; background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              ❌ Refuser
            </a>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin-top: 20px;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>Si les boutons ne fonctionnent pas:</strong><br>
              Copiez-collez ces liens dans votre navigateur:
            </p>
            <div style="margin-top: 10px; font-size: 12px; word-break: break-all;">
              <p style="margin: 5px 0;"><strong>Accepter:</strong><br>${acceptUrl}</p>
              <p style="margin: 5px 0;"><strong>Refuser:</strong><br>${refuseUrl}</p>
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 12px;">
          <p>Ce lien d'invitation expirera après 30 jours.</p>
          <p>Si vous avez des questions, contactez l'administrateur du système.</p>
        </div>
      </div>
    `
  };
  
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve(info);
      }
    });
  });
};

// Chatbot API endpoint with Ollama Mistral integration
app.post('/api/chatbot', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Read company information from the text file
    const fs = require('fs').promises;
    const companyInfoPath = require('path').join(__dirname, 'company_info.txt');
    
    let companyContext = '';
    try {
      companyContext = await fs.readFile(companyInfoPath, 'utf8');
    } catch (error) {
      console.log('Company info file not found, using default context');
      companyContext = 'VEKTOR est une entreprise de gestion des ressources et réservations.';
    }

    // Create the enhanced prompt with company context
    const enhancedPrompt = `
Contexte de l'entreprise:
${companyContext}

Question de l'utilisateur: ${message}

Réponds en français de manière professionnelle et utile. Si la question concerne l'entreprise, utilise les informations fournies dans le contexte. Sinon, réponds de manière générale mais en gardant le contexte professionnel d'une entreprise de gestion de ressources.
    `;

    // Call Ollama API with Mistral model
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'mistral',
      prompt: enhancedPrompt,
      stream: false
    }, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.response) {
      res.json({
        response: response.data.response.trim()
      });
    } else {
      throw new Error('Invalid response from Ollama');
    }

  } catch (error) {
    console.error('Chatbot error:', error.message);
    res.status(500).json({ 
      error: 'Failed to process chat request',
      details: error.message 
    });
  }
});

// Statistics API endpoints
app.get('/api/statistics/admin', async (req, res) => {
  try {
    const queries = {
      // Basic counts
      totalAccounts: 'SELECT COUNT(*) as count FROM users',
      managerAccounts: 'SELECT COUNT(*) as count FROM users WHERE role = "manager"',
      adminAccounts: 'SELECT COUNT(*) as count FROM users WHERE role = "admin"',
      userAccounts: 'SELECT COUNT(*) as count FROM users WHERE role = "user"',
      recentAccounts: 'SELECT COUNT(*) as count FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)',
      
      // Account statistics
      accountsByRole: `
        SELECT role, COUNT(*) as count 
        FROM users 
        GROUP BY role 
        ORDER BY count DESC
      `,
      accountsByDepartment: `
        SELECT departement, COUNT(*) as count 
        FROM users 
        WHERE departement IS NOT NULL 
        GROUP BY departement 
        ORDER BY count DESC
      `,
      monthlyRegistrations: `
        SELECT DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as count 
        FROM users 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(created_at, "%Y-%m") 
        ORDER BY month DESC
      `,
      
      // Reservation statistics
      totalReservations: 'SELECT COUNT(*) as count FROM reservations',
      activeReservations: 'SELECT COUNT(*) as count FROM reservations WHERE statut = "acceptée"',
      completedReservations: 'SELECT COUNT(*) as count FROM reservations WHERE statut = "terminée"',
      equipementCount: 'SELECT COUNT(*) as count FROM equipement',
      
      // Manager reservations
      managerReservations: `
        SELECT u.nom, u.prenom, COUNT(r.id_reservation) as reservation_count
        FROM users u 
        LEFT JOIN reservations r ON u.id = r.id_user
        WHERE u.role = 'manager' 
        GROUP BY u.id, u.nom, u.prenom 
        ORDER BY reservation_count DESC 
        LIMIT 10
      `,
      
      // Reservations by creator role
      reservationsByCreatorRole: `
        SELECT 
          CASE 
            WHEN u.role = 'administrateur' THEN 'admin'
            WHEN u.role = 'admin' THEN 'admin'
            ELSE u.role
          END as creator_role,
          COUNT(r.id_reservation) as count 
        FROM reservations r 
        JOIN users u ON r.id_user = u.id 
        GROUP BY u.role 
        ORDER BY count DESC
      `,
      
      // Monthly activity by role
      monthlyActivityByRole: `
        SELECT 
          DATE_FORMAT(r.created_at, "%Y-%m") as month,
          CASE 
            WHEN u.role = 'administrateur' THEN 'admin'
            WHEN u.role = 'admin' THEN 'admin'
            ELSE u.role
          END as role,
          COUNT(r.id_reservation) as count
        FROM reservations r 
        JOIN users u ON r.id_user = u.id 
        WHERE r.created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(r.created_at, "%Y-%m"), u.role 
        ORDER BY month DESC, count DESC
      `,
      
      // Recent registrations by role
      recentRegistrationsByRole: `
        SELECT 
          role,
          COUNT(*) as count
        FROM users 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY role 
        ORDER BY count DESC
      `,
      
      // Department activity
      departmentActivity: `
        SELECT 
          u.departement,
          COUNT(DISTINCT u.id) as user_count,
          COUNT(r.id_reservation) as reservation_count
        FROM users u 
        LEFT JOIN reservations r ON u.id = r.id_user 
        WHERE u.departement IS NOT NULL
        GROUP BY u.departement 
        ORDER BY reservation_count DESC
      `,
      
      // Top active users
      topActiveUsers: `
        SELECT 
          u.nom, 
          u.prenom, 
          u.role,
          COUNT(r.id_reservation) as reservation_count,
          MAX(r.created_at) as last_activity
        FROM users u 
        LEFT JOIN reservations r ON u.id = r.id_user 
        WHERE u.role IN ('manager', 'admin')
        GROUP BY u.id, u.nom, u.prenom, u.role 
        HAVING reservation_count > 0
        ORDER BY reservation_count DESC 
        LIMIT 10
      `
    };

    const results = {};
    const errors = {};

    // Execute all queries sequentially for better error handling
    for (const [key, query] of Object.entries(queries)) {
      try {
        console.log(`Executing query: ${key}`);
        const [rows] = await db.execute(query);
        results[key] = rows;
        console.log(`Query ${key} completed successfully with ${rows.length} rows`);
      } catch (error) {
        console.error(`Error in query ${key}:`, error);
        errors[key] = error.message;
        results[key] = [];
      }
    }

    if (Object.keys(errors).length > 0) {
      console.log('Some queries failed:', errors);
    }

    res.json(results);
  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch admin statistics',
      details: error.message 
    });
  }
});

// Simple test endpoint for manager statistics
app.get('/api/statistics/manager/test', async (req, res) => {
  try {
    console.log('Manager statistics test endpoint called');
    
    // Initialize database connection
    const [testResult] = await db.execute('SELECT 1 as test');
    console.log('Database connection test successful:', testResult);
    
    // Run database migration to add missing columns to users table
    
    // Test basic users query
    const [usersResult] = await db.execute('SELECT COUNT(*) as count FROM users');
    console.log('Users query successful:', usersResult);
    
    res.json({
      success: true,
      message: 'Manager statistics test successful',
      databaseConnection: 'OK',
      userCount: usersResult[0].count
    });
  } catch (error) {
    console.error('Manager statistics test failed:', error);
    res.status(500).json({ 
      error: 'Manager statistics test failed',
      details: error.message 
    });
  }
});

app.get('/api/statistics/manager', async (req, res) => {
  try {
    console.log('Manager statistics endpoint called');
    
    const queries = {
      totalReservations: 'SELECT COUNT(*) as count FROM reservations',
      activeReservations: 'SELECT COUNT(*) as count FROM reservations WHERE statut = "acceptée"',
      pendingReservations: 'SELECT COUNT(*) as count FROM reservations WHERE statut = "en attente"',
      completedReservations: 'SELECT COUNT(*) as count FROM reservations WHERE statut = "terminée"',
      cancelledReservations: 'SELECT COUNT(*) as count FROM reservations WHERE statut = "refusée"',
      equipementCount: 'SELECT COUNT(*) as count FROM equipement',
      availableEquipment: 'SELECT COUNT(*) as count FROM equipement WHERE status = "disponible"',
      maintenanceEquipment: 'SELECT COUNT(*) as count FROM equipement WHERE status = "maintenance"',
      
      reservationsByStatus: `
        SELECT statut, COUNT(*) as count 
        FROM reservations 
        GROUP BY statut 
        ORDER BY count DESC
      `,
      
      reservationsByMonth: `
        SELECT DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as count 
        FROM reservations 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(created_at, "%Y-%m") 
        ORDER BY month DESC
      `,
      
      equipementByStatus: `
        SELECT status, COUNT(*) as count 
        FROM equipement 
        GROUP BY status 
        ORDER BY count DESC
      `,
      
      recentReservations: `
        SELECT r.*, u.prenom, u.nom, e.nom as equipement_nom
        FROM reservations r
        JOIN users u ON r.id_user = u.id
        JOIN equipement e ON r.id_equipement = e.id_equipement
        ORDER BY r.created_at DESC
        LIMIT 10
      `
    };

    const results = {};
    const errors = {};

    // Execute all queries sequentially for better error handling
    for (const [key, query] of Object.entries(queries)) {
      try {
        console.log(`Executing manager query: ${key}`);
        const [rows] = await db.execute(query);
        results[key] = rows;
        console.log(`Manager query ${key} completed successfully with ${rows.length} rows`);
      } catch (error) {
        console.error(`Error in manager query ${key}:`, error);
        errors[key] = error.message;
        results[key] = [];
      }
    }

    if (Object.keys(errors).length > 0) {
      console.log('Some manager queries failed:', errors);
    }

    console.log('Manager statistics completed, returning results');
    res.json(results);
  } catch (error) {
    console.error('Error fetching manager statistics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch manager statistics',
      details: error.message 
    });
  }
});

// Authentication endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    
    // Check if user has password (mdp field)
    if (!user.mdp) {
      console.error('Password field is undefined for user:', user.email);
      return res.status(500).json({ error: 'User account is not properly configured' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.mdp);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Remove password from response
    const { mdp: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User management endpoints
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM users ORDER BY created_at DESC');
    const usersWithoutPasswords = rows.map(({ password, ...user }) => user);
    res.json(usersWithoutPasswords);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { nom, prenom, email, password, role, departement } = req.body;
    
    if (!nom || !prenom || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if email already exists
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await db.execute(
      'INSERT INTO users (nom, prenom, email, mdp, role, departement) VALUES (?, ?, ?, ?, ?, ?)',
      [nom, prenom, email, hashedPassword, role, departement ?? null]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenom, email, role, departement, adresse, jobtitle, profile_image } = req.body;
    
    const [result] = await db.execute(
      'UPDATE users SET nom = ?, prenom = ?,  departement = ?, adresse = ?, jobtitle = ?, profile_picture = ? WHERE id = ?',
      [nom ?? null, prenom ?? null, departement ?? null, adresse ?? null, jobtitle ?? null, profile_image ?? null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await db.execute('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Resource management endpoints
app.get('/api/resources', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM resources ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

app.post('/api/resources', async (req, res) => {
  try {
    const { name, description, status, image_url } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const [result] = await db.execute(
      'INSERT INTO resources (name, description, status, image_url) VALUES (?, ?, ?, ?)',
      [name, description ?? null, status ?? 'active', image_url ?? null]
    );

    res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      resourceId: result.insertId
    });
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

app.put('/api/resources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, image_url } = req.body;
    
    const [result] = await db.execute(
      'UPDATE resources SET name = ?, description = ?, status = ?, image_url = ? WHERE id = ?',
      [name, description ?? null, status ?? 'active', image_url ?? null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.json({
      success: true,
      message: 'Resource updated successfully'
    });
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ error: 'Failed to update resource' });
  }
});

app.get('/api/resources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT * FROM resources WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({ error: 'Failed to fetch resource' });
  }
});

app.delete('/api/resources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await db.execute('DELETE FROM resources WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ error: 'Failed to delete resource' });
  }
});

// Equipment endpoints
app.get('/api/resources/:id/equipment', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute(
      'SELECT * FROM equipement WHERE id_ressources = ?',
      [id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching equipement:', error);
    res.status(500).json({ error: 'Failed to fetch equipement' });
  }
});

app.post('/api/resources/:id/equipment', async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, status, details, image_url } = req.body;
    
    if (!nom) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const [result] = await db.execute(
      'INSERT INTO equipement (id_ressources, nom, status, details, image_url) VALUES (?, ?, ?, ?, ?)',
      [id, nom, status || 'disponible', details || null, image_url || null]
    );

    res.status(201).json({
      success: true,
      message: 'Equipment created successfully',
      equipementId: result.insertId
    });
  } catch (error) {
    console.error('Error creating equipement:', error);
    res.status(500).json({ error: 'Failed to create equipement' });
  }
});

app.put('/api/equipement/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, status, details, image_url } = req.body;
    
    const [result] = await db.execute(
      'UPDATE equipement SET nom = ?, status = ?, details = ?, image_url = ? WHERE id_equipement = ?',
      [nom, status ?? 'disponible', details ?? null, image_url ?? null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    res.json({
      success: true,
      message: 'Equipment updated successfully'
    });
  } catch (error) {
    console.error('Error updating equipement:', error);
    res.status(500).json({ error: 'Failed to update equipement' });
  }
});

app.delete('/api/equipement/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await db.execute('DELETE FROM equipement WHERE id_equipement = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    res.json({
      success: true,
      message: 'Equipment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting equipement:', error);
    res.status(500).json({ error: 'Failed to delete equipement' });
  }
});

// Update equipment endpoint
app.put('/api/equipement/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, status, details, image_url } = req.body;
    
    const [result] = await db.execute(
      'UPDATE equipement SET nom = ?, status = ?, details = ?, image_url = ? WHERE id_equipement = ?',
      [nom, status, details, image_url, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    res.json({
      success: true,
      message: 'Equipment updated successfully'
    });
  } catch (error) {
    console.error('Error updating equipement:', error);
    res.status(500).json({ error: 'Failed to update equipement' });
  }
});

// Get reservations for specific equipment
app.get('/api/equipment/:id/reservations', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute(`
      SELECT r.*, u.prenom, u.nom, e.nom as equipement_nom, e.status as equipement_status
      FROM reservations r
      JOIN users u ON r.id_user = u.id
      JOIN equipement e ON r.id_equipement = e.id_equipement
      WHERE r.id_equipement = ?
      ORDER BY r.created_at DESC
    `, [id]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching equipment reservations:', error);
    res.status(500).json({ error: 'Failed to fetch equipment reservations' });
  }
});

// Reservation endpoints
app.get('/api/reservations', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT r.*, u.prenom, u.nom, e.nom as equipement_nom, e.status as equipement_status
      FROM reservations r
      JOIN users u ON r.id_user = u.id
      JOIN equipement e ON r.id_equipement = e.id_equipement
      ORDER BY r.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

app.get('/api/reservations/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await db.execute(`
      SELECT r.*, u.prenom, u.nom, e.nom as equipement_nom, e.status as equipement_status
      FROM reservations r
      JOIN users u ON r.id_user = u.id
      JOIN equipement e ON r.id_equipement = e.id_equipement
      WHERE r.id_user = ?
      ORDER BY r.created_at DESC
    `, [userId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching user reservations:', error);
    res.status(500).json({ error: 'Failed to fetch user reservations' });
  }
});

app.post('/api/reservations', async (req, res) => {
  try {
    const { id_equipement, id_user, date_reservation, time_start, time_end, nombre_personnes } = req.body;
    
    if (!id_equipement || !id_user || !date_reservation || !time_start || !time_end) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    const [result] = await db.execute(
      'INSERT INTO reservations (id_equipement, id_user, date_reservation, time_start, time_end, nombre_personnes, statut) VALUES (?, ?, ?, ?, ?, ?, "en attente")',
      [id_equipement, id_user, date_reservation, time_start, time_end, nombre_personnes || 1]
    );

    res.status(201).json({
      success: true,
      message: 'Reservation created successfully',
      reservationId: result.insertId
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ error: 'Failed to create reservation' });
  }
});

// Create reservation with invitations
app.post('/api/reservations/with-invitations', async (req, res) => {
  try {
    const { 
      id_equipement, 
      id_user, 
      date_reservation, 
      time_start, 
      time_end, 
      nombre_personnes,
      internal_users = [],
      external_emails = []
    } = req.body;
    
    if (!id_equipement || !id_user || !date_reservation || !time_start || !time_end) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Create the main reservation
      const [reservationResult] = await connection.execute(
        'INSERT INTO reservations (id_equipement, id_user, date_reservation, time_start, time_end, nombre_personnes, statut) VALUES (?, ?, ?, ?, ?, ?, "acceptée")',
        [id_equipement, id_user, date_reservation, time_start, time_end, nombre_personnes || 1]
      );

      const reservationId = reservationResult.insertId;


      // Store invitations for internal users and send emails
      if (internal_users.length > 0) {
        for (const userId of internal_users) {
          const token = crypto.randomBytes(16).toString('hex'); // Generate unique token
          const [result] = await connection.execute(
            'INSERT INTO reservation_invitations (id_reservation, id_user, type, status, invited_by, token, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
            [reservationId, userId, 'internal', 'en_attente', id_user, token]
          );
          // Fetch user email from users table
          const [[userRow]] = await connection.execute('SELECT email FROM users WHERE id = ?', [userId]);
          if (userRow && userRow.email) {
            try {
              await sendInvitationEmail(userRow.email, reservationId, result.insertId);
            } catch (e) {
              console.error('Failed to send invitation email to internal user:', userRow.email, e);
            }
          }
        }
      }

      // Store invitations for external users and send emails
      if (external_emails.length > 0) {
        for (const email of external_emails) {
          const token = crypto.randomBytes(16).toString('hex'); // Generate unique token
          const [result] = await connection.execute(
            'INSERT INTO reservation_invitations (id_reservation, email, type, status, invited_by, token, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
            [reservationId, email, 'external', 'en_attente', id_user, token]
          );
          try {
            await sendInvitationEmail(email, reservationId, result.insertId);
          } catch (e) {
            console.error('Failed to send invitation email to external user:', email, e);
          }
        }
      }

      await connection.commit();

      res.status(201).json({
        success: true,
        message: 'Reservation created successfully with invitations',
        reservationId: reservationId,
        invitedUsers: internal_users.length,
        invitedEmails: external_emails.length
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating reservation with invitations:', error);
    res.status(500).json({ error: 'Failed to create reservation with invitations' });
  }
});

// Create reservation with multiple equipment
app.post('/api/reservations/multi', async (req, res) => {
  try {
    const { 
      id_user, 
      date_reservation, 
      time_start, 
      time_end, 
      nombre_personnes,
      equipments = [],
      internal_users = [],
      external_emails = []
    } = req.body;
    
    if (!id_user || !date_reservation || !time_start || !time_end || !equipments || equipments.length === 0) {
      return res.status(400).json({ error: 'Required fields are missing or no equipments provided' });
    }

    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      const reservationIds = [];

      // Create a reservation for each equipment
      for (const id_equipement of equipments) {
        const [reservationResult] = await connection.execute(
          'INSERT INTO reservations (id_equipement, id_user, date_reservation, time_start, time_end, nombre_personnes, statut) VALUES (?, ?, ?, ?, ?, ?, "acceptée")',
          [id_equipement, id_user, date_reservation, time_start, time_end, nombre_personnes || 1]
        );

        reservationIds.push(reservationResult.insertId);

        // Insert invitations for each reservation if provided
        if (internal_users.length > 0) {
          for (const userId of internal_users) {
            await connection.execute(
              'INSERT INTO reservation_invitations (id_reservation, id_user, type, status, invited_by, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
              [reservationResult.insertId, userId, 'internal', 'en_attente', id_user]
            );
          }
        }

        if (external_emails.length > 0) {
          for (const email of external_emails) {
            await connection.execute(
              'INSERT INTO reservation_invitations (id_reservation, email, type, status, invited_by, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
              [reservationResult.insertId, email, 'external', 'en_attente', id_user]
            );
          }
        }
      }

      await connection.commit();

      res.status(201).json({
        success: true,
        message: 'Multi-equipment reservations created successfully',
        reservationIds: reservationIds,
        equipmentCount: equipments.length,
        invitedUsers: internal_users.length,
        invitedEmails: external_emails.length
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating multi-equipment reservations:', error);
    res.status(500).json({ error: 'Failed to create multi-equipment reservations' });
  }
});

app.put('/api/reservations/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, description } = req.body;
    
    const [result] = await db.execute(
      'UPDATE reservations SET statut = ?, description = ? WHERE id_reservation = ?',
      [status, description ?? null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    res.json({
      success: true,
      message: 'Reservation status updated successfully'
    });
  } catch (error) {
    console.error('Error updating reservation status:', error);
    res.status(500).json({ error: 'Failed to update reservation status' });
  }
});

// Cancel reservation endpoint
app.put('/api/reservations/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await db.execute(
      'UPDATE reservations SET statut = ? WHERE id_reservation = ?',
      ['annulée', id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    res.json({
      success: true,
      message: 'Reservation cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    res.status(500).json({ error: 'Failed to cancel reservation' });
  }
});

app.delete('/api/reservations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await db.execute('DELETE FROM reservations WHERE id_reservation = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    res.json({
      success: true,
      message: 'Reservation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    res.status(500).json({ error: 'Failed to delete reservation' });
  }
});

// Get reservation details including invitation statuses
app.get('/api/reservations/:id/details', async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch reservation details
    const [[reservation]] = await db.execute(
      `SELECT id_reservation, id_equipement, id_user, date_reservation, time_start, time_end, nombre_personnes, total_participants, statut, created_at, updated_at, description
       FROM reservations
       WHERE id_reservation = ?`,
      [id]
    );

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    // Fetch invitation statuses
    const [invitations] = await db.execute(
      `SELECT id_invitation, id_user, email, type, status, refusal_reason, responded_at
       FROM reservation_invitations
       WHERE id_reservation = ?`,
      [id]
    );

    res.json({
      success: true,
      reservation,
      invitations
    });
  } catch (error) {
    console.error('Error fetching reservation details:', error);
    res.status(500).json({ error: 'Failed to fetch reservation details' });
  }
});

// Get reservation invitations (internal users invited to this reservation)
app.get('/api/reservations/:id/invitations', async (req, res) => {
  try {
    const { id } = req.params;
    // Fetch invitations from reservation_invitations table
    const [invitations] = await db.execute(
      `SELECT id_invitation, id_reservation, id_user, email, type, status, refusal_reason, token, invited_by, created_at, responded_at
       FROM reservation_invitations
       WHERE id_reservation = ?`,
      [id]
    );
    res.json(invitations);
  } catch (error) {
    console.error('Error fetching reservation invitations:', error);
    res.status(500).json({ error: 'Failed to fetch reservation invitations' });
  }
});

// Upload endpoint
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'vektor',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    public_id: (req, file) => Date.now() + '-' + file.originalname
  }
});

const upload = multer({ storage: storage });

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  res.json({
    success: true,
    url: req.file.path,
    filename: req.file.filename
  });
});

// Generate unique token function
const generateToken = () => {
  return require('crypto').randomBytes(32).toString('hex');
};

// Invite manager endpoint
app.post('/api/invite-manager', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if invitation already exists
    const [existingInvitation] = await db.execute(
      'SELECT id FROM manager_invitations WHERE email = ? AND status = "pending"',
      [email]
    );

    if (existingInvitation.length > 0) {
      return res.status(400).json({ error: 'Invitation already sent to this email' });
    }

    // Generate unique token
    const token = generateToken();
    
    // Create invitation record (nom and prenom will be filled during registration)
    const [result] = await db.execute(
      'INSERT INTO manager_invitations (email, token) VALUES (?, ?)',
      [email, token]
    );

    // Log invitation creation
    await db.execute(
      'INSERT INTO invitation_logs (invitation_id, action, ip_address) VALUES (?, "created", ?)',
      [result.insertId, req.ip]
    );

    // Create invitation link
    const invitationLink = `http://localhost:3001/signup?token=${token}`;

    // Send invitation email
    const mailOptions = {
      from: process.env.GMAIL_EMAIL,
      to: email,
      subject: 'Invitation à rejoindre VEKTOR - Compte Manager',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">VEKTOR</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Gestion des Réservations</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Invitation à rejoindre VEKTOR!</h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0; color: #666; font-size: 16px;">
                Bonjour,<br><br>
                Vous avez été invité à rejoindre VEKTOR en tant que Manager. 
                Pour compléter votre inscription et créer votre compte, veuillez cliquer sur le bouton ci-dessous.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${invitationLink}" style="display: inline-block; background: #2196f3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                🚀 Compléter mon inscription
              </a>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin-top: 20px;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>Important:</strong><br>
                • Ce lien d'invitation expirera après 30 jours<br>
                • Vous devrez fournir vos informations personnelles et définir votre mot de passe<br>
                • Assurez-vous d'utiliser l'adresse email: ${email}
              </p>
            </div>
            
            <div style="background: #e3f2fd; border: 1px solid #2196f3; border-radius: 5px; padding: 15px; margin-top: 20px;">
              <p style="margin: 0; color: #1976d2; font-size: 14px;">
                <strong>Si le bouton ne fonctionne pas:</strong><br>
                Copiez-collez ce lien dans votre navigateur:<br>
                <span style="word-break: break-all; font-size: 12px;">${invitationLink}</span>
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 12px;">
            <p>Ce lien d'invitation expirera après 30 jours.</p>
            <p>Si vous avez des questions, contactez l'administrateur du système.</p>
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);

    // Log email sent
    await db.execute(
      'INSERT INTO invitation_logs (invitation_id, action, ip_address) VALUES (?, "sent", ?)',
      [result.insertId, req.ip]
    );
    
    res.status(201).json({
      success: true,
      message: 'Invitation sent successfully',
      invitationId: result.insertId
    });
  } catch (error) {
    console.error('Error inviting manager:', error);
    res.status(500).json({ error: 'Failed to send invitation' });
  }
});

// Verify invitation endpoint (matches InvitedSignup component expectations)
app.get('/api/verify-invitation/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const [invitation] = await db.execute(
      'SELECT * FROM manager_invitations WHERE token = ? AND status = "pending" AND expires_at > NOW()',
      [token]
    );

    if (invitation.length === 0) {
      return res.status(404).json({ error: 'Invalid or expired invitation' });
    }

    // Log invitation click
    await db.execute(
      'INSERT INTO invitation_logs (invitation_id, action, ip_address, user_agent) VALUES (?, "clicked", ?, ?)',
      [invitation[0].id, req.ip, req.get('User-Agent')]
    );

    // Return data in format expected by InvitedSignup component
    res.json({
      email: invitation[0].email,
      nom: invitation[0].nom || '',
      prenom: invitation[0].prenom || '',
      role: 'manager'
    });
  } catch (error) {
    console.error('Error verifying invitation:', error);
    res.status(500).json({ error: 'Failed to verify invitation' });
  }
});

// Register from invitation endpoint (matches InvitedSignup component expectations)
app.post('/api/register-from-invitation', async (req, res) => {
  try {
    const { token, nom, prenom, email, mdp, adresse, jobtitle, departement } = req.body;
    
    if (!token || !nom || !prenom || !email || !mdp) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    if (mdp.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Verify invitation
    const [invitation] = await db.execute(
      'SELECT * FROM manager_invitations WHERE token = ? AND status = "pending" AND expires_at > NOW()',
      [token]
    );

    if (invitation.length === 0) {
      return res.status(404).json({ error: 'Invalid or expired invitation' });
    }

    const inv = invitation[0];

    // Check if user already exists
    const [existingUser] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(mdp, 10);
    
    // Create user account
    const [userResult] = await db.execute(
      'INSERT INTO users (nom, prenom, email, mdp, role, departement, adresse, jobtitle) VALUES (?, ?, ?, ?, "manager", ?, ?, ?)',
      [nom, prenom, email, hashedPassword, departement ?? null, adresse ?? null, jobtitle ?? null]
    );

    // Update invitation status
    await db.execute(
      'UPDATE manager_invitations SET status = "accepted", accepted_at = NOW() WHERE id = ?',
      [inv.id]
    );

    // Log registration completion
    await db.execute(
      'INSERT INTO invitation_logs (invitation_id, action, ip_address, user_agent) VALUES (?, "accepted", ?, ?)',
      [inv.id, req.ip, req.get('User-Agent')]
    );

    // Return user data in format expected by InvitedSignup component
    res.status(201).json({
      user: {
        id: userResult.insertId,
        nom: nom,
        prenom: prenom,
        email: email,
        role: 'manager',
        departement: departement ?? null,
        adresse: adresse ?? null,
        jobtitle: jobtitle ?? null
      }
    });
  } catch (error) {
    console.error('Error completing registration:', error);
    res.status(500).json({ error: 'Failed to complete registration' });
  }
});

// User notifications endpoint
app.get('/api/users/:id/notifications', async (req, res) => {
  try {
    const { id } = req.params;
    
    // For now, return a simple notifications structure
    // In a real implementation, this would query a notifications table
    const notifications = [
      {
        id: 1,
        type: 'reservation',
        title: 'Nouvelle réservation',
        message: 'Vous avez une nouvelle réservation en attente',
        read: false,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        type: 'system',
        title: 'Mise à jour système',
        message: 'Le système a été mis à jour avec de nouvelles fonctionnalités',
        read: true,
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ];
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('- Login: /api/login');
    console.log('- Users: /api/users');
    console.log('- User Notifications: /api/users/:id/notifications');
    console.log('- Resources: /api/resources');
    console.log('- Single Resource: /api/resources/:id');
    console.log('- Reservations: /api/reservations');
    console.log('- Statistics: /api/statistics');
    console.log('- Manager Statistics Test: /api/statistics/manager/test');
    console.log('- Chatbot: /api/chatbot');
    console.log('- Upload: /api/upload');
    console.log('- Invite Manager: /api/invite-manager');
    console.log('- Health: /api/health');
});

// Accept invitation
app.get('/api/invitations/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute(
      'UPDATE reservation_invitations SET status = ?, responded_at = NOW() WHERE id_invitation = ?',
      ['accepted', id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    res.json({ success: true, message: 'Invitation accepted successfully' });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
});

// Refuse invitation
app.get('/api/invitations/:id/refuse', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute(
      'UPDATE reservation_invitations SET status = ?, responded_at = NOW() WHERE id_invitation = ?',
      ['refused', id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    res.json({ success: true, message: 'Invitation refused successfully' });
  } catch (error) {
    console.error('Error refusing invitation:', error);
    res.status(500).json({ error: 'Failed to refuse invitation' });
  }
});

// Save additional equipment in reservation_equipments
app.post('/api/reservations/:id/equipment', async (req, res) => {
  try {
    const { id } = req.params;
    const { id_equipement } = req.body;

    if (!id_equipement) {
      return res.status(400).json({ error: 'Equipment ID is required' });
    }

    const [result] = await db.execute(
      'INSERT INTO reservation_equipments (id_reservation, id_equipement) VALUES (?, ?)',
      [id, id_equipement]
    );

    res.status(201).json({
      success: true,
      message: 'Additional equipment added successfully',
      reservationEquipmentId: result.insertId
    });
  } catch (error) {
    console.error('Error adding additional equipment:', error);
    res.status(500).json({ error: 'Failed to add additional equipment' });
  }
});
