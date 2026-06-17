const { PrismaClient } = require('@prisma/client');
const { calculateRiskScore } = require('../../shared/utils/risk.util');

const prisma = new PrismaClient();

const VEHICLE_CATALOG = {
  'vitz': { name: 'Toyota Vitz', price: 18000000 },
  'premio': { name: 'Toyota Premio', price: 28000000 },
  'wish': { name: 'Toyota Wish', price: 25000000 },
  'harrier': { name: 'Toyota Harrier', price: 85000000 },
  'noah': { name: 'Toyota Noah', price: 35000000 },
  'passo': { name: 'Toyota Passo', price: 16500000 },
  'jeep_wrangler_black': { name: 'Jeep Wrangler', price: 150000000 }
};

const applyForLoan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { carId, requestedAmount } = req.body;

    const catalogVehicle = VEHICLE_CATALOG[carId];
    if (!catalogVehicle) {
      return res.status(400).json({ error: 'Invalid vehicle selected' });
    }

    const trueCarPrice = catalogVehicle.price;
    const trueCarName = catalogVehicle.name;

    // Fetch user and savings to calculate risk score
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { savingsAccount: true }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const totalSaved = Number(user.savingsAccount?.balance || 0);
    const vehicleTarget = trueCarPrice * 0.3; // Secure 30% deposit requirement

    // Calculate Risk Score
    const riskScore = calculateRiskScore(user, totalSaved, vehicleTarget);

    // Auto-underwriting rules
    let status = 'PENDING';
    if (riskScore < 40) {
      status = 'REJECTED'; // Too risky
    } else if (totalSaved < vehicleTarget) {
      status = 'REJECTED'; // Hasn't met 30% deposit
    } else if (riskScore >= 70) {
      status = 'APPROVED'; // Low risk auto-approval
    } else {
      status = 'UNDER_REVIEW'; // Medium risk requires manual review
    }

    // Since the frontend sends string IDs for cars (e.g., 'wish'), we'll find or create a numeric Vehicle for it.
    let vehicle = await prisma.vehicle.findFirst({
      where: { make: trueCarName }
    });

    if (!vehicle) {
      vehicle = await prisma.vehicle.create({
        data: {
          make: trueCarName,
          model: carId,
          year: 2015,
          price: trueCarPrice,
          status: 'RESERVED'
        }
      });
    }

    // Create the Application
    // We enforce that the requested amount is exactly what is needed (70%), we ignore frontend requestedAmount to be perfectly secure
    const secureRequestedAmount = trueCarPrice - vehicleTarget;

    const application = await prisma.loanApplication.create({
      data: {
        userId,
        vehicleId: vehicle.id,
        requestedAmount: secureRequestedAmount,
        riskScore: riskScore,
        status: status
      }
    });

    // If approved, create a Financing Agreement and lock savings
    if (status === 'APPROVED') {
      await prisma.$transaction(async (tx) => {
        // Freeze savings
        await tx.savingsAccount.update({
          where: { userId },
          data: { status: 'FROZEN' }
        });

        // Create Financing Agreement
        const monthlyInstallmentAmount = secureRequestedAmount / 6;
        const agreement = await tx.financingAgreement.create({
          data: {
            customerId: userId,
            vehicleId: vehicle.id,
            principalAmount: secureRequestedAmount,
            monthlyInstallment: monthlyInstallmentAmount,
            interestRate: 15.00,
            endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
            status: 'ACTIVE'
          }
        });

        // Generate 6 Monthly Repayments
        const repaymentsData = [];
        for (let i = 1; i <= 6; i++) {
          const dueDate = new Date();
          dueDate.setMonth(dueDate.getMonth() + i);
          repaymentsData.push({
            agreementId: agreement.id,
            amount: monthlyInstallmentAmount,
            dueDate: dueDate,
            status: 'PENDING'
          });
        }
        await tx.repayment.createMany({
          data: repaymentsData
        });

        // Log action
        await tx.auditLog.create({
          data: {
            userId,
            action: 'LOAN_APPROVED',
            details: `Auto-approved loan for ${trueCarName} based on score ${riskScore}. Generated 6 repayments.`
          }
        });
      });
    } else {
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'LOAN_APPLIED',
          details: `Applied for loan for ${trueCarName}. Status: ${status}. Score: ${riskScore}`
        }
      });
    }

    res.json({
      message: 'Application submitted',
      applicationId: application.id,
      status: status,
      riskScore: riskScore
    });

  } catch (error) {
    console.error('Loan Apply Error:', error);
    res.status(500).json({ error: 'Server error processing loan application' });
  }
};

const getApplications = async (req, res) => {
  try {
    const applications = await prisma.loanApplication.findMany({
      include: {
        user: {
          select: { name: true, email: true, phone: true }
        },
        vehicle: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching applications' });
  }
};

module.exports = {
  applyForLoan,
  getApplications
};
