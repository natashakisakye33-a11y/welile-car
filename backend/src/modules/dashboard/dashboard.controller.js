const { PrismaClient } = require('@prisma/client');
const { calculateRiskScore, getRiskLevel } = require('../../shared/utils/risk.util');

const prisma = new PrismaClient();

const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        savingsAccount: true,
        selectedVehicle: true,
        financings: {
          include: {
            vehicle: true,
            repayments: {
              orderBy: { dueDate: 'asc' },
              where: { status: 'PENDING' },
              take: 1
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const savings = user.savingsAccount || {
      balance: 0,
      targetAmount: 15000000, // Default target
      interestEarned: 0
    };

    const totalSaved = Number(savings.balance);
    const targetAmount = Number(savings.targetAmount);
    const interestEarned = Number(savings.interestEarned);
    
    const depositRequired = targetAmount * 0.3; // 30% of target amount
    const progressPercent = depositRequired > 0 
      ? Math.min(100, Math.round((totalSaved / depositRequired) * 100)) 
      : 0;

    const remainingAmount = Math.max(0, depositRequired - totalSaved);

    // Calculate Risk Score
    const creditScore = calculateRiskScore(user, totalSaved, depositRequired);
    const riskLevel = getRiskLevel(creditScore);

    // Active financing and repayment
    const activeFinancing = user.financings.find(f => f.status === 'ACTIVE');
    const nextRepayment = activeFinancing?.repayments[0] || null;

    res.json({
      health: {
        riskLevel,
        creditScore,
        qualificationStatus: progressPercent >= 100 ? 'Eligible for Financing' : 'Keep Saving'
      },
      savings: {
        totalSaved,
        targetAmount: depositRequired, // Present the required deposit as the target for the progress bar
        interestEarned,
        progressPercent,
        nextMilestone: {
          amountNeeded: remainingAmount,
          message: 'to unlock financing eligibility.'
        }
      },
      journey: {
        currentStep: activeFinancing ? 'Repayment' : (progressPercent >= 100 ? 'Qualified' : 'Saving'),
        completedSteps: activeFinancing 
          ? ['Registered', 'Saving', 'Qualified', 'Financing', 'Released'] 
          : (progressPercent >= 100 ? ['Registered', 'Saving'] : ['Registered'])
      },
      vehicle: activeFinancing 
        ? activeFinancing.vehicle 
        : (user.selectedVehicle ? { 
            ...user.selectedVehicle, 
            selectedCondition: user.selectedVehicleCondition, 
            selectedPrice: user.selectedVehiclePrice 
          } : null),
      repayment: nextRepayment ? {
        nextAmount: Number(nextRepayment.amount),
        dueDate: nextRepayment.dueDate.toISOString().split('T')[0]
      } : null
    });
  } catch (error) {
    console.error('Dashboard Summary Error:', error);
    res.status(500).json({ error: 'Server error retrieving dashboard summary' });
  }
};

module.exports = {
  getDashboardSummary
};
