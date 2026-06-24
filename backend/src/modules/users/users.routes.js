const express = require('express');
const { submitKyc, getMyProfile, approveKyc, updateMyRole } = require('./users.controller');
const { authenticateToken, requirePermission } = require('../../shared/middleware/auth.middleware');

const router = express.Router();

router.get('/me', authenticateToken, getMyProfile);
router.put('/me/role', authenticateToken, updateMyRole);
router.post('/kyc', authenticateToken, submitKyc);
router.put('/:userId/kyc', authenticateToken, requirePermission('org:kyc:review'), approveKyc);

module.exports = router;
