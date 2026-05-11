const express = require('express');
const router = express.Router();
const invitationController = require('../controllers/invitationController');

router.get('/', invitationController.getMultipleByIds);
router.get('/:id', invitationController.getByReservationId);
router.put('/:id/respond', invitationController.respond);

module.exports = router;
