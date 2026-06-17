const express = require('express');
const { 
  getExecutiveStats, getAllLoans, updateLoanStatus, getRecoveryStats, 
  getPendingDeposits, approveDeposit, rejectDeposit,
  getPendingWithdrawals, approveWithdrawal, rejectWithdrawal
} = require('./admin.controller');
const { authenticateToken, requireAdmin } = require('../../shared/middleware/auth.middleware');

const router = express.Router();

// Apply auth and requireAdmin to all routes in this router
router.use(authenticateToken);
router.use(requireAdmin);

router.get('/stats/executive', getExecutiveStats);
router.get('/stats/recovery', getRecoveryStats);
router.get('/loans', getAllLoans);
router.put('/loans/:id', updateLoanStatus);

router.get('/deposits/pending', getPendingDeposits);
router.post('/deposits/:id/approve', approveDeposit);
router.post('/deposits/:id/reject', rejectDeposit);

router.get('/withdrawals/pending', getPendingWithdrawals);
router.post('/withdrawals/:id/approve', approveWithdrawal);
router.post('/withdrawals/:id/reject', rejectWithdrawal);

module.exports = router;
