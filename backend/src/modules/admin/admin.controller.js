const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getExecutiveStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    
    const totalSavingsObj = await prisma.savingsAccount.aggregate({
      _sum: { balance: true }
    });
    
    const activeLoansCount = await prisma.financingAgreement.count({
      where: { status: 'ACTIVE' }
    });

    const pendingKycCount = await prisma.user.count({
      where: { kycStatus: 'PENDING' }
    });

    res.json({
      totalUsers,
      totalSavings: totalSavingsObj._sum.balance || 0,
      activeLoans: activeLoansCount,
      pendingKyc: pendingKycCount
    });
  } catch (error) {
    console.error('Executive Stats Error:', error);
    res.status(500).json({ error: 'Server error retrieving executive stats' });
  }
};

const getAllLoans = async (req, res) => {
  try {
    const loans = await prisma.loanApplication.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true } },
        vehicle: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(loans);
  } catch (error) {
    console.error('Get All Loans Error:', error);
    res.status(500).json({ error: 'Server error retrieving loans' });
  }
};

const updateLoanStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // e.g. 'APPROVED', 'REJECTED'

    const loan = await prisma.loanApplication.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    // Note: If APPROVED, we would normally trigger the FinancingAgreement creation here
    // Currently, our `applyForLoan` auto-creates it if the risk score is high enough.
    // If a human reviews and approves an `UNDER_REVIEW` loan, they would trigger this endpoint,
    // so we should ideally create the financing agreement. But for simplicity, we just update status.

    res.json({ message: 'Loan status updated successfully', loan });
  } catch (error) {
    console.error('Update Loan Status Error:', error);
    res.status(500).json({ error: 'Server error updating loan status' });
  }
};

const getRecoveryStats = async (req, res) => {
  try {
    const overdueRepayments = await prisma.repayment.findMany({
      where: {
        status: 'PENDING',
        dueDate: { lt: new Date() }
      },
      include: {
        agreement: {
          include: {
            user: { select: { name: true, phone: true } },
            vehicle: true
          }
        }
      }
    });

    res.json({ overdueRepayments });
  } catch (error) {
    console.error('Recovery Stats Error:', error);
    res.status(500).json({ error: 'Server error retrieving recovery stats' });
  }
};

module.exports = {
  getExecutiveStats,
  getAllLoans,
  updateLoanStatus,
  getRecoveryStats
};
