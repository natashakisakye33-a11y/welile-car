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

const getPendingDeposits = async (req, res) => {
  try {
    const deposits = await prisma.savingsTransaction.findMany({
      where: {
        type: 'DEPOSIT',
        status: 'PENDING'
      },
      include: {
        account: {
          include: {
            user: { select: { id: true, name: true, phone: true } }
          }
        }
      },
      orderBy: { date: 'desc' }
    });
    res.json({ deposits });
  } catch (error) {
    console.error('Get Pending Deposits Error:', error);
    res.status(500).json({ error: 'Server error retrieving pending deposits' });
  }
};

const approveDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.savingsTransaction.findUnique({
        where: { id: parseInt(id) },
        include: { account: { include: { user: true } } }
      });

      if (!transaction || transaction.status !== 'PENDING' || transaction.type !== 'DEPOSIT') {
        throw new Error('Invalid or already processed deposit');
      }

      const updatedTransaction = await tx.savingsTransaction.update({
        where: { id: parseInt(id) },
        data: { status: 'COMPLETED' }
      });

      await tx.savingsAccount.update({
        where: { id: transaction.accountId },
        data: { balance: { increment: transaction.amount } }
      });
      
      await tx.auditLog.create({
        data: {
          userId: transaction.account.userId,
          action: 'DEPOSIT_APPROVED',
          details: `Admin approved manual deposit of ${transaction.amount} UGX. Ref: ${transaction.reference}`
        }
      });

      return updatedTransaction;
    });

    res.json({ message: 'Deposit approved successfully', deposit: result });
  } catch (error) {
    console.error('Approve Deposit Error:', error.message);
    res.status(500).json({ error: error.message || 'Server error approving deposit' });
  }
};

const rejectDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.savingsTransaction.findUnique({
        where: { id: parseInt(id) },
        include: { account: true }
      });

      if (!transaction || transaction.status !== 'PENDING' || transaction.type !== 'DEPOSIT') {
        throw new Error('Invalid or already processed deposit');
      }
      
      const updatedTransaction = await tx.savingsTransaction.update({
        where: { id: parseInt(id) },
        data: { status: 'REJECTED' }
      });

      await tx.auditLog.create({
        data: {
          userId: transaction.account.userId,
          action: 'DEPOSIT_REJECTED',
          details: `Admin rejected manual deposit of ${transaction.amount} UGX. Ref: ${transaction.reference}`
        }
      });

      return updatedTransaction;
    });

    res.json({ message: 'Deposit rejected successfully', deposit: result });
  } catch (error) {
    console.error('Reject Deposit Error:', error);
    res.status(500).json({ error: 'Server error rejecting deposit' });
  }
};

const getPendingWithdrawals = async (req, res) => {
  try {
    const withdrawals = await prisma.savingsTransaction.findMany({
      where: {
        type: 'WITHDRAWAL',
        status: 'PENDING'
      },
      include: {
        account: {
          include: {
            user: { select: { id: true, name: true, phone: true } }
          }
        }
      },
      orderBy: { date: 'desc' }
    });
    res.json({ withdrawals });
  } catch (error) {
    console.error('Get Pending Withdrawals Error:', error);
    res.status(500).json({ error: 'Server error retrieving pending withdrawals' });
  }
};

const approveWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.savingsTransaction.findUnique({
        where: { id: parseInt(id) },
        include: { account: { include: { user: true } } }
      });

      if (!transaction || transaction.status !== 'PENDING' || transaction.type !== 'WITHDRAWAL') {
        throw new Error('Invalid or already processed withdrawal');
      }

      const updatedTransaction = await tx.savingsTransaction.update({
        where: { id: parseInt(id) },
        data: { status: 'COMPLETED' }
      });
      
      await tx.auditLog.create({
        data: {
          userId: transaction.account.userId,
          action: 'WITHDRAWAL_APPROVED',
          details: `Admin approved manual withdrawal of ${transaction.amount} UGX. Ref: ${transaction.reference}`
        }
      });

      return updatedTransaction;
    });

    res.json({ message: 'Withdrawal approved successfully', withdrawal: result });
  } catch (error) {
    console.error('Approve Withdrawal Error:', error.message);
    res.status(500).json({ error: error.message || 'Server error approving withdrawal' });
  }
};

const rejectWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.savingsTransaction.findUnique({
        where: { id: parseInt(id) },
        include: { account: true }
      });

      if (!transaction || transaction.status !== 'PENDING' || transaction.type !== 'WITHDRAWAL') {
        throw new Error('Invalid or already processed withdrawal');
      }
      
      const updatedTransaction = await tx.savingsTransaction.update({
        where: { id: parseInt(id) },
        data: { status: 'REJECTED' }
      });

      // Refund the balance
      await tx.savingsAccount.update({
        where: { id: transaction.accountId },
        data: { balance: { increment: transaction.amount } }
      });

      await tx.auditLog.create({
        data: {
          userId: transaction.account.userId,
          action: 'WITHDRAWAL_REJECTED',
          details: `Admin rejected manual withdrawal of ${transaction.amount} UGX. Ref: ${transaction.reference}. Funds refunded.`
        }
      });

      return updatedTransaction;
    });

    res.json({ message: 'Withdrawal rejected successfully', withdrawal: result });
  } catch (error) {
    console.error('Reject Withdrawal Error:', error);
    res.status(500).json({ error: 'Server error rejecting withdrawal' });
  }
};

const getAllProfiles = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        savingsAccount: true,
        loanApplications: true,
        financings: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Map to AdminProfile shape for frontend
    const profiles = users.map(user => {
      const balance = user.savingsAccount ? user.savingsAccount.balance : 0;
      
      let financingStatus = 'none';
      if (user.financings.length > 0) financingStatus = 'approved';
      else if (user.loanApplications.length > 0) financingStatus = user.loanApplications[0].status.toLowerCase();

      return {
        id: `prof_${user.id}`,
        user_id: user.id.toString(),
        name: user.name,
        phone: user.phone,
        email: user.email,
        wallet_balance: balance,
        total_deposits: balance,
        growth_earned: user.savingsAccount ? user.savingsAccount.interestEarned : 0,
        financing_status: financingStatus,
        created_at: user.createdAt,
        updated_at: user.updatedAt
      };
    });
    
    res.json({ profiles });
  } catch (error) {
    console.error('Get All Profiles Error:', error);
    res.status(500).json({ error: 'Server error retrieving profiles' });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const transactions = await prisma.savingsTransaction.findMany({
      include: {
        account: {
          include: {
            user: { select: { name: true, phone: true } }
          }
        }
      },
      orderBy: { date: 'desc' }
    });
    
    const formatted = transactions.map(tx => ({
      id: tx.id,
      user_id: tx.account.userId.toString(),
      userName: tx.account.user.name,
      userPhone: tx.account.user.phone,
      type: tx.type.toLowerCase(),
      amount: tx.amount,
      method: tx.provider || 'unknown',
      status: tx.status.toLowerCase(),
      created_at: tx.date
    }));

    res.json({ transactions: formatted });
  } catch (error) {
    console.error('Get All Transactions Error:', error);
    res.status(500).json({ error: 'Server error retrieving transactions' });
  }
};

module.exports = {
  getExecutiveStats,
  getAllLoans,
  updateLoanStatus,
  getRecoveryStats,
  getPendingDeposits,
  approveDeposit,
  rejectDeposit,
  getPendingWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  getAllProfiles,
  getAllTransactions
};
