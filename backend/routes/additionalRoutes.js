const express = require('express');
const router = express.Router();
const additionalController = require('../controllers/additionalController');

router.post('/invite-manager', additionalController.inviteManager);
router.get('/verify-invitation/:token', additionalController.verifyInvitation);
router.post('/register-from-invitation', additionalController.registerFromInvitation);

router.get('/health', additionalController.healthCheck);

module.exports = router;
