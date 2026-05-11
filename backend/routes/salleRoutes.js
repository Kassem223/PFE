const express = require('express');
const router = express.Router();
const salleController = require('../controllers/salleController');

router.get('/', salleController.getAll);
router.get('/category/:categoryId', salleController.getByCategory);
router.get('/:id', salleController.getById);
router.post('/', salleController.create);
router.put('/:id', salleController.update);
router.delete('/:id', salleController.delete);
router.get('/:id/reservations', salleController.getReservations);

module.exports = router;
