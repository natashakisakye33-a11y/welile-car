const express = require('express');
const { getExecutiveStats, getAllLoans, updateLoanStatus, getRecoveryStats } = require('./admin.controller');
const { authenticateToken, requireAdmin } = require('../../shared/middleware/auth.middleware');

const router = express.Router();

// Apply auth and requireAdmin to all routes in this router
router.use(authenticateToken);
router.use(requireAdmin);

router.get('/stats/executive', getExecutiveStats);
router.get('/stats/recovery', getRecoveryStats);
router.get('/loans', getAllLoans);
router.put('/loans/:id', updateLoanStatus);

module.exports = router;
