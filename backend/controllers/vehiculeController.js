const Vehicule = require('../models/Vehicule');

const vehiculeController = {
  async getAll(req, res) {
    try {
      const vehicules = await Vehicule.getAll();
      res.json(vehicules);
    } catch (error) {
      console.error('Error fetching vehicules:', error);
      res.status(500).json({ error: 'Failed to fetch vehicules' });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const vehicule = await Vehicule.getById(id);
      
      if (!vehicule) {
        return res.status(404).json({ error: 'Vehicule not found' });
      }
      
      res.json(vehicule);
    } catch (error) {
      console.error('Error fetching vehicule:', error);
      res.status(500).json({ error: 'Failed to fetch vehicule' });
    }
  },

  async getByCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const vehicules = await Vehicule.getByCategory(categoryId);
      res.json(vehicules);
    } catch (error) {
      console.error('Error fetching vehicules by category:', error);
      res.status(500).json({ error: 'Failed to fetch vehicules by category' });
    }
  },

  async create(req, res) {
    try {
      const { category_id, nom, details, image_url, marque, modele, immatriculation, disponibilite } = req.body;
      
      if (!category_id || !nom) {
        return res.status(400).json({ error: 'Category ID and name are required' });
      }

      const vehiculeId = await Vehicule.create({ category_id, nom, details, image_url, marque, modele, immatriculation, disponibilite });

      res.status(201).json({
        success: true,
        message: 'Vehicule created successfully',
        vehiculeId
      });
    } catch (error) {
      console.error('Error creating vehicule:', error);
      res.status(500).json({ error: 'Failed to create vehicule' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { nom, details, image_url, marque, modele, immatriculation, disponibilite } = req.body;
      
      const success = await Vehicule.update(id, { nom, details, image_url, marque, modele, immatriculation, disponibilite });

      if (!success) {
        return res.status(404).json({ error: 'Vehicule not found' });
      }

      res.json({
        success: true,
        message: 'Vehicule updated successfully'
      });
    } catch (error) {
      console.error('Error updating vehicule:', error);
      res.status(500).json({ error: 'Failed to update vehicule' });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      
      const success = await Vehicule.delete(id);

      if (!success) {
        return res.status(404).json({ error: 'Vehicule not found' });
      }

      res.json({
        success: true,
        message: 'Vehicule deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting vehicule:', error);
      res.status(500).json({ error: 'Failed to delete vehicule' });
    }
  },

  async getReservations(req, res) {
    try {
      const { id } = req.params;
      const reservations = await Vehicule.getReservations(id);
      res.json(reservations);
    } catch (error) {
      console.error('Error fetching vehicule reservations:', error);
      res.status(500).json({ error: 'Failed to fetch vehicule reservations' });
    }
  }
};

module.exports = vehiculeController;
