const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const cfoEmail = 'cfo@admin.com';
  const cfoPassword = 'cfo123';
  
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(cfoPassword, salt);

  const existingCfo = await prisma.user.findUnique({ where: { phone: cfoEmail } });

  if (!existingCfo) {
    await prisma.user.create({
      data: {
        phone: cfoEmail, // The frontend passes email as phone in signIn(email, password)
        email: cfoEmail,
        passwordHash,
        name: 'Chief Financial Officer',
        role: 'CFO',
        status: 'VERIFIED',
        kycStatus: 'VERIFIED',
      }
    });
    console.log('CFO user created successfully.');
  } else {
    await prisma.user.update({
      where: { phone: cfoEmail },
      data: { role: 'CFO', passwordHash }
    });
    console.log('CFO user already exists. Password updated.');
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
