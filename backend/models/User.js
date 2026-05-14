const db = require('../config/database');
const bcrypt = require('bcryptjs');

const User = {
  async getAll() {
    const [rows] = await db.execute('SELECT * FROM users ORDER BY created_at DESC');
    const usersWithoutPasswords = rows.map(({ mdp, ...user }) => user);
    return usersWithoutPasswords;
  },

  async getById(id) {
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    return rows[0];
  },

  async getByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  async create({ nom, prenom, email, mdp, password, role, departement, adresse, jobtitle, telephone }) {
    // Accept both 'mdp' and 'password' field names
    const pwd = mdp || password;
    const hashedPassword = await bcrypt.hash(pwd, 10);
    
    try {
      // Try to insert with all fields
      const [result] = await db.execute(
        'INSERT INTO users (nom, prenom, email, mdp, role, departement, adresse, jobtitle, telephone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [nom, prenom, email, hashedPassword, role, departement ?? null, adresse ?? null, jobtitle ?? null, telephone ?? null]
      );
      return result.insertId;
    } catch (error) {
      // If columns don't exist, try without them
      if (error.code === 'ER_BAD_FIELD_ERROR') {
        const [result] = await db.execute(
          'INSERT INTO users (nom, prenom, email, mdp, role, departement) VALUES (?, ?, ?, ?, ?, ?)',
          [nom, prenom, email, hashedPassword, role, departement ?? null]
        );
        return result.insertId;
      }
      throw error;
    }
  },

  async update(id, { nom, prenom, email, role, departement, adresse, jobtitle, telephone, profile_image }) {
    const [result] = await db.execute(
      'UPDATE users SET nom = ?, prenom = ?, departement = ?, adresse = ?, jobtitle = ?, telephone = ?, profile_picture = ? WHERE id = ?',
      [nom ?? null, prenom ?? null, departement ?? null, adresse ?? null, jobtitle ?? null, telephone ?? null, profile_image ?? null, id]
    );
    // affectedRows can be 0 if data is unchanged — still a success if the user exists
    return result.affectedRows > 0 || result.warningStatus === 0;
  },

  async delete(id) {
    const [result] = await db.execute('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
};

module.exports = User;
