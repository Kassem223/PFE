const Equipment = require('../models/Equipment');
const Salle = require('../models/Salle');
const Vehicule = require('../models/Vehicule');
const EquipementNew = require('../models/EquipementNew');

const equipmentController = {
  async createForResource(req, res) {
    try {
      const { id } = req.params;
      const { nom, details, image_url, category_id } = req.body;
      
      if (!nom) {
        return res.status(400).json({ error: 'Name is required' });
      }

      // Utiliser les nouveaux modèles selon la catégorie
      let equipementId;
      if (category_id) {
        // Récupérer la catégorie pour déterminer la table
        const db = require('../config/database');
        const [categories] = await db.execute('SELECT * FROM categories WHERE id = ?', [category_id]);
        const category = categories[0];
        
        if (category.name === 'Salles') {
          equipementId = await Salle.create({ category_id, nom, details, image_url });
        } else if (category.name === 'Véhicules') {
          equipementId = await Vehicule.create({ category_id, nom, details, image_url });
        } else {
          equipementId = await EquipementNew.create({ category_id, nom, details, image_url });
        }
      } else {
        // Ancienne méthode pour compatibilité
        equipementId = await EquipementNew.create({ category_id: 3, nom, details, image_url });
      }

      res.status(201).json({
        success: true,
        message: 'Equipment created successfully',
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
      const { nom, details, image_url, category_id } = req.body;
      
      // Utiliser les nouveaux modèles selon la catégorie
      let success;
      if (category_id) {
        const db = require('../config/database');
        const [categories] = await db.execute('SELECT * FROM categories WHERE id = ?', [category_id]);
        const category = categories[0];
        
        if (category.name === 'Salles') {
          success = await Salle.update(id, { nom, details, image_url });
        } else if (category.name === 'Véhicules') {
          success = await Vehicule.update(id, { nom, details, image_url });
        } else {
          success = await EquipementNew.update(id, { nom, details, image_url });
        }
      } else {
        // Ancienne méthode pour compatibilité
        success = await EquipementNew.update(id, { nom, details, image_url });
      }

      if (!success) {
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
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      
      // Trouver d'abord l'équipement pour connaître son type
      const equipment = await Equipment.getById(id);
      if (!equipment) {
        return res.status(404).json({ error: 'Equipment not found' });
      }
      
      let success;
      if (equipment.type === 'salle') {
        success = await Salle.delete(id);
      } else if (equipment.type === 'vehicule') {
        success = await Vehicule.delete(id);
      } else {
        success = await EquipementNew.delete(id);
      }

      if (!success) {
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
  },

  async getReservations(req, res) {
    try {
      const { id } = req.params;
      const reservations = await Equipment.getReservations(id);
      res.json(reservations);
    } catch (error) {
      console.error('Error fetching equipment reservations:', error);
      res.status(500).json({ error: 'Failed to fetch equipment reservations' });
    }
  }
};

module.exports = equipmentController;
