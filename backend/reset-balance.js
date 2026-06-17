const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    await prisma.savingsAccount.updateMany({
      data: {
        balance: 0,
        interestEarned: 0
      }
    });
    console.log("Successfully reset all wallet balances to 0.");
  } catch (err) {
    console.error("Failed to reset balances:", err);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
})();
