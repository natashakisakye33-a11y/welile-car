const express = require('express');
const { calculateSavings, getMySavings } = require('./savings.controller');
const { authenticateToken } = require('../../shared/middleware/auth.middleware');

const router = express.Router();

router.post('/calculate', calculateSavings); // Public or authenticated depending on usage. Currently public in app.js
router.get('/my-account', authenticateToken, getMySavings);

module.exports = router;
