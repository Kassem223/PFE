const Invitation = require('../models/Invitation');

const invitationController = {
  async getMultipleByIds(req, res) {
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
  },

  async getByReservationId(req, res) {
    try {
      const { id } = req.params;
      const invitations = await Invitation.getByReservationId(id);
      res.json(invitations);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      res.status(500).json({ error: 'Failed to fetch invitations' });
    }
  },

  async respond(req, res) {
    try {
      const { id } = req.params;
      const { response, refusal_reason } = req.body;
      
      const success = await Invitation.updateResponse(id, response, refusal_reason);

      if (!success) {
        return res.status(404).json({ error: 'Invitation not found' });
      }

      res.json({
        success: true,
        message: 'Invitation response recorded successfully'
      });
    } catch (error) {
      console.error('Error responding to invitation:', error);
      res.status(500).json({ error: 'Failed to respond to invitation' });
    }
  }
};

module.exports = invitationController;
