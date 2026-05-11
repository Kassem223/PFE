const db = require('../config/database');

const Invitation = {
  async getMultipleByIds(ids) {
    const placeholders = ids.map(() => '?').join(',');
    const [invitations] = await db.execute(
      `SELECT id_invitation, id_reservation, id_user, email, type, status, refusal_reason, token, invited_by, created_at, responded_at
       FROM reservation_invitations
       WHERE id_reservation IN (${placeholders})`,
      ids
    );
    return invitations;
  },

  async getByReservationId(reservationId) {
    const [invitations] = await db.execute(
      `SELECT id_invitation, id_reservation, id_user, email, type, status, refusal_reason, token, invited_by, created_at, responded_at
       FROM reservation_invitations
       WHERE id_reservation = ?`,
      [reservationId]
    );
    return invitations;
  },

  async create({ id_reservation, id_user, email, type, token, invited_by }) {
    const [result] = await db.execute(
      'INSERT INTO reservation_invitations (id_reservation, id_user, email, type, status, token, invited_by) VALUES (?, ?, ?, ?, "pending", ?, ?)',
      [id_reservation, id_user || null, email || null, type || 'external', token, invited_by]
    );
    return result.insertId;
  },

  async updateResponse(id, response, refusal_reason = null) {
    const [result] = await db.execute(
      'UPDATE reservation_invitations SET status = ?, refusal_reason = ?, responded_at = NOW() WHERE id_invitation = ?',
      [response, refusal_reason, id]
    );
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await db.execute('DELETE FROM reservation_invitations WHERE id_invitation = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = Invitation;
