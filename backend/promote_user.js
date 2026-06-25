const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function promoteUser() {
  const email = process.argv[2];
  const newRole = process.argv[3]; // 'ADMIN' or 'CFO'

  if (!email || !newRole) {
    console.error('Usage: node promote_user.js <email> <ROLE>');
    console.error('Example: node promote_user.js joshwanda17@gmail.com ADMIN');
    process.exit(1);
  }

  if (newRole !== 'ADMIN' && newRole !== 'CFO' && newRole !== 'CUSTOMER') {
    console.error('Role must be ADMIN, CFO, or CUSTOMER');
    process.exit(1);
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: newRole }
    });
    console.log(`Successfully updated ${user.name} (${user.email}) to role: ${user.role}`);
  } catch (err) {
    console.error(`Failed to update user: ${err.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

promoteUser();
