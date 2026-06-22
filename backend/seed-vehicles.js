const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const cars = [
  {
    make: 'Toyota',
    model: 'Vitz',
    year: 2016,
    price: 18000000,
    type: 'Hatchback',
    tagline: 'Perfect for Ride-Hailing',
    category: 'Ride-Hailing',
    rating: 4.8,
    image: '/src/assets/vitz_front_red_1781174112015.png',
    gallery: ['/src/assets/vitz_front_red_1781174112015.png', '/src/assets/vitz_side_red_1781173940597.png', '/src/assets/vitz_rear_red_1781173928915.png', '/src/assets/vitz_interior_1781172560845.png'],
    specs: { year: 2016, engine: '1.0L', fuel: 'Petrol', transmission: 'Automatic', mileage: '65,000 km', seats: 5, color: 'Red', drivetrain: '2WD' },
    features: ['Air Conditioning', 'Bluetooth', 'ABS Brakes', 'Power Windows'],
    condition: { verified: true, inspected: true, serviceRecords: true, accidentHistory: 'None', ownershipHistory: '1 Previous Owner' },
    estimatedCosts: { insurance: 120000, fuel: 200000, maintenance: 80000 },
    verification: { date: '12 May 2026', inspector: 'John S.', status: 'Verified & Approved' },
    dealerDetails: { name: 'Kampala Auto Hub', rating: 4.8, location: 'Kampala', phone: '+256 700 000000' }
  },
  {
    make: 'Toyota',
    model: 'Premio',
    year: 2018,
    price: 28000000,
    type: 'Sedan',
    tagline: 'Premium Sedan',
    category: 'Sedan',
    rating: 4.7,
    image: '/src/assets/premio_front_white_1781174123286.png',
    gallery: ['/src/assets/premio_front_white_1781174123286.png', '/src/assets/premio_side_1781172365181.png', '/src/assets/premio_rear_1781172353320.png', '/src/assets/premio_interior_1781172375260.png'],
    specs: { year: 2018, engine: '1.8L', fuel: 'Petrol', transmission: 'Automatic', mileage: '50,000 km', seats: 5, color: 'Pearl White', drivetrain: '2WD' },
    features: ['Air Conditioning', 'Reverse Camera', 'Bluetooth', 'Alloy Wheels', 'ABS Brakes'],
    condition: { verified: true, inspected: true, serviceRecords: true, accidentHistory: 'None', ownershipHistory: 'Fresh Import' },
    estimatedCosts: { insurance: 150000, fuel: 300000, maintenance: 100000 },
    verification: { date: '05 Jun 2026', inspector: 'Peter M.', status: 'Verified & Approved' },
    dealerDetails: { name: 'Quality Motors', rating: 4.9, location: 'Nakawa', phone: '+256 772 123456' }
  },
  {
    make: 'Toyota',
    model: 'Wish',
    year: 2014,
    price: 25000000,
    type: 'MPV',
    tagline: 'Ideal for Cargo/Family',
    category: 'Family',
    rating: 4.6,
    image: '/src/assets/wish_front_black_1781174134311.png',
    gallery: ['/src/assets/wish_front_black_1781174134311.png', '/src/assets/wish_side_1781172590058.png', '/src/assets/wish_rear_1781172579968.png', '/src/assets/wish_interior_1781172601381.png'],
    specs: { year: 2014, engine: '1.8L', fuel: 'Petrol', transmission: 'Automatic', mileage: '70,000 km', seats: 7, color: 'Black', drivetrain: '2WD' },
    features: ['Air Conditioning', '3rd Row Seating', 'Bluetooth', 'Alloy Wheels'],
    condition: { verified: true, inspected: true, serviceRecords: false, accidentHistory: 'Minor Scratch', ownershipHistory: '1 Previous Owner' },
    estimatedCosts: { insurance: 140000, fuel: 280000, maintenance: 95000 },
    verification: { date: '20 Apr 2026', inspector: 'John S.', status: 'Verified & Approved' },
    dealerDetails: { name: 'Family Autos', rating: 4.5, location: 'Ntinda', phone: '+256 750 987654' }
  },
  {
    make: 'Toyota',
    model: 'Harrier',
    year: 2017,
    price: 85000000,
    type: 'SUV',
    tagline: 'Luxury SUV',
    category: 'SUV',
    rating: 4.9,
    image: '/src/assets/harrier_front_white_1781174155158.png',
    gallery: ['/src/assets/harrier_front_white_1781174155158.png', '/src/assets/harrier_side_1781172630906.png', '/src/assets/harrier_rear_1781172621558.png', '/src/assets/harrier_interior_1781172642495.png'],
    specs: { year: 2017, engine: '2.0L Turbo', fuel: 'Petrol', transmission: 'Automatic', mileage: '35,000 km', seats: 5, color: 'White', drivetrain: '4WD' },
    features: ['Leather Seats', 'Sunroof', 'Reverse Camera', 'Apple CarPlay', 'Alloy Wheels', 'Airbags'],
    condition: { verified: true, inspected: true, serviceRecords: true, accidentHistory: 'None', ownershipHistory: 'Fresh Import' },
    estimatedCosts: { insurance: 350000, fuel: 450000, maintenance: 200000 },
    verification: { date: '01 Jun 2026', inspector: 'James L.', status: 'Verified & Approved' },
    dealerDetails: { name: 'Premium Drives', rating: 5.0, location: 'Kololo', phone: '+256 701 555555' }
  }
];

async function main() {
  console.log('Seeding demo vehicles...');
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
