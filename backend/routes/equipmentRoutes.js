const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');

router.post('/resources/:id/equipment', equipmentController.createForResource);
router.put('/equipment/:id', equipmentController.update);
router.delete('/equipment/:id', equipmentController.delete);
router.get('/equipment/:id/reservations', equipmentController.getReservations);

module.exports = router;
