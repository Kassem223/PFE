const User = require('../models/User');

const authController = {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await User.getByEmail(email);

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Check if user has password (mdp field)
      if (!user.mdp) {
        console.error('Password field is undefined for user:', user.email);
        return res.status(500).json({ error: 'User account is not properly configured' });
      }
      
      const isValidPassword = await User.verifyPassword(password, user.mdp);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Remove password from response
      const { mdp, ...userWithoutPassword } = user;

      res.json({
        success: true,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = authController;
