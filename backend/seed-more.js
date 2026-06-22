const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const cars = [
  {
    make: 'Toyota',
    model: 'Noah',
    year: 2015,
    price: 35000000,
    type: 'Minivan',
    tagline: 'Spacious 7-Seater',
    category: 'Family',
    rating: 4.8,
    image: '/src/assets/noah_front_silver_1781174164666.png',
    gallery: ['/src/assets/noah_front_silver_1781174164666.png', '/src/assets/noah_side_1781172671922.png', '/src/assets/noah_rear_1781172660954.png', '/src/assets/noah_interior_1781172684000.png'],
    specs: { year: 2015, engine: '2.0L', fuel: 'Petrol', transmission: 'Automatic', mileage: '60,000 km', seats: 8, color: 'Silver', drivetrain: '2WD' },
    features: ['Air Conditioning', 'Power Sliding Doors', 'Bluetooth', 'Reverse Camera'],
    condition: { verified: true, inspected: true, serviceRecords: true, accidentHistory: 'None', ownershipHistory: '1 Previous Owner' },
    estimatedCosts: { insurance: 180000, fuel: 320000, maintenance: 120000 },
    verification: { date: '15 May 2026', inspector: 'John S.', status: 'Verified & Approved' },
    dealerDetails: { name: 'Kampala Auto Hub', rating: 4.8, location: 'Kampala', phone: '+256 700 000000' }
  },
  {
    make: 'Toyota',
    model: 'Passo',
    year: 2016,
    price: 16500000,
    type: 'Hatchback',
    tagline: 'Economical Daily Driver',
    category: 'Economy',
    rating: 4.5,
    image: '/src/assets/passo_front_pink_1781174174814.png',
    gallery: ['/src/assets/passo_front_pink_1781174174814.png', '/src/assets/passo_side_1781172713577.png', '/src/assets/passo_rear_1781172702484.png', '/src/assets/passo_interior_1781172725525.png'],
    specs: { year: 2016, engine: '1.0L', fuel: 'Petrol', transmission: 'Automatic', mileage: '80,000 km', seats: 5, color: 'Pink', drivetrain: '2WD' },
    features: ['Air Conditioning', 'Power Steering', 'ABS Brakes'],
    condition: { verified: true, inspected: true, serviceRecords: false, accidentHistory: 'None', ownershipHistory: '2 Previous Owners' },
    estimatedCosts: { insurance: 110000, fuel: 180000, maintenance: 75000 },
    verification: { date: '10 Apr 2026', inspector: 'Peter M.', status: 'Verified & Approved' },
    dealerDetails: { name: 'City Cars', rating: 4.2, location: 'Makindye', phone: '+256 775 111222' }
  },
  {
    make: 'Jeep',
    model: 'Wrangler',
    year: 2021,
    price: 150000000,
    type: 'SUV',
    tagline: 'Off-Road Capability',
    category: 'SUV',
    rating: 4.9,
    image: '/src/assets/black_jeep.png',
    gallery: ['/src/assets/black_jeep.png'],
    specs: { year: 2021, engine: '2.0L Turbo', fuel: 'Petrol', transmission: 'Automatic', mileage: '20,000 km', seats: 5, color: 'Black', drivetrain: '4WD' },
    features: ['4x4 Off-Road', 'Removable Roof', 'Leather Seats', 'Apple CarPlay', 'Reverse Camera'],
    condition: { verified: true, inspected: true, serviceRecords: true, accidentHistory: 'None', ownershipHistory: '1 Previous Owner' },
    estimatedCosts: { insurance: 450000, fuel: 550000, maintenance: 300000 },
    verification: { date: '10 Jun 2026', inspector: 'James L.', status: 'Verified & Approved' },
    dealerDetails: { name: 'Premium Drives', rating: 5.0, location: 'Kololo', phone: '+256 701 555555' }
  }
];

async function main() {
  console.log('Seeding more demo vehicles...');
  for (const car of cars) {
    try {
      await prisma.$executeRaw`
        INSERT INTO "Vehicle" (
          "make", "model", "year", "price", "type", "tagline", "category", "rating", "image", "gallery", "specs", "features", "condition", "estimatedCosts", "verification", "dealerDetails", "updatedAt"
        ) VALUES (
          ${car.make}, ${car.model}, ${car.year}, ${car.price}, ${car.type}, ${car.tagline}, ${car.category}, ${car.rating}, ${car.image}, ${car.gallery}, ${car.specs}, ${car.features}, ${car.condition}, ${car.estimatedCosts}, ${car.verification}, ${car.dealerDetails}, NOW()
        )
      `;
    } catch(err) {
      console.error('Failed to insert car:', car.model, err.message);
    }
  }
  console.log('Done seeding!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
