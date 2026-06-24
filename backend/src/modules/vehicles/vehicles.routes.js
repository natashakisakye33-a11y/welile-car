const express = require('express');
const multer = require('multer');
const path = require('path');
const { getAllVehicles, getVehicleById, addVehicle, updateVehicle } = require('./vehicles.controller');
const { authenticateToken, requirePermission } = require('../../shared/middleware/auth.middleware');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../../public/uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'vehicle-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Publicly accessible
router.get('/', getAllVehicles);
router.get('/:id', getVehicleById);

// Restricted to Admins
router.post('/', authenticateToken, requirePermission('org:vehicles:create'), upload.array('gallery', 10), addVehicle);
router.put('/:id', authenticateToken, requirePermission('org:vehicles:update'), upload.array('gallery', 10), updateVehicle);

module.exports = router;
