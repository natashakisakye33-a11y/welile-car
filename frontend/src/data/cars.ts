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

export const carsData: Car[] = [];
