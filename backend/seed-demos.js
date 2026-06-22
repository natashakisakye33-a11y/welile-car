const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const demos = [
  { make: 'Toyota', model: 'Vitz', priceUgx: 18000000, type: 'Hatchback', image: '/src/assets/vitz_front_red_1781174112015.png', specs: { year: 2016, engine: '1.0L', fuel: 'Petrol', transmission: 'Automatic', mileage: '65,000 km', seats: 5, color: 'Red', drivetrain: '2WD' }, features: ['Air Conditioning', 'Bluetooth', 'ABS Brakes', 'Power Windows'], gallery: ['/src/assets/vitz_front_red_1781174112015.png', '/src/assets/vitz_side_red_1781173940597.png', '/src/assets/vitz_rear_red_1781173928915.png', '/src/assets/vitz_interior_1781172560845.png'], verification: { date: '12 May 2026', inspector: 'John S.', status: 'Verified & Approved' }, condition: { verified: true, inspected: true, serviceRecords: true, accidentHistory: 'None', ownershipHistory: '1 Previous Owner' }, dealer: { name: 'Kampala Auto Hub', rating: 4.8, location: 'Kampala', phone: '+256 700 000000' }, estimatedCosts: { insurance: 120000, fuel: 200000, maintenance: 80000 } },
  { make: 'Toyota', model: 'Premio', priceUgx: 28000000, type: 'Sedan', image: '/src/assets/premio_front_white_1781174123286.png', specs: { year: 2018, engine: '1.8L', fuel: 'Petrol', transmission: 'Automatic', mileage: '50,000 km', seats: 5, color: 'Pearl White', drivetrain: '2WD' }, features: ['Air Conditioning', 'Reverse Camera', 'Bluetooth', 'Alloy Wheels', 'ABS Brakes'], gallery: ['/src/assets/premio_front_white_1781174123286.png', '/src/assets/premio_side_1781172365181.png', '/src/assets/premio_rear_1781172353320.png', '/src/assets/premio_interior_1781172375260.png'], verification: { date: '05 Jun 2026', inspector: 'Peter M.', status: 'Verified & Approved' }, condition: { verified: true, inspected: true, serviceRecords: true, accidentHistory: 'None', ownershipHistory: 'Fresh Import' }, dealer: { name: 'Quality Motors', rating: 4.9, location: 'Nakawa', phone: '+256 772 123456' }, estimatedCosts: { insurance: 150000, fuel: 300000, maintenance: 100000 } },
  { make: 'Toyota', model: 'Wish', priceUgx: 25000000, type: 'MPV', image: '/src/assets/wish_front_black_1781174134311.png', specs: { year: 2014, engine: '1.8L', fuel: 'Petrol', transmission: 'Automatic', mileage: '70,000 km', seats: 7, color: 'Black', drivetrain: '2WD' }, features: ['Air Conditioning', '3rd Row Seating', 'Bluetooth', 'Alloy Wheels'], gallery: ['/src/assets/wish_front_black_1781174134311.png', '/src/assets/wish_side_1781172590058.png', '/src/assets/wish_rear_1781172579968.png', '/src/assets/wish_interior_1781172601381.png'], verification: { date: '20 Apr 2026', inspector: 'John S.', status: 'Verified & Approved' }, condition: { verified: true, inspected: true, serviceRecords: false, accidentHistory: 'Minor Scratch', ownershipHistory: '1 Previous Owner' }, dealer: { name: 'Family Autos', rating: 4.5, location: 'Ntinda', phone: '+256 750 987654' }, estimatedCosts: { insurance: 140000, fuel: 280000, maintenance: 95000 } }
];

async function main() {
  for (const demo of demos) {
    await prisma.vehicle.create({
      data: {
        make: demo.make,
        model: demo.model,
        year: demo.specs.year,
        price: demo.priceUgx,
        type: demo.type,
        status: 'AVAILABLE',
        image: demo.image,
        specs: demo.specs,
        features: demo.features,
        gallery: demo.gallery,
        verification: demo.verification,
        condition: demo.condition,
        dealerDetails: demo.dealer,
        estimatedCosts: demo.estimatedCosts,
      }
    });
  }
  console.log("Seeded demos.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
