const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CARS = [
  {
    make: "Toyota",
    model: "Vitz (UBM 492X)",
    year: 2018,
    price: 35000000, // 35M UGX
    type: "Hatchback",
    tagline: "Compact & Fuel Efficient",
    category: "Economy",
    image: "https://images.unsplash.com/photo-1590362891991-f20dc2368ab3?q=80&w=2564&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1590362891991-f20dc2368ab3?q=80&w=2564&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542282088-fe8426682b8f?q=80&w=2574&auto=format&fit=crop"
    ],
    specs: {
      year: 2018,
      engine: "1.0L 3-Cylinder",
      fuel: "Petrol",
      transmission: "Automatic",
      mileage: "45,000 km",
      seats: 5,
      color: "Silver",
      drivetrain: "2WD"
    },
    features: ["Bluetooth", "Air Conditioning", "Push Start", "Backup Camera", "Alloy Wheels"],
    condition: {
      verified: true,
      inspected: true,
      serviceRecords: true,
      accidentHistory: "Clean",
      ownershipHistory: "1 Previous Owner"
    },
    rating: 4.8
  },
  {
    make: "Subaru",
    model: "Forester XT",
    year: 2020,
    price: 85000000, // 85M UGX
    type: "SUV",
    tagline: "Unleash Your Adventure",
    category: "SUV",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=2574&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=2574&auto=format&fit=crop"
    ],
    specs: {
      year: 2020,
      engine: "2.0L Turbo",
      fuel: "Petrol",
      transmission: "CVT",
      mileage: "32,000 km",
      seats: 5,
      color: "Black",
      drivetrain: "AWD"
    },
    features: ["Sunroof", "Leather Seats", "Harman Kardon Audio", "EyeSight Safety", "Power Tailgate"],
    condition: {
      verified: true,
      inspected: true,
      serviceRecords: true,
      accidentHistory: "Clean",
      ownershipHistory: "1 Previous Owner"
    },
    rating: 4.9
  },
  {
    make: "Mercedes-Benz",
    model: "C-Class C200",
    year: 2021,
    price: 150000000, // 150M UGX
    type: "Sedan",
    tagline: "The Pinnacle of Luxury",
    category: "Luxury",
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=2670&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=2670&auto=format&fit=crop"
    ],
    specs: {
      year: 2021,
      engine: "1.5L Turbo Hybrid",
      fuel: "Hybrid",
      transmission: "9-Speed Auto",
      mileage: "15,000 km",
      seats: 5,
      color: "Obsidian Black",
      drivetrain: "RWD"
    },
    features: ["Burmester Surround Sound", "Panoramic Roof", "Ambient Lighting", "AMG Line", "Digital Dashboard"],
    condition: {
      verified: true,
      inspected: true,
      serviceRecords: true,
      accidentHistory: "Clean",
      ownershipHistory: "Imported New"
    },
    rating: 5.0
  }
];

async function main() {
  console.log("Seeding database with vehicles...");
  for (const car of CARS) {
    await prisma.vehicle.create({
      data: car
    });
  }
  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
