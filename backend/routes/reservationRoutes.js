const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

// Routes spécifiques (doivent être AVANT les routes paramétrées génériques)
router.get('/', reservationController.getAll);
router.post('/', reservationController.create);
router.post('/with-invitations', reservationController.createWithInvitations);

// Routes avec paramètres spécifiques (avant les routes génériques avec :id)
router.get('/user/:userId', reservationController.getByUserId);
router.get('/invitations', reservationController.getMultipleInvitations);

// Routes génériques avec :id (APRÈS les routes spécifiques)
router.get('/:id/details', reservationController.getDetails);
router.get('/:id/invitations', reservationController.getInvitations);
router.get('/:id/equipments', reservationController.getEquipments);
router.put('/:id/status', reservationController.updateStatus);
router.put('/:id/cancel', reservationController.cancel);
router.delete('/:id', reservationController.delete);

module.exports = router;
