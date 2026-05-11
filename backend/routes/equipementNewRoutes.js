const express = require('express');
const router = express.Router();
const equipementNewController = require('../controllers/equipementNewController');

router.get('/', equipementNewController.getAll);
router.get('/category/:categoryId', equipementNewController.getByCategory);
router.get('/:id', equipementNewController.getById);
router.post('/', equipementNewController.create);
router.put('/:id', equipementNewController.update);
router.delete('/:id', equipementNewController.delete);
router.get('/:id/reservations', equipementNewController.getReservations);

module.exports = router;
