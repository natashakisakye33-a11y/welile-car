const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  await prisma.user.create({
    data: {
      clerkUserId: 'user_3FZhR9BGFcD6TFDLKHoOgDSr5to',
      email: 'joshwanda17@gmail.com',
      name: 'Joshua Wanda',
      phone: 'TEMP_user_3FZhR9BGFcD6TFDLKHoOgDSr5to',
      role: 'CUSTOMER'
    }
  });
  console.log('User created!');
}
seed().catch(console.error).finally(() => prisma.$disconnect());
