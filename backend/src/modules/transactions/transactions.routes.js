const express = require('express');
const { deposit, withdraw, getHistory, paymentWebhook, payFromWallet } = require('./transactions.controller');
const { authenticateToken } = require('../../shared/middleware/auth.middleware');

const router = express.Router();

router.post('/deposit', authenticateToken, deposit);
router.post('/withdraw', authenticateToken, withdraw);
router.post('/pay-from-wallet', authenticateToken, payFromWallet);
router.get('/history', authenticateToken, getHistory);
router.post('/webhook/payment', paymentWebhook);

module.exports = router;
