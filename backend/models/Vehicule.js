const db = require('../config/database');

const Vehicule = {
  async getAll() {
    const [rows] = await db.execute(`
      SELECT v.*, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM vehicules v 
      JOIN categories c ON v.category_id = c.id 
      ORDER BY v.created_at DESC
    `);
    return rows;
  },

  async getById(id) {
    const [rows] = await db.execute(`
      SELECT v.*, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM vehicules v 
      JOIN categories c ON v.category_id = c.id 
      WHERE v.id = ?
    `, [id]);
    return rows[0] || null;
  },

  async getByCategory(categoryId) {
    const [rows] = await db.execute(`
      SELECT v.*, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM vehicules v 
      JOIN categories c ON v.category_id = c.id 
      WHERE v.category_id = ?
      ORDER BY v.created_at DESC
    `, [categoryId]);
    return rows;
  },

  async create({ category_id, nom, details, image_url, marque, modele, immatriculation, disponibilite }) {
    const [result] = await db.execute(
      'INSERT INTO vehicules (category_id, nom, details, image_url, marque, modele, immatriculation, disponibilite) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [category_id, nom, details || '', image_url || null, marque || null, modele || null, immatriculation || null, disponibilite !== false]
    );
    return result.insertId;
  },

  async update(id, { nom, details, image_url, marque, modele, immatriculation, disponibilite }) {
    const [result] = await db.execute(
      'UPDATE vehicules SET nom = ?, details = ?, image_url = ?, marque = ?, modele = ?, immatriculation = ?, disponibilite = ? WHERE id = ?',
      [nom, details || '', image_url || null, marque || null, modele || null, immatriculation || null, disponibilite !== false, id]
    );
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await db.execute('DELETE FROM vehicules WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async getReservations(vehiculeId) {
    const [rows] = await db.execute(`
      SELECT rv.*, u.prenom, u.nom, v.nom AS vehicule_nom
      FROM   reservation_vehicules rv
      JOIN   users    u ON rv.id_user     = u.id
      JOIN   vehicules v ON rv.id_vehicule = v.id
      WHERE  rv.id_vehicule = ?
      ORDER  BY rv.created_at DESC
    `, [vehiculeId]);
    return rows;
  }
};

module.exports = Vehicule;
