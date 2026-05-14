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
        
        // Reservation statistics — union both tables
        totalReservations: `
          SELECT (SELECT COUNT(*) FROM reservation_salles) +
                 (SELECT COUNT(*) FROM reservation_vehicules) AS count
        `,
        activeReservations: `
          SELECT (SELECT COUNT(*) FROM reservation_salles    WHERE statut = 'confirmée') +
                 (SELECT COUNT(*) FROM reservation_vehicules WHERE statut = 'confirmée') AS count
        `,
        completedReservations: `
          SELECT (SELECT COUNT(*) FROM reservation_salles    WHERE statut = 'terminée') +
                 (SELECT COUNT(*) FROM reservation_vehicules WHERE statut = 'terminée') AS count
        `,
        equipementCount: 'SELECT COUNT(*) as count FROM equipements',
        
        // Manager reservations — union both tables
        managerReservations: `
          SELECT u.nom, u.prenom,
                 COUNT(r.id) AS reservation_count
          FROM users u
          LEFT JOIN (
            SELECT id, id_user FROM reservation_salles
            UNION ALL
            SELECT id, id_user FROM reservation_vehicules
          ) r ON u.id = r.id_user
          WHERE u.role = 'manager'
          GROUP BY u.id, u.nom, u.prenom
          ORDER BY reservation_count DESC
          LIMIT 10
        `,
        
        // Reservations by creator role — union both tables
        reservationsByCreatorRole: `
          SELECT
            CASE WHEN u.role IN ('administrateur','admin') THEN 'admin' ELSE u.role END AS creator_role,
            COUNT(r.id) AS count
          FROM (
            SELECT id, id_user FROM reservation_salles
            UNION ALL
            SELECT id, id_user FROM reservation_vehicules
          ) r
          JOIN users u ON r.id_user = u.id
          GROUP BY u.role
          ORDER BY count DESC
        `,
        
        // Monthly activity by role — union both tables
        monthlyActivityByRole: `
          SELECT
            DATE_FORMAT(r.created_at, '%Y-%m') AS month,
            CASE WHEN u.role IN ('administrateur','admin') THEN 'admin' ELSE u.role END AS role,
            COUNT(r.id) AS count
          FROM (
            SELECT id, id_user, created_at FROM reservation_salles
            UNION ALL
            SELECT id, id_user, created_at FROM reservation_vehicules
          ) r
          JOIN users u ON r.id_user = u.id
          WHERE r.created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
          GROUP BY DATE_FORMAT(r.created_at, '%Y-%m'), u.role
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
        
        // Department activity — union both tables
        departmentActivity: `
          SELECT
            u.departement,
            COUNT(DISTINCT u.id) AS user_count,
            COUNT(r.id)          AS reservation_count
          FROM users u
          LEFT JOIN (
            SELECT id, id_user FROM reservation_salles
            UNION ALL
            SELECT id, id_user FROM reservation_vehicules
          ) r ON u.id = r.id_user
          WHERE u.departement IS NOT NULL
          GROUP BY u.departement
          ORDER BY reservation_count DESC
        `,
        
        // Top active users — union both tables
        topActiveUsers: `
          SELECT
            u.nom, u.prenom, u.role,
            COUNT(r.id)          AS reservation_count,
            MAX(r.created_at)    AS last_activity
          FROM users u
          LEFT JOIN (
            SELECT id, id_user, created_at FROM reservation_salles
            UNION ALL
            SELECT id, id_user, created_at FROM reservation_vehicules
          ) r ON u.id = r.id_user
          WHERE u.role IN ('manager','admin')
          GROUP BY u.id, u.nom, u.prenom, u.role
          HAVING reservation_count > 0
          ORDER BY reservation_count DESC
          LIMIT 10
        `,
        // Reservations by status — union both tables
        reservationsByStatus: `
          SELECT statut, COUNT(*) AS count
          FROM (
            SELECT statut FROM reservation_salles
            UNION ALL
            SELECT statut FROM reservation_vehicules
          ) combined
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
        totalReservations: `
          SELECT (SELECT COUNT(*) FROM reservation_salles) +
                 (SELECT COUNT(*) FROM reservation_vehicules) AS count
        `,
        activeReservations: `
          SELECT (SELECT COUNT(*) FROM reservation_salles    WHERE statut = 'confirmée') +
                 (SELECT COUNT(*) FROM reservation_vehicules WHERE statut = 'confirmée') AS count
        `,
        pendingReservations: `
          SELECT (SELECT COUNT(*) FROM reservation_salles    WHERE statut = 'en_attente') +
                 (SELECT COUNT(*) FROM reservation_vehicules WHERE statut = 'en_attente') AS count
        `,
        completedReservations: `
          SELECT (SELECT COUNT(*) FROM reservation_salles    WHERE statut = 'terminée') +
                 (SELECT COUNT(*) FROM reservation_vehicules WHERE statut = 'terminée') AS count
        `,
        cancelledReservations: `
          SELECT (SELECT COUNT(*) FROM reservation_salles    WHERE statut = 'annulée') +
                 (SELECT COUNT(*) FROM reservation_vehicules WHERE statut = 'annulée') AS count
        `,
        equipementCount: 'SELECT COUNT(*) as count FROM equipements',
        availableEquipment: 'SELECT COUNT(*) as count FROM equipements WHERE disponibilite = 1',
        maintenanceEquipment: 'SELECT COUNT(*) as count FROM equipements WHERE etat = "maintenance"',
        
        reservationsByStatus: `
          SELECT statut, COUNT(*) AS count
          FROM (
            SELECT statut FROM reservation_salles
            UNION ALL
            SELECT statut FROM reservation_vehicules
          ) combined
          GROUP BY statut
          ORDER BY count DESC
        `,
        
        reservationsByMonth: `
          SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count
          FROM (
            SELECT created_at FROM reservation_salles
            UNION ALL
            SELECT created_at FROM reservation_vehicules
          ) combined
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
          GROUP BY DATE_FORMAT(created_at, '%Y-%m')
          ORDER BY month DESC
        `,
        
        equipementByStatus: `
          SELECT etat as status, COUNT(*) as count 
          FROM equipements 
          GROUP BY etat 
          ORDER BY count DESC
        `,
        
        recentReservations: `
          SELECT r.id AS id_reservation, r.id_user, r.date_reservation,
                 r.time_start, r.time_end, r.statut, r.created_at,
                 u.prenom, u.nom,
                 s.nom AS equipement_nom,
                 'salles' AS resource_type
          FROM   reservation_salles r
          JOIN   users  u ON r.id_user  = u.id
          JOIN   salles s ON r.id_salle = s.id
          UNION ALL
          SELECT r.id, r.id_user, r.date_reservation,
                 r.time_start, r.time_end, r.statut, r.created_at,
                 u.prenom, u.nom,
                 v.nom AS equipement_nom,
                 'vehicules' AS resource_type
          FROM   reservation_vehicules r
          JOIN   users    u ON r.id_user     = u.id
          JOIN   vehicules v ON r.id_vehicule = v.id
          ORDER  BY created_at DESC
          LIMIT  10
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
