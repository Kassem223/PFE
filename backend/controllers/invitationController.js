const InvitationSalle = require('../models/InvitationSalle');
const db = require('../config/database');

const invitationController = {

  // GET /api/invitations?ids=1,2,3
  async getMultipleByIds(req, res) {
    try {
      let { ids } = req.query;
      if (!ids) return res.status(400).json({ error: 'Missing ids parameter' });
      if (typeof ids === 'string') ids = ids.split(',').map(s => s.trim()).filter(Boolean);
      if (!ids.length) return res.status(400).json({ error: 'Invalid ids parameter' });
      const invitations = await InvitationSalle.getMultipleByIds(ids);
      res.json(invitations);
    } catch (err) {
      console.error('getMultipleByIds error:', err);
      res.status(500).json({ error: 'Failed to fetch invitations' });
    }
  },

  // GET /api/invitations/:id
  async getByReservationId(req, res) {
    try {
      const { id } = req.params;
      const invitations = await InvitationSalle.getByReservationId(id);
      res.json(invitations);
    } catch (err) {
      console.error('getByReservationId error:', err);
      res.status(500).json({ error: 'Failed to fetch invitations' });
    }
  },

  // PUT /api/invitations/:id/respond
  async respond(req, res) {
    try {
      const { id } = req.params;
      const { response, refusal_reason } = req.body;
      const ok = await InvitationSalle.updateResponse(id, response, refusal_reason);
      if (!ok) return res.status(404).json({ error: 'Invitation not found' });

      // Mark related notifications as read
      db.execute(
        `UPDATE notifications
         SET is_read = 1
         WHERE type = 'reservation_invitation'
           AND (JSON_EXTRACT(data, '$.invitation_id') = ?
             OR data LIKE ?)`,
        [id, `%"invitation_id":${id}%`]
      ).catch(e => console.error('Notification update error:', e.message));

      res.json({ success: true });
    } catch (err) {
      console.error('respond error:', err);
      res.status(500).json({ error: 'Failed to respond to invitation' });
    }
  },
};

module.exports = invitationController;
