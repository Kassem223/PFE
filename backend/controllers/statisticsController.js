const db = require('../config/database');

const statisticsController = {
  async getAdminStatistics(req, res) {
    try {
      const queries = {
        // Basic counts
        totalAccounts: 'SELECT COUNT(*) as count FROM users',
        managerAccounts: 'SELECT COUNT(*) as count FROM users WHERE role = "manager"',
        adminAccounts: 'SELECT COUNT(*) as count FROM users WHERE role = "admin"',
        userAccounts: 'SELECT COUNT(*) as count FROM users WHERE role = "user"',
        recentAccounts: 'SELECT COUNT(*) as count FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)',
        
        // Account statistics
        accountsByRole: `
          SELECT role, COUNT(*) as count 
          FROM users 
          GROUP BY role 
          ORDER BY count DESC
        `,
        accountsByDepartment: `
          SELECT departement, COUNT(*) as count 
          FROM users 
          WHERE departement IS NOT NULL 
          GROUP BY departement 
          ORDER BY count DESC
        `,
        monthlyRegistrations: `
          SELECT DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as count 
          FROM users 
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
          GROUP BY DATE_FORMAT(created_at, "%Y-%m") 
          ORDER BY month DESC
        `,
        
        // Reservation statistics
        totalReservations: 'SELECT COUNT(*) as count FROM reservations',
        activeReservations: 'SELECT COUNT(*) as count FROM reservations WHERE statut = "acceptée"',
        completedReservations: 'SELECT COUNT(*) as count FROM reservations WHERE statut = "terminée"',
        equipementCount: 'SELECT COUNT(*) as count FROM equipements',
        
        // Manager reservations
        managerReservations: `
          SELECT u.nom, u.prenom, COUNT(r.id_reservation) as reservation_count
          FROM users u 
          LEFT JOIN reservations r ON u.id = r.id_user
          WHERE u.role = 'manager' 
          GROUP BY u.id, u.nom, u.prenom 
          ORDER BY reservation_count DESC 
          LIMIT 10
        `,
        
        // Reservations by creator role
        reservationsByCreatorRole: `
          SELECT 
            CASE 
              WHEN u.role = 'administrateur' THEN 'admin'
              WHEN u.role = 'admin' THEN 'admin'
              ELSE u.role
            END as creator_role,
            COUNT(r.id_reservation) as count 
          FROM reservations r 
          JOIN users u ON r.id_user = u.id 
          GROUP BY u.role 
          ORDER BY count DESC
        `,
        
        // Monthly activity by role
        monthlyActivityByRole: `
          SELECT 
            DATE_FORMAT(r.created_at, "%Y-%m") as month,
            CASE 
              WHEN u.role = 'administrateur' THEN 'admin'
              WHEN u.role = 'admin' THEN 'admin'
              ELSE u.role
            END as role,
            COUNT(r.id_reservation) as count
          FROM reservations r 
          JOIN users u ON r.id_user = u.id 
          WHERE r.created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
          GROUP BY DATE_FORMAT(r.created_at, "%Y-%m"), u.role 
          ORDER BY month DESC, count DESC
        `,
        
        // Recent registrations by role
        recentRegistrationsByRole: `
          SELECT 
            role,
            COUNT(*) as count
          FROM users 
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
          GROUP BY role 
          ORDER BY count DESC
        `,
        
        // Department activity
        departmentActivity: `
          SELECT 
            u.departement,
            COUNT(DISTINCT u.id) as user_count,
            COUNT(r.id_reservation) as reservation_count
          FROM users u 
          LEFT JOIN reservations r ON u.id = r.id_user 
          WHERE u.departement IS NOT NULL
          GROUP BY u.departement 
          ORDER BY reservation_count DESC
        `,
        
        // Top active users
        topActiveUsers: `
          SELECT 
            u.nom, 
            u.prenom, 
            u.role,
            COUNT(r.id_reservation) as reservation_count,
            MAX(r.created_at) as last_activity
          FROM users u 
          LEFT JOIN reservations r ON u.id = r.id_user 
          WHERE u.role IN ('manager', 'admin')
          GROUP BY u.id, u.nom, u.prenom, u.role 
          HAVING reservation_count > 0
          ORDER BY reservation_count DESC 
          LIMIT 10
        `,
        // Reservations by status
        reservationsByStatus: `
          SELECT statut, COUNT(*) as count 
          FROM reservations 
          GROUP BY statut 
          ORDER BY count DESC
        `
      };

      const results = {};
      const errors = {};

      // Execute all queries sequentially for better error handling
      for (const [key, query] of Object.entries(queries)) {
        try {
          console.log(`Executing query: ${key}`);
          const [rows] = await db.execute(query);
          results[key] = rows;
          console.log(`Query ${key} completed successfully with ${rows.length} rows`);
        } catch (error) {
          console.error(`Error in query ${key}:`, error);
          errors[key] = error.message;
          results[key] = [];
        }
      }

      if (Object.keys(errors).length > 0) {
        console.log('Some queries failed:', errors);
      }

      res.json(results);
    } catch (error) {
      console.error('Error fetching admin statistics:', error);
      res.status(500).json({ 
        error: 'Failed to fetch admin statistics',
        details: error.message 
      });
    }
  },

  async getManagerTest(req, res) {
    try {
      console.log('Manager statistics test endpoint called');
      
      // Initialize database connection
      const [testResult] = await db.execute('SELECT 1 as test');
      console.log('Database connection test successful:', testResult);
      
      // Test basic users query
      const [usersResult] = await db.execute('SELECT COUNT(*) as count FROM users');
      console.log('Users query successful:', usersResult);
      
      res.json({
        success: true,
        message: 'Manager statistics test successful',
        databaseConnection: 'OK',
        userCount: usersResult[0].count
      });
    } catch (error) {
      console.error('Manager statistics test failed:', error);
      res.status(500).json({ 
        error: 'Manager statistics test failed',
        details: error.message 
      });
    }
  },

  async getManagerStatistics(req, res) {
    try {
      console.log('Manager statistics endpoint called');
      
      const queries = {
        totalReservations: 'SELECT COUNT(*) as count FROM reservations',
        activeReservations: 'SELECT COUNT(*) as count FROM reservations WHERE statut = "confirmée"',
        pendingReservations: 'SELECT COUNT(*) as count FROM reservations WHERE statut = "en_attente"',
        completedReservations: 'SELECT COUNT(*) as count FROM reservations WHERE statut = "terminée"',
        cancelledReservations: 'SELECT COUNT(*) as count FROM reservations WHERE statut = "annulée"',
        equipementCount: 'SELECT COUNT(*) as count FROM equipements',
        availableEquipment: 'SELECT COUNT(*) as count FROM equipements WHERE disponibilite = 1',
        maintenanceEquipment: 'SELECT COUNT(*) as count FROM equipements WHERE etat = "maintenance"',
        
        reservationsByStatus: `
          SELECT statut, COUNT(*) as count 
          FROM reservations 
          GROUP BY statut 
          ORDER BY count DESC
        `,
        
        reservationsByMonth: `
          SELECT DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as count 
          FROM reservations 
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
          GROUP BY DATE_FORMAT(created_at, "%Y-%m") 
          ORDER BY month DESC
        `,
        
        equipementByStatus: `
          SELECT status, COUNT(*) as count 
          FROM equipements 
          GROUP BY status 
          ORDER BY count DESC
        `,
        
        recentReservations: `
          SELECT r.*, u.prenom, u.nom, e.nom as equipement_nom
          FROM reservations r
          JOIN users u ON r.id_user = u.id
          JOIN equipements e ON r.id_equipement = e.id
          ORDER BY r.created_at DESC
          LIMIT 10
        `
      };

      const results = {};
      const errors = {};

      // Execute all queries sequentially for better error handling
      for (const [key, query] of Object.entries(queries)) {
        try {
          console.log(`Executing manager query: ${key}`);
          const [rows] = await db.execute(query);
          results[key] = rows;
          console.log(`Manager query ${key} completed successfully with ${rows.length} rows`);
        } catch (error) {
          console.error(`Error in manager query ${key}:`, error);
          errors[key] = error.message;
          results[key] = [];
        }
      }

      if (Object.keys(errors).length > 0) {
        console.log('Some manager queries failed:', errors);
      }

      console.log('Manager statistics completed, returning results');
      res.json(results);
    } catch (error) {
      console.error('Error fetching manager statistics:', error);
      res.status(500).json({ 
        error: 'Failed to fetch manager statistics',
        details: error.message 
      });
    }
  }
};

module.exports = statisticsController;
