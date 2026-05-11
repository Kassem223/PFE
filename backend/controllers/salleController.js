const Salle = require('../models/Salle');

const salleController = {
  async getAll(req, res) {
    try {
      const salles = await Salle.getAll();
      res.json(salles);
    } catch (error) {
      console.error('Error fetching salles:', error);
      res.status(500).json({ error: 'Failed to fetch salles' });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const salle = await Salle.getById(id);
      
      if (!salle) {
        return res.status(404).json({ error: 'Salle not found' });
      }
      
      res.json(salle);
    } catch (error) {
      console.error('Error fetching salle:', error);
      res.status(500).json({ error: 'Failed to fetch salle' });
    }
  },

  async getByCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const salles = await Salle.getByCategory(categoryId);
      res.json(salles);
    } catch (error) {
      console.error('Error fetching salles by category:', error);
      res.status(500).json({ error: 'Failed to fetch salles by category' });
    }
  },

  async create(req, res) {
    try {
      const { category_id, nom, details, image_url, capacite, disponibilite } = req.body;
      
      if (!category_id || !nom) {
        return res.status(400).json({ error: 'Category ID and name are required' });
      }

      const salleId = await Salle.create({ category_id, nom, details, image_url, capacite, disponibilite });

      res.status(201).json({
        success: true,
        message: 'Salle created successfully',
        salleId
      });
    } catch (error) {
      console.error('Error creating salle:', error);
      res.status(500).json({ error: 'Failed to create salle' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { nom, details, image_url, capacite, disponibilite } = req.body;
      
      const success = await Salle.update(id, { nom, details, image_url, capacite, disponibilite });

      if (!success) {
        return res.status(404).json({ error: 'Salle not found' });
      }

      res.json({
        success: true,
        message: 'Salle updated successfully'
      });
    } catch (error) {
      console.error('Error updating salle:', error);
      res.status(500).json({ error: 'Failed to update salle' });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      
      const success = await Salle.delete(id);

      if (!success) {
        return res.status(404).json({ error: 'Salle not found' });
      }

      res.json({
        success: true,
        message: 'Salle deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting salle:', error);
      res.status(500).json({ error: 'Failed to delete salle' });
    }
  },

  async getReservations(req, res) {
    try {
      const { id } = req.params;
      const reservations = await Salle.getReservations(id);
      res.json(reservations);
    } catch (error) {
      console.error('Error fetching salle reservations:', error);
      res.status(500).json({ error: 'Failed to fetch salle reservations' });
    }
  }
};

module.exports = salleController;
