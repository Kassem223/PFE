const ReservationSalle    = require('../models/ReservationSalle');
const ReservationVehicule = require('../models/ReservationVehicule');
const InvitationSalle     = require('../models/InvitationSalle');
const { sendInvitationEmail } = require('../config/email');
const crypto = require('crypto');
const db     = require('../config/database');
const fs = require('fs');

function logToFile(message) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync('./debug.log', `[${timestamp}] ${message}\n`);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function addMin(timeStr, minutes) {
  const [h, m] = timeStr.split(':').map(Number);
  let total = h * 60 + m + minutes;
  if (total >= 1440) total = 1439;
  if (total < 0)    total = 0;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

// Resolve which table a reservation lives in from its id + optional type hint.
// Returns { table: 'salles'|'vehicules', model }
async function resolveReservation(id, typeHint) {
  if (typeHint === 'salles' || typeHint === 'vehicules') {
    return typeHint;
  }
  // Try salles first
  const [rs] = await db.execute('SELECT id FROM reservation_salles WHERE id = ?', [id]);
  if (rs.length) return 'salles';
  const [rv] = await db.execute('SELECT id FROM reservation_vehicules WHERE id = ?', [id]);
  if (rv.length) return 'vehicules';
  return null;
}

// ── Controller ────────────────────────────────────────────────────────────────

const reservationController = {

  // GET /api/reservations
  async getAll(req, res) {
    try {
      const [salles, vehicules] = await Promise.all([
        ReservationSalle.getAll(),
        ReservationVehicule.getAll(),
      ]);
      // Merge and sort by created_at desc
      const all = [...salles, ...vehicules].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      res.json(all);
    } catch (err) {
      console.error('getAll error:', err);
      res.status(500).json({ error: 'Failed to fetch reservations' });
    }
  },

  // GET /api/reservations/user/:userId
  async getByUserId(req, res) {
    try {
      const { userId } = req.params;
      const [salles, vehicules] = await Promise.all([
        ReservationSalle.getByUserId(userId),
        ReservationVehicule.getByUserId(userId),
      ]);
      const all = [...salles, ...vehicules].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      res.json(all);
    } catch (err) {
      console.error('getByUserId error:', err);
      res.status(500).json({ error: 'Failed to fetch user reservations' });
    }
  },

  // POST /api/reservations
  async create(req, res) {
    logToFile('=== create called ===');
    logToFile(`Request body: ${JSON.stringify(req.body)}`);
    
    const {
      id_equipement, id_user, date_reservation, time_start, time_end,
      nombre_personnes, additional_equipments = [], resource_type,
      vehicle_depart, vehicle_destination, vehicle_motif, vehicle_distance, vehicle_note,
      note,
    } = req.body;

    if (!id_equipement || !id_user || !date_reservation || !time_start || !time_end) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      let reservationId;

      if (resource_type === 'vehicules') {
        reservationId = await ReservationVehicule.create(conn, {
          id_vehicule: id_equipement, id_user, date_reservation, time_start, time_end,
          nombre_personnes, vehicle_depart, vehicle_destination, vehicle_motif,
          vehicle_distance, vehicle_note,
        });
      } else {
        // Default: salle
        const avail = await ReservationSalle.checkAvailability(
          conn, id_equipement, date_reservation, time_start, time_end
        );
        if (!avail.available) {
          await conn.rollback();
          conn.release();
          return res.status(409).json({
            error: 'Salle non disponible sur ce créneau (tampon de 30 min requis entre réservations).',
            conflicts: avail.conflicts,
          });
        }
        reservationId = await ReservationSalle.create(conn, {
          id_salle: id_equipement, id_user, date_reservation, time_start, time_end,
          nombre_personnes, equipment_ids: additional_equipments, note,
        });
      }

      await conn.commit();
      res.status(201).json({ success: true, reservationId, resource_type: resource_type || 'salles' });
    } catch (err) {
      await conn.rollback();
      logToFile(`create error: ${err.message}`);
      logToFile(`Full stack: ${err.stack}`);
      res.status(500).json({ error: 'Failed to create reservation', details: err.message });
    } finally {
      conn.release();
    }
  },

  // POST /api/reservations/with-invitations  (salles only — vehicules have no invitations)
  async createWithInvitations(req, res) {
    logToFile('=== createWithInvitations called ===');
    logToFile(`Request body: ${JSON.stringify(req.body)}`);
    
    const {
      id_equipement, id_user, date_reservation, time_start, time_end,
      nombre_personnes, internal_users = [], external_emails = [],
      additional_equipments = [], resource_type,
      vehicle_depart, vehicle_destination, vehicle_motif, vehicle_distance, vehicle_note,
      note,
    } = req.body;

    if (!id_equipement || !id_user || !date_reservation || !time_start || !time_end) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      let reservationId;
      const isVehicle = resource_type === 'vehicules';

      if (isVehicle) {
        reservationId = await ReservationVehicule.create(conn, {
          id_vehicule: id_equipement, id_user, date_reservation, time_start, time_end,
          nombre_personnes, vehicle_depart, vehicle_destination, vehicle_motif,
          vehicle_distance, vehicle_note,
        });
      } else {
        const avail = await ReservationSalle.checkAvailability(
          conn, id_equipement, date_reservation, time_start, time_end
        );
        if (!avail.available) {
          await conn.rollback();
          conn.release();
          return res.status(409).json({
            error: 'Salle non disponible sur ce créneau (tampon de 30 min requis).',
            conflicts: avail.conflicts,
          });
        }
        reservationId = await ReservationSalle.create(conn, {
          id_salle: id_equipement, id_user, date_reservation, time_start, time_end,
          nombre_personnes, equipment_ids: additional_equipments, note,
        });
      }

      // Invitations only for salles
      const emailPromises = [];
      if (!isVehicle) {
        // Fetch inviter info and salle info for notifications
        let inviterName = 'Un utilisateur';
        let salleName = 'Une salle';
        try {
          const [inviterRows] = await conn.execute('SELECT prenom, nom FROM users WHERE id = ?', [id_user]);
          if (inviterRows.length > 0) inviterName = `${inviterRows[0].prenom} ${inviterRows[0].nom}`;
          
          const [salleRows] = await conn.execute('SELECT nom FROM salles WHERE id = ?', [id_equipement]);
          if (salleRows.length > 0) salleName = salleRows[0].nom;
        } catch (e) {
          console.error('Error fetching inviter/salle info for notification:', e.message);
        }

        for (const uid of internal_users) {
          const [rows] = await conn.execute('SELECT email, prenom FROM users WHERE id = ?', [uid]);
          const userRow = rows[0];
          if (!userRow) throw new Error(`User ${uid} not found`);
          const token = crypto.randomBytes(32).toString('hex');
          const invId = await InvitationSalle.create(conn, {
            id_reservation: reservationId, id_user: uid,
            email: userRow.email, type: 'internal', token, invited_by: id_user,
          });
          emailPromises.push(
            sendInvitationEmail(userRow.email, reservationId, invId)
              .catch(e => console.error('Email error (internal):', e.message))
          );
          // In-app notification
          conn.execute(
            `INSERT INTO notifications (id_user, type, title, message, data, is_read, created_at)
             VALUES (?, 'reservation_invitation', ?, ?, ?, 0, NOW())`,
            [uid,
             `Invitation de ${inviterName}`,
             `${inviterName} vous a invité à une réservation pour la salle "${salleName}".`,
             JSON.stringify({ 
               reservation_id: reservationId, 
               invitation_id: invId,
               inviter_name: inviterName,
               salle_name: salleName,
               date: date_reservation,
               time_start: time_start,
               time_end: time_end
             })]
          ).catch(e => console.error('Notification error:', e.message));
        }

        for (const email of external_emails) {
          const token = crypto.randomBytes(32).toString('hex');
          const invId = await InvitationSalle.create(conn, {
            id_reservation: reservationId, id_user: null,
            email, type: 'external', token, invited_by: id_user,
          });
          emailPromises.push(
            sendInvitationEmail(email, reservationId, invId)
              .catch(e => console.error('Email error (external):', e.message))
          );
        }
      }

      await conn.commit();
      res.status(201).json({ success: true, reservationId, resource_type: resource_type || 'salles' });

      // Fire emails after response
      Promise.all(emailPromises).catch(e => console.error('Background email error:', e));
    } catch (err) {
      await conn.rollback();
      logToFile(`createWithInvitations error: ${err.message}`);
      logToFile(`Full stack: ${err.stack}`);
      res.status(500).json({ error: 'Failed to create reservation with invitations', details: err.message });
    } finally {
      conn.release();
    }
  },

  // GET /api/reservations/:id/details
  async getDetails(req, res) {
    try {
      const { id } = req.params;
      const type = await resolveReservation(id);
      if (!type) return res.status(404).json({ error: 'Reservation not found' });
      const row = type === 'salles'
        ? await ReservationSalle.getById(id)
        : await ReservationVehicule.getById(id);
      if (!row) return res.status(404).json({ error: 'Reservation not found' });
      res.json(row);
    } catch (err) {
      console.error('getDetails error:', err);
      res.status(500).json({ error: 'Failed to fetch reservation details' });
    }
  },

  // GET /api/reservations/:id/invitations  (salles only)
  async getInvitations(req, res) {
    try {
      const { id } = req.params;
      const invitations = await InvitationSalle.getByReservationId(id);
      res.json(invitations);
    } catch (err) {
      console.error('getInvitations error:', err);
      res.status(500).json({ error: 'Failed to fetch invitations' });
    }
  },

  // GET /api/reservations/:id/equipments  (salles only — returns equipment_ids array)
  async getEquipments(req, res) {
    try {
      const { id } = req.params;
      const [rows] = await db.execute(
        'SELECT equipment_ids FROM reservation_salles WHERE id = ?', [id]
      );
      if (!rows.length) return res.json([]);
      const ids = rows[0].equipment_ids ? JSON.parse(rows[0].equipment_ids) : [];
      if (!ids.length) return res.json([]);
      const placeholders = ids.map(() => '?').join(',');
      const [equips] = await db.execute(
        `SELECT id, nom, details, image_url FROM equipements WHERE id IN (${placeholders})`, ids
      );
      res.json(equips);
    } catch (err) {
      console.error('getEquipments error:', err);
      res.status(500).json({ error: 'Failed to fetch equipments' });
    }
  },

  // PUT /api/reservations/:id/status
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { statut } = req.body;
      const type = await resolveReservation(id);
      if (!type) return res.status(404).json({ error: 'Reservation not found' });
      const ok = type === 'salles'
        ? await ReservationSalle.updateStatus(id, statut)
        : await ReservationVehicule.updateStatus(id, statut);
      if (!ok) return res.status(404).json({ error: 'Reservation not found' });
      res.json({ success: true });
    } catch (err) {
      console.error('updateStatus error:', err);
      res.status(500).json({ error: 'Failed to update status' });
    }
  },

  // PUT /api/reservations/:id/cancel
  async cancel(req, res) {
    try {
      const { id } = req.params;
      const { type } = req.body;
      console.log('Cancel request:', { id, type, body: req.body });
      const typeToUse = type || (await resolveReservation(id));
      console.log('Type to use:', typeToUse);
      if (!typeToUse) {
        console.log('Reservation not found');
        return res.status(404).json({ error: 'Reservation not found' });
      }
      const ok = typeToUse === 'salles'
        ? await ReservationSalle.updateStatus(id, 'annulée')
        : await ReservationVehicule.updateStatus(id, 'annulée');
      console.log('Update status result:', ok);
      if (!ok) {
        console.log('Failed to update status');
        return res.status(404).json({ error: 'Reservation not found' });
      }
      res.json({ success: true });
    } catch (err) {
      console.error('cancel error:', err);
      res.status(500).json({ error: 'Failed to cancel reservation', details: err.message });
    }
  },

  // DELETE /api/reservations/:id
  async delete(req, res) {
    try {
      const { id } = req.params;
      const type = await resolveReservation(id);
      if (!type) return res.status(404).json({ error: 'Reservation not found' });
      const ok = type === 'salles'
        ? await ReservationSalle.delete(id)
        : await ReservationVehicule.delete(id);
      if (!ok) return res.status(404).json({ error: 'Reservation not found' });
      res.json({ success: true });
    } catch (err) {
      console.error('delete error:', err);
      res.status(500).json({ error: 'Failed to delete reservation' });
    }
  },

  // GET /api/reservations/invitations?ids=1,2,3  (salles invitations)
  async getMultipleInvitations(req, res) {
    try {
      let { ids } = req.query;
      if (!ids) return res.status(400).json({ error: 'Missing ids parameter' });
      if (typeof ids === 'string') ids = ids.split(',').map(s => s.trim()).filter(Boolean);
      const invitations = await InvitationSalle.getMultipleByIds(ids);
      res.json(invitations);
    } catch (err) {
      console.error('getMultipleInvitations error:', err);
      res.status(500).json({ error: 'Failed to fetch invitations' });
    }
  },
};

module.exports = reservationController;
