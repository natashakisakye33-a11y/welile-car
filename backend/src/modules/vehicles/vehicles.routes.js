const express = require('express');
const { getAllVehicles, getVehicleById, addVehicle, updateVehicle } = require('./vehicles.controller');
const { authenticateToken, requireAdmin } = require('../../shared/middleware/auth.middleware');

const router = express.Router();

// Publicly accessible to authenticated users
router.get('/', authenticateToken, getAllVehicles);
router.get('/:id', authenticateToken, getVehicleById);

// Restricted to Admins
router.post('/', authenticateToken, requireAdmin, addVehicle);
router.put('/:id', authenticateToken, requireAdmin, updateVehicle);

module.exports = router;
