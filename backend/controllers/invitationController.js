const Invitation = require('../models/Invitation');
const db = require('../config/database');

const invitationController = {
  async getMultipleByIds(req, res) {
    try {
      let { ids } = req.query;
      if (!ids) {
        return res.status(400).json({ error: 'Missing ids parameter' });
      }
      if (typeof ids === 'string') {
        ids = ids.split(',').map(id => id.trim()).filter(Boolean);
      }
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Invalid ids parameter' });
      }
      const invitations = await Invitation.getMultipleByIds(ids);
      res.json(invitations);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      res.status(500).json({ error: 'Failed to fetch invitations' });
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

      // Automatically mark related notifications as read
      try {
        // Use a very robust query that handles JSON extraction AND raw text searching as a backup
        await db.execute(
          `UPDATE notifications 
           SET is_read = 1 
           WHERE (LOWER(type) = 'reservation_invitation')
           AND (
             JSON_EXTRACT(data, '$.invitation_id') = ? 
             OR JSON_UNQUOTE(JSON_EXTRACT(data, '$.invitation_id')) = ?
             OR data LIKE ? 
             OR data LIKE ?
           )`,
          [id, id, `%"invitation_id":${id}%`, `%"invitation_id": "${id}"%`]
        );
      } catch (notifErr) {
        console.error('Error marking notifications as read for invitation:', notifErr);
      }

      res.json({ success: true, message: 'Invitation response recorded successfully' });
    } catch (error) {
      console.error('Error responding to invitation:', error);
      res.status(500).json({ error: 'Failed to respond to invitation' });
    }
  }
};

module.exports = invitationController;
