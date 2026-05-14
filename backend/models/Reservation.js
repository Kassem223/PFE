const db = require('../config/database');

const Reservation = {
  async getAll() {
    // D'abord récupérer toutes les réservations avec les infos de la ressource depuis les bonnes tables
    const [reservations] = await db.execute(`
      SELECT r.*, u.prenom, u.nom, 
        COALESCE(s.nom, v.nom, e.nom) as resource_nom,
        COALESCE(s.image_url, v.image_url, e.image_url) as resource_image,
        c.name as category_type
      FROM reservations r
      JOIN users u ON r.id_user = u.id
      LEFT JOIN equipements e ON r.id_equipement = e.id
      LEFT JOIN salles s ON r.id_equipement = s.id
      LEFT JOIN vehicules v ON r.id_equipement = v.id
      LEFT JOIN categories c ON COALESCE(e.category_id, s.category_id, v.category_id) = c.id
      ORDER BY r.created_at DESC
    `);
    
    // Ensuite, récupérer les équipements pour chaque réservation
    for (const reservation of reservations) {
      const [equipments] = await db.execute(`
        SELECT eq.nom
        FROM reservation_equipments re
        JOIN equipements eq ON re.id_equipement = eq.id
        WHERE re.id_reservation = ?
      `, [reservation.id_reservation]);
      
      // Créer la chaîne d'équipements
      if (equipments && equipments.length > 0) {
        reservation.additional_equipements = equipments.map(e => e.nom).join(', ');
      } else {
        reservation.additional_equipements = null;
      }
    }
    
    return reservations;
  },

  async getById(id) {
    const [rows] = await db.execute(`
      SELECT r.*, u.prenom, u.nom, main_eq.nom as equipement_nom,
        (SELECT GROUP_CONCAT(eq.nom, ', ') 
         FROM reservation_equipments re2 
         JOIN equipements eq ON re2.id_equipement = eq.id 
         WHERE re2.id_reservation = r.id_reservation) as additional_equipements
      FROM reservations r
      JOIN users u ON r.id_user = u.id
      LEFT JOIN equipements main_eq ON r.id_equipement = main_eq.id
      WHERE r.id_reservation = ?
    `, [id]);
    return rows[0] || null;
  },

  async getByUserId(userId) {
    const [rows] = await db.execute(`
      SELECT r.*, u.prenom, u.nom,
        CASE
          WHEN r.resource_type = 'salles'     THEN s.nom
          WHEN r.resource_type = 'vehicules'  THEN v.nom
          WHEN r.resource_type = 'equipement' THEN e.nom
          ELSE COALESCE(s.nom, v.nom, e.nom)
        END as resource_nom,
        CASE
          WHEN r.resource_type = 'salles'     THEN s.image_url
          WHEN r.resource_type = 'vehicules'  THEN v.image_url
          WHEN r.resource_type = 'equipement' THEN e.image_url
          ELSE COALESCE(s.image_url, v.image_url, e.image_url)
        END as resource_image,
        (SELECT GROUP_CONCAT(eq.nom, ', ')
         FROM reservation_equipments re2
         JOIN equipements eq ON re2.id_equipement = eq.id
         WHERE re2.id_reservation = r.id_reservation) as additional_equipements,
        COALESCE(r.resource_type,
          CASE
            WHEN s.id IS NOT NULL THEN 'salles'
            WHEN v.id IS NOT NULL THEN 'vehicules'
            WHEN e.id IS NOT NULL THEN 'equipement'
            ELSE 'unknown'
          END
        ) as category_type
      FROM reservations r
      JOIN users u ON r.id_user = u.id
      LEFT JOIN salles s      ON r.id_equipement = s.id AND (r.resource_type = 'salles'     OR r.resource_type IS NULL)
      LEFT JOIN vehicules v   ON r.id_equipement = v.id AND (r.resource_type = 'vehicules'  OR r.resource_type IS NULL)
      LEFT JOIN equipements e ON r.id_equipement = e.id AND (r.resource_type = 'equipement' OR r.resource_type IS NULL)
      WHERE r.id_user = ?
      ORDER BY r.created_at DESC
    `, [userId]);
    return rows;
  },

  async create({ id_equipement, id_user, date_reservation, time_start, time_end, nombre_personnes }) {
    const [result] = await db.execute(
      'INSERT INTO reservations (id_equipement, id_user, date_reservation, time_start, time_end, nombre_personnes, statut) VALUES (?, ?, ?, ?, ?, ?, "en_attente")',
      [id_equipement, id_user, date_reservation, time_start, time_end, nombre_personnes || 1]
    );
    return result.insertId;
  },

  async updateStatus(id, statut, description = null) {
    const [result] = await db.execute(
      'UPDATE reservations SET statut = ? WHERE id_reservation = ?',
      [statut, id]
    );
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await db.execute('DELETE FROM reservations WHERE id_reservation = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = Reservation;
