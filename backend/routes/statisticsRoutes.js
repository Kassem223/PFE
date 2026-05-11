const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');

router.get('/admin', statisticsController.getAdminStatistics);
router.get('/manager/test', statisticsController.getManagerTest);
router.get('/manager', statisticsController.getManagerStatistics);

module.exports = router;
