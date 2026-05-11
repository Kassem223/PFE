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
    // Chercher les réservations en fonction du type d'équipement
    const [salles] = await db.execute('SELECT * FROM salles WHERE id = ?', [equipmentId]);
    if (salles[0]) {
      const [rows] = await db.execute(`
        SELECT r.*, u.prenom, u.nom, s.nom as equipement_nom
        FROM reservations r
        JOIN users u ON r.id_user = u.id
        JOIN salles s ON r.id_equipement = s.id
        WHERE r.id_equipement = ?
        ORDER BY r.created_at DESC
      `, [equipmentId]);
      return rows;
    }
    
    const [vehicules] = await db.execute('SELECT * FROM vehicules WHERE id = ?', [equipmentId]);
    if (vehicules[0]) {
      const [rows] = await db.execute(`
        SELECT r.*, u.prenom, u.nom, v.nom as equipement_nom
        FROM reservations r
        JOIN users u ON r.id_user = u.id
        JOIN vehicules v ON r.id_equipement = v.id
        WHERE r.id_equipement = ?
        ORDER BY r.created_at DESC
      `, [equipmentId]);
      return rows;
    }
    
    const [equipements] = await db.execute('SELECT * FROM equipements WHERE id = ?', [equipmentId]);
    if (equipements[0]) {
      const [rows] = await db.execute(`
        SELECT r.*, u.prenom, u.nom, e.nom as equipement_nom
        FROM reservations r
        JOIN users u ON r.id_user = u.id
        JOIN equipements e ON r.id_equipement = e.id
        WHERE r.id_equipement = ?
        ORDER BY r.created_at DESC
      `, [equipmentId]);
      return rows;
    }
    
    return [];
  }
};

module.exports = Equipment;
