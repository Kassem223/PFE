const db = require('../config/database');

const Category = {
  async getAll() {
    const [rows] = await db.execute('SELECT * FROM categories ORDER BY name ASC');
    return rows;
  },

  async getById(id) {
    const [rows] = await db.execute('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async getByName(name) {
    const [rows] = await db.execute('SELECT * FROM categories WHERE name = ?', [name]);
    return rows[0] || null;
  },

  async create({ name, description, icon, color }) {
    const [result] = await db.execute(
      'INSERT INTO categories (name, description, icon, color) VALUES (?, ?, ?, ?)',
      [name, description, icon, color]
    );
    return result.insertId;
  },

  async update(id, { name, description, icon, color }) {
    const [result] = await db.execute(
      'UPDATE categories SET name = ?, description = ?, icon = ?, color = ? WHERE id = ?',
      [name, description, icon, color, id]
    );
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await db.execute('DELETE FROM categories WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = Category;
