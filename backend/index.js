const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const invitationRoutes = require('./routes/invitationRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const additionalRoutes = require('./routes/additionalRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const salleRoutes = require('./routes/salleRoutes');
const vehiculeRoutes = require('./routes/vehiculeRoutes');
const equipementNewRoutes = require('./routes/equipementNewRoutes');

// Import config
const cloudinary = require('./config/cloudinary');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Multer configuration for file uploads
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
  },
});

const upload = multer({ storage: storage });

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Simple endpoint to drop old equipement table
app.post('/api/clean-old-table', async (req, res) => {
  try {
    console.log('Attempting to drop old equipement table...');
    
    // Check if table exists
    const [tables] = await db.execute(`
      SELECT TABLE_NAME FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'equipement'
    `);
    
    if (tables.length === 0) {
      console.log('Old equipement table does not exist');
      return res.json({
        success: true,
        message: 'Old equipement table does not exist'
      });
    }
    
    console.log('Dropping old equipement table...');
    await db.execute('DROP TABLE equipement');
    console.log('Old equipement table dropped successfully');
    
    res.json({
      success: true,
      message: 'Old equipement table dropped successfully'
    });
  } catch (error) {
    console.error('Error dropping old equipement table:', error);
    res.status(500).json({ error: 'Failed to drop old equipement table: ' + error.message });
  }
});

// Endpoint to get only equipment items (from equipements table)
app.get('/api/equipment-only', async (req, res) => {
  try {
    console.log('Fetching equipment items only...');
    
    // Get the equipment category
    const [categories] = await db.execute('SELECT * FROM categories WHERE name = ?', ['Équipements']);
    
    if (categories.length === 0) {
      console.log('Equipment category not found');
      return res.json({
        success: true,
        equipment: [],
        message: 'Equipment category not found'
      });
    }
    
    const categoryId = categories[0].id;
    
    // Get only equipment items
    const [equipements] = await db.execute('SELECT * FROM equipements WHERE category_id = ?', [categoryId]);
    
    console.log(`Found ${equipements.length} equipment items`);
    
    res.json({
      success: true,
      equipment: equipements.map(item => ({ ...item, type: 'equipement' })),
      count: equipements.length
    });
  } catch (error) {
    console.error('Error fetching equipment items:', error);
    res.status(500).json({ error: 'Failed to fetch equipment items: ' + error.message });
  }
});

// Endpoint to delete all available equipment
app.post('/api/delete-all-equipment', async (req, res) => {
  try {
    console.log('Deleting all available equipment...');
    
    // Delete from all three tables
    const [sallesResult] = await db.execute('DELETE FROM salles');
    const [vehiculesResult] = await db.execute('DELETE FROM vehicules');
    const [equipementsResult] = await db.execute('DELETE FROM equipements');
    
    console.log(`Deleted ${sallesResult.affectedRows} salles`);
    console.log(`Deleted ${vehiculesResult.affectedRows} vehicules`);
    console.log(`Deleted ${equipementsResult.affectedRows} equipements`);
    
    const totalDeleted = sallesResult.affectedRows + vehiculesResult.affectedRows + equipementsResult.affectedRows;
    
    res.json({
      success: true,
      message: `Successfully deleted ${totalDeleted} equipment items`,
      details: {
        salles: sallesResult.affectedRows,
        vehicules: vehiculesResult.affectedRows,
        equipements: equipementsResult.affectedRows,
        total: totalDeleted
      }
    });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    res.status(500).json({ error: 'Failed to delete equipment: ' + error.message });
  }
});

// Debug endpoint to check categories
app.get('/api/debug-categories', async (req, res) => {
  try {
    const [categories] = await db.execute('SELECT * FROM categories');
    res.json({
      success: true,
      categories: categories,
      count: categories.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories: ' + error.message });
  }
});

// Debug endpoint to test vehicle creation
app.post('/api/debug-vehicle', async (req, res) => {
  try {
    // First get the category
    const [categories] = await db.execute('SELECT * FROM categories WHERE name = ?', ['Flotte d entreprise']);
    
    if (categories.length === 0) {
      return res.status(404).json({ error: 'Category "Flotte d entreprise" not found' });
    }
    
    const category = categories[0];
    console.log('Found category:', category);
    
    // Test vehicle creation
    const testVehicle = {
      category_id: category.id,
      nom: 'Test Vehicle',
      details: 'Test details',
      image_url: null,
      marque: 'Test',
      modele: 'Test',
      immatriculation: 'TEST-123',
      disponibilite: true
    };
    
    const [result] = await db.execute(`
      INSERT INTO vehicules (category_id, nom, details, image_url, marque, modele, immatriculation, disponibilite) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [testVehicle.category_id, testVehicle.nom, testVehicle.details, testVehicle.image_url, testVehicle.marque, testVehicle.modele, testVehicle.immatriculation, testVehicle.disponibilite]);
    
    res.json({
      success: true,
      message: 'Test vehicle created successfully',
      vehicleId: result.insertId,
      category: category
    });
  } catch (error) {
    console.error('Debug vehicle creation error:', error);
    res.status(500).json({ error: 'Failed to create test vehicle: ' + error.message });
  }
});

// Fix endpoint to create missing vehicle category
app.post('/api/fix-vehicle-category', async (req, res) => {
  try {
    // Check if category exists
    const [existing] = await db.execute('SELECT * FROM categories WHERE name = ?', ['Flotte d entreprise']);
    
    if (existing.length === 0) {
      // Create the missing category
      await db.execute(`
        INSERT INTO categories (name, description, icon, color) 
        VALUES (?, ?, ?, ?)
      `, ['Flotte d entreprise', 'Flotte d entreprise pour les véhicules', '🚗', 'from-cyan-500 to-blue-600']);
      
      res.json({
        success: true,
        message: 'Vehicle category created successfully'
      });
    } else {
      res.json({
        success: true,
        message: 'Vehicle category already exists',
        category: existing[0]
      });
    }
  } catch (error) {
    console.error('Fix vehicle category error:', error);
    res.status(500).json({ error: 'Failed to fix vehicle category: ' + error.message });
  }
});

// Endpoint to drop old equipement table
app.post('/api/drop-old-equipement-table', async (req, res) => {
  try {
    // First check if table exists
    const [tables] = await db.execute(`
      SELECT TABLE_NAME FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'equipement'
    `);
    
    if (tables.length === 0) {
      return res.json({
        success: true,
        message: 'Old equipement table does not exist'
      });
    }
    
    // Drop the old table
    await db.execute('DROP TABLE equipement');
    
    res.json({
      success: true,
      message: 'Old equipement table dropped successfully'
    });
  } catch (error) {
    console.error('Drop old equipement table error:', error);
    res.status(500).json({ error: 'Failed to drop old equipement table: ' + error.message });
  }
});

// Temporary setup endpoint to create tables
app.post('/api/setup-database', async (req, res) => {
  try {
    console.log('Creating tables...');
    
    // Create categories table
    await db.execute(`CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      description TEXT,
      icon VARCHAR(50),
      color VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);
    
    // Create salles table
    await db.execute(`CREATE TABLE IF NOT EXISTS salles (
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
    )`);
    
    // Create vehicules table
    await db.execute(`CREATE TABLE IF NOT EXISTS vehicules (
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
    )`);
    
    // Create equipements table
    await db.execute(`CREATE TABLE IF NOT EXISTS equipements (
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
    )`);
    
    // Insert categories
    await db.execute(`INSERT IGNORE INTO categories (name, description, icon, color) VALUES 
      ('Salles', 'Salles de réunion et espaces', '🏢', 'from-blue-500 to-blue-600'),
      ('Véhicules', 'Flotte d entreprise', '🚗', 'from-cyan-500 to-blue-600'),
      ('Équipements', 'Équipements et matériel', '🖥️', 'from-cyan-400 to-blue-500')
    `);
    
    const [categories] = await db.execute('SELECT * FROM categories');
    
    res.json({
      success: true,
      message: 'Tables created successfully',
      categories: categories
    });
  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({ error: 'Failed to create tables: ' + error.message });
  }
});

// Mount routes
app.use('/api', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api', equipmentRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api', additionalRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/salles', salleRoutes);
app.use('/api/vehicules', vehiculeRoutes);
app.use('/api/equipements', equipementNewRoutes);

// Invitation routes that were outside the main pattern
const Invitation = require('./models/Invitation');
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
    const invitations = await Invitation.getMultipleByIds(ids);
    res.json(invitations);
  } catch (error) {
    console.error('Error fetching invitations for multiple reservations:', error);
    res.status(500).json({ error: 'Failed to fetch invitations for multiple reservations' });
  }
});

// Invitation response routes
app.get('/api/invitations/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;
    const success = await Invitation.updateResponse(id, 'accepted');
    if (!success) {
      return res.status(404).json({ error: 'Invitation not found' });
    }
    res.json({ success: true, message: 'Invitation accepted successfully' });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
});

app.get('/api/invitations/:id/refuse', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.query;
    const success = await Invitation.updateResponse(id, 'refused', reason);
    if (!success) {
      return res.status(404).json({ error: 'Invitation not found' });
    }
    res.json({ success: true, message: 'Invitation refused successfully' });
  } catch (error) {
    console.error('Error refusing invitation:', error);
    res.status(500).json({ error: 'Failed to refuse invitation' });
  }
});

// File upload route
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({
      success: true,
      url: req.file.path,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Initialize static categories
app.post('/api/init-categories', async (req, res) => {
  try {
    const Resource = require('./models/Resource');
    
    const categories = [
      { name: "Flotte d'entreprise", description: "Véhicules de l'entreprise" },
      { name: "Salles", description: "Salles de réunion et espaces" },
      { name: "Équipement", description: "Équipements et matériel" }
    ];

    for (const category of categories) {
      // Check if category already exists
      const [rows] = await require('./config/database').execute(
        'SELECT id FROM resources WHERE name = ?',
        [category.name]
      );

      if (rows.length === 0) {
        // Create category if it doesn't exist
        await Resource.create(category);
        console.log(`Created category: ${category.name}`);
      }
    }

    res.json({ success: true, message: 'Categories initialized' });
  } catch (error) {
    console.error('Error initializing categories:', error);
    res.status(500).json({ error: 'Failed to initialize categories' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Database: ${process.env.DB_NAME || 'vektor_db'}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
