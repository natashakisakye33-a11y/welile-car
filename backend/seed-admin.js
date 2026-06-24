const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@admin.com';
  const adminPassword = 'admin123';
  
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(adminPassword, salt);

  const existingAdmin = await prisma.user.findUnique({ where: { phone: adminEmail } });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        phone: adminEmail, // The frontend passes email as phone in signIn(email, password)
        email: adminEmail,
        passwordHash,
        name: 'System Admin',
        role: 'ADMIN',
        status: 'VERIFIED',
        kycStatus: 'VERIFIED',
      }
    });
    console.log('Admin user created successfully.');
  } else {
    await prisma.user.update({
      where: { phone: adminEmail },
      data: { role: 'ADMIN', passwordHash }
    });
    console.log('Admin user already exists. Password updated and ensured role is ADMIN.');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
