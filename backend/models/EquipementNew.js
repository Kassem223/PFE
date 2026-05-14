const db = require('../config/database');

const EquipementNew = {
  async getAll() {
    const [rows] = await db.execute(`
      SELECT e.*, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM equipements e 
      JOIN categories c ON e.category_id = c.id 
      ORDER BY e.created_at DESC
    `);
    return rows;
  },

  async getById(id) {
    const [rows] = await db.execute(`
      SELECT e.*, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM equipements e 
      JOIN categories c ON e.category_id = c.id 
      WHERE e.id = ?
    `, [id]);
    return rows[0] || null;
  },

  async getByCategory(categoryId) {
    const [rows] = await db.execute(`
      SELECT e.*, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM equipements e 
      JOIN categories c ON e.category_id = c.id 
      WHERE e.category_id = ?
      ORDER BY e.created_at DESC
    `, [categoryId]);
    return rows;
  },

  async create({ category_id, nom, details, image_url, type_equipement, etat, disponibilite }) {
    const [result] = await db.execute(
      'INSERT INTO equipements (category_id, nom, details, image_url, type_equipement, etat, disponibilite) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [category_id, nom, details || '', image_url || null, type_equipement || null, etat || 'bon', disponibilite !== false]
    );
    return result.insertId;
  },

  async update(id, { nom, details, image_url, type_equipement, etat, disponibilite }) {
    const [result] = await db.execute(
      'UPDATE equipements SET nom = ?, details = ?, image_url = ?, type_equipement = ?, etat = ?, disponibilite = ? WHERE id = ?',
      [nom, details || '', image_url || null, type_equipement || null, etat || 'bon', disponibilite !== false, id]
    );
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await db.execute('DELETE FROM equipements WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async getReservations(equipementId) {
    // Equipements are linked via reservation_salles.equipment_ids JSON array
    const [rows] = await db.execute(`
      SELECT rs.*, u.prenom, u.nom, e.nom AS equipement_nom
      FROM   reservation_salles rs
      JOIN   users      u ON rs.id_user  = u.id
      JOIN   equipements e ON e.id = ?
      WHERE  JSON_CONTAINS(rs.equipment_ids, CAST(? AS JSON))
      ORDER  BY rs.created_at DESC
    `, [equipementId, equipementId]);
    return rows;
  }
};

module.exports = EquipementNew;
