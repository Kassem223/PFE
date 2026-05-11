const Resource = require('../models/Resource');

const resourceController = {
  async getAll(req, res) {
    try {
      const resources = await Resource.getAll();
      res.json(resources);
    } catch (error) {
      console.error('Error fetching resources:', error);
      res.status(500).json({ error: 'Failed to fetch resources' });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const resource = await Resource.getById(id);

      if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
      }

      res.json(resource);
    } catch (error) {
      console.error('Error fetching resource:', error);
      res.status(500).json({ error: 'Failed to fetch resource' });
    }
  },

  async create(req, res) {
    try {
      const { name, description, image_url } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const resourceId = await Resource.create({ name, description, image_url });

      res.status(201).json({
        success: true,
        message: 'Resource created successfully',
        resourceId
      });
    } catch (error) {
      console.error('Error creating resource:', error);
      res.status(500).json({ error: 'Failed to create resource' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description, image_url } = req.body;
      
      const success = await Resource.update(id, { name, description, image_url });

      if (!success) {
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
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      
      const success = await Resource.delete(id);

      if (!success) {
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
  },

  async getEquipment(req, res) {
    try {
      const { id } = req.params;
      const equipment = await Resource.getEquipment(id);
      res.json(equipment);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      res.status(500).json({ error: 'Failed to fetch equipment' });
    }
  }
};

module.exports = resourceController;
