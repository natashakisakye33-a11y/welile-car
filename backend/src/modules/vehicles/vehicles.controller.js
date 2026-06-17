const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(vehicles);
  } catch (error) {
    console.error('Get All Vehicles Error:', error);
    res.status(500).json({ error: 'Server error retrieving vehicles' });
  }
};

const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    res.json(vehicle);
  } catch (error) {
    console.error('Get Vehicle Error:', error);
    res.status(500).json({ error: 'Server error retrieving vehicle' });
  }
};

const addVehicle = async (req, res) => {
  try {
    const { make, model, year, price, status } = req.body;
    
    if (!make || !model || !year || !price) {
      return res.status(400).json({ error: 'Missing required vehicle fields' });
    }

    const newVehicle = await prisma.vehicle.create({
      data: {
        make,
        model,
        year: parseInt(year),
        price: parseFloat(price),
        status: status || 'AVAILABLE',
        dealerId: req.user.id // Assuming the admin/dealer is the one adding it
      }
    });

    res.status(201).json({ message: 'Vehicle added successfully', vehicle: newVehicle });
  } catch (error) {
    console.error('Add Vehicle Error:', error);
    res.status(500).json({ error: 'Server error adding vehicle' });
  }
};

const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { make, model, year, price, status } = req.body;

    const vehicle = await prisma.vehicle.update({
      where: { id: parseInt(id) },
      data: {
        make,
        model,
        year: year ? parseInt(year) : undefined,
        price: price ? parseFloat(price) : undefined,
        status
      }
    });

    res.json({ message: 'Vehicle updated successfully', vehicle });
  } catch (error) {
    console.error('Update Vehicle Error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.status(500).json({ error: 'Server error updating vehicle' });
  }
};

module.exports = {
  getAllVehicles,
  getVehicleById,
  addVehicle,
  updateVehicle
};
