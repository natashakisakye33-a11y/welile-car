const fs = require('fs');

function fixMyVehicle() {
  let code = fs.readFileSync('src/pages/MyVehiclePage.tsx', 'utf8');

  // 1. Fix early return
  const fallback = `
  const mockCar = {
    id: "preview",
    name: "Sample Vehicle (Preview)",
    priceUgx: 15000000,
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800",
    year: "2023",
    make: "Toyota",
    model: "Vitz",
    specs: { engine: "1.5L", color: "White" }
  };
  const activeCar = car || mockCar;
  const activeProfile = profile || { selected_car_condition: 'used', selected_car_price: 15000000 };
  `;
  
  code = code.replace(/if \(error \|\| !profile\) \{[\s\S]*?\}\n    \);\n  \}/, fallback);

  // 2. Replace car. with activeCar.
  code = code.replace(/car\./g, 'activeCar.');
  code = code.replace(/profile\./g, 'activeProfile.');
  
  fs.writeFileSync('src/pages/MyVehiclePage.tsx', code);
}

fixMyVehicle();
