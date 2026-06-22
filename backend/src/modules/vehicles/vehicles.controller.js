const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const mapVehicleForFrontend = (vehicle) => {
  return {
    id: String(vehicle.id),
    name: `${vehicle.make} ${vehicle.model}`,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    type: vehicle.type || 'Unknown',
    tagline: vehicle.tagline || '',
    priceUgx: vehicle.price,
    priceStr: `${(vehicle.price / 1000000).toFixed(1)}M UGX`,
    oldPriceRange: 'N/A',
    oldMin: vehicle.price,
    oldMax: vehicle.price,
    newPriceRange: 'N/A',
    newMin: vehicle.price,
    newMax: vehicle.price,
    image: vehicle.image || 'https://via.placeholder.com/400x300?text=No+Image',
    gallery: vehicle.gallery && vehicle.gallery.length > 0 ? vehicle.gallery : [vehicle.image || 'https://via.placeholder.com/400x300?text=No+Image'],
    specs: vehicle.specs || {
      year: vehicle.year,
      engine: 'N/A',
      fuel: 'N/A',
      transmission: 'N/A',
      mileage: 'N/A',
      seats: 5,
      color: 'N/A',
      drivetrain: '2WD'
    },
    category: vehicle.category || 'Standard',
    rating: vehicle.rating || 0,
    condition: vehicle.condition || {
      verified: true,
      inspected: false,
      serviceRecords: false,
      accidentHistory: 'Unknown',
      ownershipHistory: 'Unknown'
    },
    dealer: vehicle.dealerDetails || {
      name: 'Welile Auto',
      rating: 5.0,
      location: 'Kampala',
      phone: '+256 000 000000'
    },
    estimatedCosts: vehicle.estimatedCosts || {
      insurance: 150000,
      fuel: 200000,
      maintenance: 100000
    },
    features: vehicle.features || [],
    verification: vehicle.verification || {
      date: new Date().toLocaleDateString('en-GB'),
      inspector: 'Welile System',
      status: 'Pending Verification'
    }
  };
};

const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    // Format to match frontend cars.ts interface exactly
    res.json(vehicles.map(mapVehicleForFrontend));
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
    
    res.json(mapVehicleForFrontend(vehicle));
  } catch (error) {
    console.error('Get Vehicle Error:', error);
    res.status(500).json({ error: 'Server error retrieving vehicle' });
  }
};

const addVehicle = async (req, res) => {
  try {
    const { make, model, year, price, type, tagline, category, features, specs, condition } = req.body;
    
    if (!make || !model || !year || !price) {
      return res.status(400).json({ error: 'Missing required vehicle fields' });
    }

    // Process uploaded files
    const gallery = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
        gallery.push(fileUrl);
      });
    }

    let parsedSpecs = null;
    let parsedCondition = null;
    let parsedFeatures = [];

    if (specs) try { parsedSpecs = JSON.parse(specs); } catch(e) {}
    if (condition) try { parsedCondition = JSON.parse(condition); } catch(e) {}
    if (features) {
      if (Array.isArray(features)) parsedFeatures = features;
      else try { parsedFeatures = JSON.parse(features); } catch(e) { parsedFeatures = [features]; }
    }

    const newVehicle = await prisma.vehicle.create({
      data: {
        make,
        model,
        year: parseInt(year),
        price: parseFloat(price),
        type: type || 'Standard',
        tagline: tagline || '',
        category: category || 'Standard',
        image: gallery.length > 0 ? gallery[0] : null,
        gallery,
        specs: parsedSpecs || {
          year: parseInt(year),
          engine: '1.5L',
          fuel: 'Petrol',
          transmission: 'Automatic',
          mileage: '0 km',
          seats: 5,
          color: 'Custom',
          drivetrain: '2WD'
        },
        features: parsedFeatures,
        condition: parsedCondition,
        dealerId: req.user.id
      }
    });

    res.status(201).json({ message: 'Vehicle added successfully', vehicle: mapVehicleForFrontend(newVehicle) });
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

    res.json({ message: 'Vehicle updated successfully', vehicle: mapVehicleForFrontend(vehicle) });
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
