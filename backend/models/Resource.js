const db = require('../config/database');

const Resource = {
  async getAll() {
    const [rows] = await db.execute('SELECT * FROM resources ORDER BY created_at DESC');
    return rows;
  },

  async getById(id) {
    const [rows] = await db.execute('SELECT * FROM resources WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async create({ name, description, image_url }) {
    const [result] = await db.execute(
      'INSERT INTO resources (name, description, image_url) VALUES (?, ?, ?)',
      [name, description ?? null, image_url ?? null]
    );
    return result.insertId;
  },

  async update(id, { name, description, image_url }) {
    const [result] = await db.execute(
      'UPDATE resources SET name = ?, description = ?, image_url = ? WHERE id = ?',
      [name, description ?? null, image_url ?? null, id]
    );
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await db.execute('DELETE FROM resources WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async getEquipment(resourceId) {
    // Récupérer les équipements depuis toutes les nouvelles tables
    const [salles] = await db.execute('SELECT * FROM salles ORDER BY created_at DESC');
    const [vehicules] = await db.execute('SELECT * FROM vehicules ORDER BY created_at DESC');
    const [equipements] = await db.execute('SELECT * FROM equipements ORDER BY created_at DESC');
    
    // Combiner les résultats avec un type pour différencier
    return [
      ...salles.map(item => ({ ...item, type: 'salle' })),
      ...vehicules.map(item => ({ ...item, type: 'vehicule' })),
      ...equipements.map(item => ({ ...item, type: 'equipement' }))
    ];
  }
};

module.exports = Resource;
