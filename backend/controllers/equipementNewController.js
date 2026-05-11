const EquipementNew = require('../models/EquipementNew');

const equipementNewController = {
  async getAll(req, res) {
    try {
      const equipements = await EquipementNew.getAll();
      res.json(equipements);
    } catch (error) {
      console.error('Error fetching equipements:', error);
      res.status(500).json({ error: 'Failed to fetch equipements' });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const equipement = await EquipementNew.getById(id);
      
      if (!equipement) {
        return res.status(404).json({ error: 'Equipement not found' });
      }
      
      res.json(equipement);
    } catch (error) {
      console.error('Error fetching equipement:', error);
      res.status(500).json({ error: 'Failed to fetch equipement' });
    }
  },

  async getByCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const equipements = await EquipementNew.getByCategory(categoryId);
      res.json(equipements);
    } catch (error) {
      console.error('Error fetching equipements by category:', error);
      res.status(500).json({ error: 'Failed to fetch equipements by category' });
    }
  },

  async create(req, res) {
    try {
      const { category_id, nom, details, image_url, type_equipement, etat, disponibilite } = req.body;
      
      if (!category_id || !nom) {
        return res.status(400).json({ error: 'Category ID and name are required' });
      }

      const equipementId = await EquipementNew.create({ category_id, nom, details, image_url, type_equipement, etat, disponibilite });

      res.status(201).json({
        success: true,
        message: 'Equipement created successfully',
        equipementId
      });
    } catch (error) {
      console.error('Error creating equipement:', error);
      res.status(500).json({ error: 'Failed to create equipement' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { nom, details, image_url, type_equipement, etat, disponibilite } = req.body;
      
      const success = await EquipementNew.update(id, { nom, details, image_url, type_equipement, etat, disponibilite });

      if (!success) {
        return res.status(404).json({ error: 'Equipement not found' });
      }

      res.json({
        success: true,
        message: 'Equipement updated successfully'
      });
    } catch (error) {
      console.error('Error updating equipement:', error);
      res.status(500).json({ error: 'Failed to update equipement' });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      
      const success = await EquipementNew.delete(id);

      if (!success) {
        return res.status(404).json({ error: 'Equipement not found' });
      }

      res.json({
        success: true,
        message: 'Equipement deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting equipement:', error);
      res.status(500).json({ error: 'Failed to delete equipement' });
    }
  },

  async getReservations(req, res) {
    try {
      const { id } = req.params;
      const reservations = await EquipementNew.getReservations(id);
      res.json(reservations);
    } catch (error) {
      console.error('Error fetching equipement reservations:', error);
      res.status(500).json({ error: 'Failed to fetch equipement reservations' });
    }
  }
};

module.exports = equipementNewController;
