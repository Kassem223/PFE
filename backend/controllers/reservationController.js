const Reservation = require('../models/Reservation');
const Invitation = require('../models/Invitation');
const { sendInvitationEmail } = require('../config/email');
const crypto = require('crypto');
const db = require('../config/database');

const reservationController = {
  // Helper function to check room availability with 30-minute buffer
  async checkRoomAvailability(connection, roomId, date, startTime, endTime) {
    try {
      // First, check if the equipment is a room (salle)
      const [roomCheck] = await connection.execute(
        'SELECT id FROM salles WHERE id = ?',
        [roomId]
      );
      
      // If it's not a room, no availability check needed
      if (roomCheck.length === 0) {
        return { available: true, isRoom: false };
      }

      // For rooms, check availability with 30-minute buffer
      // A new reservation [S, E] conflicts if it overlaps with [Si-30, Ei+30]
      // Or equivalently, if [S-30, E+30] overlaps with [Si, Ei]
      const bufferedStartTime = reservationController.subtractMinutesFromTime(startTime, 30);
      const bufferedEndTime = reservationController.addMinutesToTime(endTime, 30);
      
      const [existingReservations] = await connection.execute(`
        SELECT time_start, time_end 
        FROM reservations 
        WHERE id_equipement = ? 
        AND date_reservation = ? 
        AND statut != 'annulée'
        AND (time_start < ? AND time_end > ?)
      `, [roomId, date, bufferedEndTime, bufferedStartTime]);

      if (existingReservations.length > 0) {
        return { 
          available: false, 
          isRoom: true, 
          conflictingReservations: existingReservations 
        };
      }

      return { available: true, isRoom: true };
    } catch (error) {
      console.error('Error checking room availability:', error);
      throw error;
    }
  },

  // Helper function to add minutes to a time string
  addMinutesToTime(timeStr, minutes) {
    const [hours, mins] = timeStr.split(':').map(Number);
    let totalMinutes = hours * 60 + mins + minutes;
    
    // Cap at end of day
    if (totalMinutes >= 24 * 60) totalMinutes = 24 * 60 - 1;
    
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  },

  // Helper function to subtract minutes from a time string
  subtractMinutesFromTime(timeStr, minutes) {
    const [hours, mins] = timeStr.split(':').map(Number);
    let totalMinutes = hours * 60 + mins - minutes;
    
    // Cap at start of day
    if (totalMinutes < 0) totalMinutes = 0;
    
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  },

  async getAll(req, res) {
    try {
      const reservations = await Reservation.getAll();
      res.json(reservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      res.status(500).json({ error: 'Failed to fetch reservations' });
    }
  },

  async getByUserId(req, res) {
    try {
      const { userId } = req.params;
      const reservations = await Reservation.getByUserId(userId);
      res.json(reservations);
    } catch (error) {
      console.error('Error fetching user reservations:', error);
      res.status(500).json({ error: 'Failed to fetch user reservations' });
    }
  },

  async create(req, res) {
    try {
      console.log('=== REQUÊTE REÇUE DANS CREATE ===');
      console.log('req.body:', req.body);
      const { id_equipement, id_user, date_reservation, time_start, time_end, nombre_personnes, additional_equipments = [] } = req.body;
      
      if (!id_equipement || !id_user || !date_reservation || !time_start || !time_end) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }

      // Start transaction
      const connection = await db.getConnection();
      await connection.beginTransaction();

      try {
        // Check room availability (only applies to rooms/salles)
        const availabilityCheck = await reservationController.checkRoomAvailability(
          connection, 
          id_equipement, 
          date_reservation, 
          time_start, 
          time_end
        );

        if (!availabilityCheck.available) {
          await connection.rollback();
          connection.release();
          
          if (availabilityCheck.isRoom) {
            return res.status(409).json({ 
              error: 'Room not available during selected time slot. Please note that rooms require a 30-minute buffer between reservations.',
              conflictingReservations: availabilityCheck.conflictingReservations 
            });
          }
        }

        // Create reservation with salle as container only
        const [reservationResult] = await connection.execute(
          'INSERT INTO reservations (id_equipement, id_user, date_reservation, time_start, time_end, nombre_personnes, statut) VALUES (?, ?, ?, ?, ?, ?, "en_attente")',
          [id_equipement, id_user, date_reservation, time_start, time_end, nombre_personnes || 1]
        );

        const reservationId = reservationResult.insertId;

        // Add ONLY additional equipments to reservation_equipments table
        // The salle itself is NOT added as an equipment
        console.log('=== DEBUG EQUIPEMENTS (create) ===');
        console.log('additional_equipments:', additional_equipments);
        console.log('reservationId:', reservationId);
        console.log('Type de additional_equipments:', typeof additional_equipments);
        console.log('Longueur:', additional_equipments?.length);
        
        if (additional_equipments && additional_equipments.length > 0) {
          for (const equipmentId of additional_equipments) {
            console.log('Insertion équipement:', equipmentId);
            await connection.execute(
              'INSERT INTO reservation_equipments (id_reservation, id_equipement) VALUES (?, ?)',
              [reservationId, equipmentId]
            );
            console.log('Équipement inséré avec succès');
          }
        } else {
          console.log('Aucun équipement additionnel à insérer');
        }

        await connection.commit();

        res.status(201).json({
          success: true,
          message: 'Reservation created successfully with additional equipments only',
          reservationId
        });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      res.status(500).json({ error: 'Failed to create reservation' });
    }
  },

  async createWithInvitations(req, res) {
    try {
      const { 
        id_equipement, 
        id_user, 
        date_reservation, 
        time_start, 
        time_end, 
        nombre_personnes,
        internal_users = [],
        external_emails = [],
        additional_equipments = []
      } = req.body;
      
      if (!id_equipement || !id_user || !date_reservation || !time_start || !time_end) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }

      // Start transaction
      const connection = await db.getConnection();
      await connection.beginTransaction();

      try {
        // Check room availability (only applies to rooms/salles)
        const availabilityCheck = await reservationController.checkRoomAvailability(
          connection, 
          id_equipement, 
          date_reservation, 
          time_start, 
          time_end
        );

        if (!availabilityCheck.available) {
          await connection.rollback();
          connection.release();
          
          if (availabilityCheck.isRoom) {
            return res.status(409).json({ 
              error: 'Room not available during selected time slot. Please note that rooms require a 30-minute buffer between reservations.',
              conflictingReservations: availabilityCheck.conflictingReservations 
            });
          }
        }

        // Create main reservation (salle as container only)
        const [reservationResult] = await connection.execute(
          'INSERT INTO reservations (id_equipement, id_user, date_reservation, time_start, time_end, nombre_personnes, statut) VALUES (?, ?, ?, ?, ?, ?, "en_attente")',
          [id_equipement, id_user, date_reservation, time_start, time_end, nombre_personnes || 1]
        );

        const reservationId = reservationResult.insertId;

        // Add ONLY additional equipments to reservation_equipments table
        // The salle itself is NOT added as an equipment
        console.log('=== DEBUG EQUIPEMENTS (createWithInvitations) ===');
        console.log('additional_equipments:', additional_equipments);
        console.log('reservationId:', reservationId);
        console.log('Type de additional_equipments:', typeof additional_equipments);
        console.log('Longueur:', additional_equipments?.length);
        
        if (additional_equipments && additional_equipments.length > 0) {
          for (const equipmentId of additional_equipments) {
            console.log('Insertion équipement:', equipmentId);
            await connection.execute(
              'INSERT INTO reservation_equipments (id_reservation, id_equipement) VALUES (?, ?)',
              [reservationId, equipmentId]
            );
            console.log('Équipement inséré avec succès');
          }
        } else {
          console.log('Aucun équipement additionnel à insérer');
        }

        // Create internal user invitations
        for (const userId of internal_users) {
          const token = crypto.randomBytes(32).toString('hex');
          // Get the user's email
          const [userRows] = await connection.execute(
            'SELECT email, prenom FROM users WHERE id = ?',
            [userId]
          );
          
          if (userRows.length === 0) {
            throw new Error(`User with ID ${userId} not found`);
          }
          
          const userEmail = userRows[0].email;
          
          const [invitationResult] = await connection.execute(
            'INSERT INTO reservation_invitations (id_reservation, id_user, email, type, status, token, invited_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [reservationId, userId, userEmail, 'internal', 'pending', token, id_user]
          );

          // Send email invitation to internal user
          try {
            await sendInvitationEmail(userEmail, reservationId, invitationResult.insertId);
          } catch (emailError) {
            console.error('Error sending invitation email to internal user:', emailError);
          }

          // Create in-app notification for internal user
          try {
            await connection.execute(
              `INSERT INTO notifications (id_user, type, title, message, data, is_read, created_at) 
               VALUES (?, ?, ?, ?, ?, ?, NOW())`,
              [
                userId,
                'reservation_invitation',
                'Nouvelle invitation à une réservation',
                `Vous avez été invité à une réservation. ID réservation: ${reservationId}`,
                JSON.stringify({ reservation_id: reservationId, invitation_id: invitationResult.insertId }),
                0
              ]
            );
          } catch (notificationError) {
            console.error('Error creating notification:', notificationError);
          }
        }

        // Create external email invitations
        for (const email of external_emails) {
          const token = crypto.randomBytes(32).toString('hex');
          const [invitationResult] = await connection.execute(
            'INSERT INTO reservation_invitations (id_reservation, id_user, email, type, status, token, invited_by) VALUES (?, NULL, ?, ?, ?, ?, ?)',
            [reservationId, email, 'external', 'pending', token, id_user]
          );

          // Send email invitation
          try {
            await sendInvitationEmail(email, reservationId, invitationResult.insertId);
          } catch (emailError) {
            console.error('Error sending invitation email:', emailError);
            // Continue even if email fails
          }
        }

        await connection.commit();

        res.status(201).json({
          success: true,
          message: 'Reservation created with invitations and additional equipments',
          reservationId
        });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error creating reservation with invitations:', error);
      res.status(500).json({ error: 'Failed to create reservation with invitations' });
    }
  },

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { statut, description } = req.body;
      
      const success = await Reservation.updateStatus(id, statut, description);

      if (!success) {
        return res.status(404).json({ error: 'Reservation not found' });
      }

      res.json({
        success: true,
        message: 'Reservation status updated successfully'
      });
    } catch (error) {
      console.error('Error updating reservation status:', error);
      res.status(500).json({ error: 'Failed to update reservation status' });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      
      const success = await Reservation.delete(id);

      if (!success) {
        return res.status(404).json({ error: 'Reservation not found' });
      }

      res.json({
        success: true,
        message: 'Reservation deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting reservation:', error);
      res.status(500).json({ error: 'Failed to delete reservation' });
    }
  },

  async cancel(req, res) {
    try {
      const { id } = req.params;
      const { description } = req.body || {};
      
      const success = await Reservation.updateStatus(id, 'annulée', description);

      if (!success) {
        return res.status(404).json({ error: 'Reservation not found' });
      }

      res.json({
        success: true,
        message: 'Reservation cancelled successfully'
      });
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      res.status(500).json({ error: 'Failed to cancel reservation' });
    }
  },

  async getDetails(req, res) {
    try {
      const { id } = req.params;
      const reservation = await Reservation.getById(id);

      if (!reservation) {
        return res.status(404).json({ error: 'Reservation not found' });
      }

      res.json(reservation);
    } catch (error) {
      console.error('Error fetching reservation details:', error);
      res.status(500).json({ error: 'Failed to fetch reservation details' });
    }
  },

  async getInvitations(req, res) {
    try {
      const { id } = req.params;
      const invitations = await Invitation.getByReservationId(id);
      res.json(invitations);
    } catch (error) {
      console.error('Error fetching reservation invitations:', error);
      res.status(500).json({ error: 'Failed to fetch reservation invitations' });
    }
  },

  async createMulti(req, res) {
    try {
      const { reservations } = req.body;
      
      if (!reservations || !Array.isArray(reservations) || reservations.length === 0) {
        return res.status(400).json({ error: 'Reservations array is required' });
      }

      const connection = await db.getConnection();
      await connection.beginTransaction();

      try {
        const createdReservations = [];
        
        for (const resData of reservations) {
          const [result] = await connection.execute(
            'INSERT INTO reservations (id_equipement, id_user, date_reservation, time_start, time_end, nombre_personnes, statut) VALUES (?, ?, ?, ?, ?, ?, "en_attente")',
            [resData.id_equipement, resData.id_user, resData.date_reservation, resData.time_start, resData.time_end, resData.nombre_personnes || 1]
          );
          createdReservations.push({ id: result.insertId, ...resData });
        }

        await connection.commit();

        res.status(201).json({
          success: true,
          message: 'Multiple reservations created successfully',
          reservations: createdReservations
        });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error creating multiple reservations:', error);
      res.status(500).json({ error: 'Failed to create multiple reservations' });
    }
  },

  async addEquipment(req, res) {
    try {
      const { id } = req.params;
      const { equipment_ids } = req.body;
      
      if (!equipment_ids || !Array.isArray(equipment_ids)) {
        return res.status(400).json({ error: 'Equipment IDs array is required' });
      }

      const connection = await db.getConnection();
      await connection.beginTransaction();

      try {
        for (const equipmentId of equipment_ids) {
          await connection.execute(
            'INSERT INTO reservation_equipments (id_reservation, id_equipement) VALUES (?, ?)',
            [id, equipmentId]
          );
        }

        await connection.commit();

        res.json({
          success: true,
          message: 'Equipment added to reservation successfully'
        });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error adding equipment to reservation:', error);
      res.status(500).json({ error: 'Failed to add equipment to reservation' });
    }
  },

  async getEquipments(req, res) {
    try {
      const { id } = req.params;
      
      const [equipments] = await db.execute(`
        SELECT e.*, re.id_reservation 
        FROM reservation_equipments re
        JOIN equipements e ON re.id_equipement = e.id
        WHERE re.id_reservation = ?
      `, [id]);
      
      res.json(equipments);
    } catch (error) {
      console.error('Error fetching reservation equipments:', error);
      res.status(500).json({ error: 'Failed to fetch reservation equipments' });
    }
  },

  async respondToInvitation(req, res) {
      const { invitationId } = req.params;
      const { response, refusal_reason } = req.body;
      
      await Invitation.updateResponse(invitationId, response, refusal_reason);
      
      res.json({
        success: true,
        message: 'Invitation response updated successfully'
      });
    } catch (error) {
      console.error('Error responding to invitation:', error);
      res.status(500).json({ error: 'Failed to respond to invitation' });
    }
  }
};

module.exports = reservationController;
