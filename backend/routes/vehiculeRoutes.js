const express = require('express');
const router = express.Router();
const vehiculeController = require('../controllers/vehiculeController');

router.get('/', vehiculeController.getAll);
router.get('/category/:categoryId', vehiculeController.getByCategory);
router.get('/:id', vehiculeController.getById);
router.post('/', vehiculeController.create);
router.put('/:id', vehiculeController.update);
router.delete('/:id', vehiculeController.delete);
router.get('/:id/reservations', vehiculeController.getReservations);

module.exports = router;
