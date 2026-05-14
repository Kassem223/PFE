const User = require('../models/User');

const userController = {
  async getAll(req, res) {
    try {
      const users = await User.getAll();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.getById(id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const { mdp, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error fetching user by id:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  },

  async create(req, res) {
    try {
      const { nom, prenom, email, mdp, password, role, departement, adresse, jobtitle, telephone } = req.body;
      
      // Accept both 'mdp' and 'password' field names
      const pwd = mdp || password;
      
      // Only require essential fields
      if (!nom || !prenom || !email || !pwd) {
        return res.status(400).json({ error: 'Nom, Prénom, Email et Mot de passe sont requis' });
      }

      // Check if email already exists
      const existingUser = await User.getByEmail(email);

      if (existingUser) {
        return res.status(400).json({ error: 'Cet email existe déjà' });
      }

      const userId = await User.create({ 
        nom, 
        prenom, 
        email, 
        mdp: pwd, 
        role: role || 'user', 
        departement: departement || null,
        adresse: adresse || null,
        jobtitle: jobtitle || null,
        telephone: telephone || null
      });

      // Fetch the created user to return it
      const newUser = await User.getById(userId);
      const { mdp: _, ...userWithoutPassword } = newUser;

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Erreur lors de la création du compte' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { nom, prenom, email, role, departement, adresse, jobtitle, telephone, profile_image, profile_picture } = req.body;
      
      // Accept both field names for profile image
      const profileImg = profile_picture || profile_image || null;
      
      const success = await User.update(id, { nom, prenom, email, role, departement, adresse, jobtitle, telephone, profile_image: profileImg });

      if (!success) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        success: true,
        message: 'User updated successfully'
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      
      const success = await User.delete(id);

      if (!success) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
};

module.exports = userController;
