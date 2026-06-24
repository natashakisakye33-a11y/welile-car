const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.vehicle.findMany().then(res => {
  console.log('Vehicles in DB:', res.length);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
