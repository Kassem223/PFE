const express = require('express');
const cors = require('cors');
const db = require('./config/database');

// Import routes
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const salleRoutes = require('./routes/salleRoutes');
const vehiculeRoutes = require('./routes/vehiculeRoutes');
const equipementNewRoutes = require('./routes/equipementNewRoutes');
const additionalRoutes = require('./routes/additionalRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/salles', salleRoutes);
app.use('/api/vehicules', vehiculeRoutes);
app.use('/api/equipements', equipementNewRoutes);
app.use('/api/additional', additionalRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/statistics', statisticsRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
