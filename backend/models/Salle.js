const db = require('../config/database');

const Salle = {
  async getAll() {
    const [rows] = await db.execute(`
      SELECT s.*, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM salles s 
      JOIN categories c ON s.category_id = c.id 
      ORDER BY s.created_at DESC
    `);
    return rows;
  },

  async getById(id) {
    const [rows] = await db.execute(`
      SELECT s.*, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM salles s 
      JOIN categories c ON s.category_id = c.id 
      WHERE s.id = ?
    `, [id]);
    return rows[0] || null;
  },

  async getByCategory(categoryId) {
    const [rows] = await db.execute(`
      SELECT s.*, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM salles s 
      JOIN categories c ON s.category_id = c.id 
      WHERE s.category_id = ?
      ORDER BY s.created_at DESC
    `, [categoryId]);
    return rows;
  },

  async create({ category_id, nom, details, image_url, capacite, disponibilite }) {
    const [result] = await db.execute(
      'INSERT INTO salles (category_id, nom, details, image_url, capacite, disponibilite) VALUES (?, ?, ?, ?, ?, ?)',
      [category_id, nom, details || '', image_url || null, capacite || 0, disponibilite !== false]
    );
    return result.insertId;
  },

  async update(id, { nom, details, image_url, capacite, disponibilite }) {
    const [result] = await db.execute(
      'UPDATE salles SET nom = ?, details = ?, image_url = ?, capacite = ?, disponibilite = ? WHERE id = ?',
      [nom, details || '', image_url || null, capacite || 0, disponibilite !== false, id]
    );
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await db.execute('DELETE FROM salles WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async getReservations(salleId) {
    const [rows] = await db.execute(`
      SELECT r.*, u.prenom, u.nom, s.nom as salle_nom
      FROM reservations r
      JOIN users u ON r.id_user = u.id
      JOIN salles s ON r.id_salle = s.id
      WHERE r.id_salle = ?
      ORDER BY r.created_at DESC
    `, [salleId]);
    return rows;
  }
};

module.exports = Salle;
