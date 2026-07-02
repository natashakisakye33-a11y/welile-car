import vitzImg from '@/assets/car-vitz.jpg';
import premioImg from '@/assets/car-premio.jpg';
import wishImg from '@/assets/car-wish.jpg';
import harrierImg from '@/assets/harrier-white.png';
import heroCarImg from '@/assets/hero-car.png';
import passoImg from '@/assets/car-passo.png';

export interface Car {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  type: string;
  tagline: string;
  priceUgx: number;
  priceStr: string;
  oldPriceRange: string;
  oldMin: number;
  oldMax: number;
  newPriceRange: string;
  newMin: number;
  newMax: number;
  image: string;
  gallery: string[];
  specs: {
    year: number;
    engine: string;
    fuel: string;
    transmission: string;
    mileage: string;
    seats: number;
    color: string;
    drivetrain: string;
  };
  category: string;
  rating: number;
  condition: {
    verified: boolean;
    inspected: boolean;
    serviceRecords: boolean;
    accidentHistory: string;
    ownershipHistory: string;
  };
  dealer: {
    name: string;
    rating: number;
    location: string;
    phone: string;
  };
  estimatedCosts: {
    insurance: number;
    fuel: number;
    maintenance: number;
  };
  features: string[];
  verification: {
    date: string;
    inspector: string;
    status: string;
  };
}

export const carsData: Car[] = [
  {
    id: 'vitz',
    name: 'Toyota Vitz',
    make: 'Toyota',
    model: 'Vitz',
    year: 2016,
    type: 'Hatchback',
    tagline: 'Perfect for Ride-Hailing',
    priceUgx: 18000000,
    priceStr: '18M UGX',
    oldPriceRange: '14M - 18M UGX',
    oldMin: 14000000,
    oldMax: 18000000,
    newPriceRange: '24M - 28M UGX',
    newMin: 24000000,
    newMax: 28000000,
    image: vitzImg,
    gallery: [vitzImg, vitzImg, vitzImg], // Duplicated for mock gallery
    specs: { year: 2016, engine: '1.0L', fuel: 'Petrol', transmission: 'Automatic', mileage: '65,000 km', seats: 5, color: 'Silver', drivetrain: '2WD' },
    category: 'Ride-Hailing',
    rating: 4.8,
    condition: { verified: true, inspected: true, serviceRecords: true, accidentHistory: 'None', ownershipHistory: '1 Previous Owner' },
    dealer: { name: 'Kampala Auto Hub', rating: 4.8, location: 'Kampala', phone: '+256 700 000000' },
    estimatedCosts: { insurance: 120000, fuel: 200000, maintenance: 80000 },
    features: ['Air Conditioning', 'Bluetooth', 'ABS Brakes', 'Power Windows'],
    verification: { date: '12 May 2026', inspector: 'John S.', status: 'Verified & Approved' }
  },
  {
    id: 'premio',
    name: 'Toyota Premio',
    make: 'Toyota',
    model: 'Premio',
    year: 2018,
    type: 'Sedan',
    tagline: 'Premium Sedan',
    priceUgx: 28000000,
    priceStr: '28M UGX',
    oldPriceRange: '22M - 28M UGX',
    oldMin: 22000000,
    oldMax: 28000000,
    newPriceRange: '38M - 45M UGX',
    newMin: 38000000,
    newMax: 45000000,
    image: premioImg,
    gallery: [premioImg, premioImg, premioImg],
    specs: { year: 2018, engine: '1.8L', fuel: 'Petrol', transmission: 'Automatic', mileage: '50,000 km', seats: 5, color: 'Pearl White', drivetrain: '2WD' },
    category: 'Sedan',
    rating: 4.7,
    condition: { verified: true, inspected: true, serviceRecords: true, accidentHistory: 'None', ownershipHistory: 'Fresh Import' },
    dealer: { name: 'Quality Motors', rating: 4.9, location: 'Nakawa', phone: '+256 772 123456' },
    estimatedCosts: { insurance: 150000, fuel: 300000, maintenance: 100000 },
    features: ['Air Conditioning', 'Reverse Camera', 'Bluetooth', 'Alloy Wheels', 'ABS Brakes'],
    verification: { date: '05 Jun 2026', inspector: 'Peter M.', status: 'Verified & Approved' }
  },
  {
    id: 'wish',
    name: 'Toyota Wish',
    make: 'Toyota',
    model: 'Wish',
    year: 2014,
    type: 'MPV',
    tagline: 'Ideal for Cargo/Family',
    priceUgx: 25000000,
    priceStr: '25M UGX',
    oldPriceRange: '18M - 25M UGX',
    oldMin: 18000000,
    oldMax: 25000000,
    newPriceRange: '32M - 38M UGX',
    newMin: 32000000,
    newMax: 38000000,
    image: wishImg,
    gallery: [wishImg, wishImg, wishImg],
    specs: { year: 2014, engine: '1.8L', fuel: 'Petrol', transmission: 'Automatic', mileage: '70,000 km', seats: 7, color: 'Black', drivetrain: '2WD' },
    category: 'Family',
    rating: 4.6,
    condition: { verified: true, inspected: true, serviceRecords: false, accidentHistory: 'Minor Scratch', ownershipHistory: '1 Previous Owner' },
    dealer: { name: 'Family Autos', rating: 4.5, location: 'Ntinda', phone: '+256 750 987654' },
    estimatedCosts: { insurance: 140000, fuel: 280000, maintenance: 95000 },
    features: ['Air Conditioning', '3rd Row Seating', 'Bluetooth', 'Alloy Wheels'],
    verification: { date: '20 Apr 2026', inspector: 'John S.', status: 'Verified & Approved' }
  },
  {
    id: 'harrier',
    name: 'Toyota Harrier',
    make: 'Toyota',
    model: 'Harrier',
    year: 2017,
    type: 'SUV',
    tagline: 'Luxury SUV',
    priceUgx: 85000000,
    priceStr: '85M UGX',
    oldPriceRange: '65M - 85M UGX',
    oldMin: 65000000,
    oldMax: 85000000,
    newPriceRange: '110M - 130M UGX',
    newMin: 110000000,
    newMax: 130000000,
    image: harrierImg,
    gallery: [harrierImg, harrierImg, harrierImg],
    specs: { year: 2017, engine: '2.0L Turbo', fuel: 'Petrol', transmission: 'Automatic', mileage: '35,000 km', seats: 5, color: 'White', drivetrain: '4WD' },
    category: 'SUV',
    rating: 4.9,
    condition: { verified: true, inspected: true, serviceRecords: true, accidentHistory: 'None', ownershipHistory: 'Fresh Import' },
    dealer: { name: 'Premium Drives', rating: 5.0, location: 'Kololo', phone: '+256 701 555555' },
    estimatedCosts: { insurance: 350000, fuel: 450000, maintenance: 200000 },
    features: ['Leather Seats', 'Sunroof', 'Reverse Camera', 'Apple CarPlay', 'Alloy Wheels', 'Airbags'],
    verification: { date: '01 Jun 2026', inspector: 'James L.', status: 'Verified & Approved' }
  },
  {
    id: 'noah',
    name: 'Toyota Noah',
    make: 'Toyota',
    model: 'Noah',
    year: 2015,
    type: 'Minivan',
    tagline: 'Spacious 7-Seater',
    priceUgx: 35000000,
    priceStr: '35M UGX',
    oldPriceRange: '28M - 35M UGX',
    oldMin: 28000000,
    oldMax: 35000000,
    newPriceRange: '48M - 58M UGX',
    newMin: 48000000,
    newMax: 58000000,
    image: heroCarImg,
    gallery: [heroCarImg, heroCarImg, heroCarImg],
    specs: { year: 2015, engine: '2.0L', fuel: 'Petrol', transmission: 'Automatic', mileage: '60,000 km', seats: 8, color: 'Silver', drivetrain: '2WD' },
    category: 'Family',
    rating: 4.8,
    condition: { verified: true, inspected: true, serviceRecords: true, accidentHistory: 'None', ownershipHistory: '1 Previous Owner' },
    dealer: { name: 'Kampala Auto Hub', rating: 4.8, location: 'Kampala', phone: '+256 700 000000' },
    estimatedCosts: { insurance: 180000, fuel: 320000, maintenance: 120000 },
    features: ['Air Conditioning', 'Power Sliding Doors', 'Bluetooth', 'Reverse Camera'],
    verification: { date: '15 May 2026', inspector: 'John S.', status: 'Verified & Approved' }
  },
  {
    id: 'passo',
    name: 'Toyota Passo',
    make: 'Toyota',
    model: 'Passo',
    year: 2016,
    type: 'Hatchback',
    tagline: 'Economical Daily Driver',
    priceUgx: 16500000,
    priceStr: '16.5M UGX',
    oldPriceRange: '12M - 16M UGX',
    oldMin: 12000000,
    oldMax: 16000000,
    newPriceRange: '22M - 26M UGX',
    newMin: 22000000,
    newMax: 26000000,
    image: passoImg,
    gallery: [passoImg, passoImg, passoImg],
    specs: { year: 2016, engine: '1.0L', fuel: 'Petrol', transmission: 'Automatic', mileage: '80,000 km', seats: 5, color: 'Pink', drivetrain: '2WD' },
    category: 'Economy',
    rating: 4.5,
    condition: { verified: true, inspected: true, serviceRecords: false, accidentHistory: 'None', ownershipHistory: '2 Previous Owners' },
    dealer: { name: 'City Cars', rating: 4.2, location: 'Makindye', phone: '+256 775 111222' },
    estimatedCosts: { insurance: 110000, fuel: 180000, maintenance: 75000 },
    features: ['Air Conditioning', 'Power Steering', 'ABS Brakes'],
    verification: { date: '10 Apr 2026', inspector: 'Peter M.', status: 'Verified & Approved' }
  }
];
