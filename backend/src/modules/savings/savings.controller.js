const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const calculateSavings = (req, res) => {
  const { targetAmount, monthlyContribution } = req.body;
  if (!targetAmount || !monthlyContribution) {
    return res.status(400).json({ error: 'Missing targetAmount or monthlyContribution' });
  }
  
  const months = Math.ceil(targetAmount / monthlyContribution);
  const totalInterest = (targetAmount * 0.05).toFixed(0);
  
  res.json({
    targetAmount,
    monthlyContribution,
    estimatedMonths: months,
    estimatedInterest: parseInt(totalInterest)
  });
};

const getMySavings = async (req, res) => {
  try {
    const userId = req.user.id;
    const savings = await prisma.savingsAccount.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { date: 'desc' },
          take: 5
        }
      }
    });

    if (!savings) {
      return res.status(404).json({ error: 'Savings account not found' });
    }

    res.json(savings);
  } catch (error) {
    console.error('Get Savings Error:', error);
    res.status(500).json({ error: 'Server error retrieving savings account' });
  }
};

module.exports = {
  calculateSavings,
  getMySavings
};
