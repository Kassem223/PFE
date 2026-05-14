const db = require('../config/database');

const Equipment = {
  async getAll() {
    // Récupérer depuis toutes les nouvelles tables
    const [salles] = await db.execute('SELECT * FROM salles ORDER BY created_at DESC');
    const [vehicules] = await db.execute('SELECT * FROM vehicules ORDER BY created_at DESC');
    const [equipements] = await db.execute('SELECT * FROM equipements ORDER BY created_at DESC');
    
    // Combiner les résultats avec un type pour différencier
    return [
      ...salles.map(item => ({ ...item, type: 'salle' })),
      ...vehicules.map(item => ({ ...item, type: 'vehicule' })),
      ...equipements.map(item => ({ ...item, type: 'equipement' }))
    ];
  },

  async getById(id) {
    // Chercher dans toutes les tables
    const [salles] = await db.execute('SELECT * FROM salles WHERE id = ?', [id]);
    if (salles[0]) return { ...salles[0], type: 'salle' };
    
    const [vehicules] = await db.execute('SELECT * FROM vehicules WHERE id = ?', [id]);
    if (vehicules[0]) return { ...vehicules[0], type: 'vehicule' };
    
    const [equipements] = await db.execute('SELECT * FROM equipements WHERE id = ?', [id]);
    if (equipements[0]) return { ...equipements[0], type: 'equipement' };
    
    return null;
  },

  async create({ id_ressources, nom, details, image_url }) {
    // Cette méthode n'est plus utilisée avec les nouvelles tables
    throw new Error('Use specific models (Salle, Vehicule, EquipementNew) instead');
  },

  async update(id, { nom, details, image_url }) {
    // Cette méthode n'est plus utilisée avec les nouvelles tables
    throw new Error('Use specific models (Salle, Vehicule, EquipementNew) instead');
  },

  async delete(id) {
    // Cette méthode n'est plus utilisée avec les nouvelles tables
    throw new Error('Use specific models (Salle, Vehicule, EquipementNew) instead');
  },

  async getReservations(equipmentId) {
    // Check which table this ID belongs to and query accordingly
    const [salles] = await db.execute('SELECT id FROM salles WHERE id = ?', [equipmentId]);
    if (salles.length) {
      const [rows] = await db.execute(`
        SELECT rs.*, u.prenom, u.nom, s.nom AS equipement_nom
        FROM   reservation_salles rs
        JOIN   users  u ON rs.id_user  = u.id
        JOIN   salles s ON rs.id_salle = s.id
        WHERE  rs.id_salle = ?
        ORDER  BY rs.created_at DESC
      `, [equipmentId]);
      return rows;
    }

    const [vehicules] = await db.execute('SELECT id FROM vehicules WHERE id = ?', [equipmentId]);
    if (vehicules.length) {
      const [rows] = await db.execute(`
        SELECT rv.*, u.prenom, u.nom, v.nom AS equipement_nom
        FROM   reservation_vehicules rv
        JOIN   users    u ON rv.id_user     = u.id
        JOIN   vehicules v ON rv.id_vehicule = v.id
        WHERE  rv.id_vehicule = ?
        ORDER  BY rv.created_at DESC
      `, [equipmentId]);
      return rows;
    }

    const [equipements] = await db.execute('SELECT id FROM equipements WHERE id = ?', [equipmentId]);
    if (equipements.length) {
      // Equipements are linked via reservation_salles.equipment_ids (JSON array)
      const [rows] = await db.execute(`
        SELECT rs.*, u.prenom, u.nom, s.nom AS equipement_nom
        FROM   reservation_salles rs
        JOIN   users  u ON rs.id_user  = u.id
        JOIN   salles s ON rs.id_salle = s.id
        WHERE  JSON_CONTAINS(rs.equipment_ids, CAST(? AS JSON))
        ORDER  BY rs.created_at DESC
      `, [equipmentId]);
      return rows;
    }

    return [];
  }
};

module.exports = Equipment;
