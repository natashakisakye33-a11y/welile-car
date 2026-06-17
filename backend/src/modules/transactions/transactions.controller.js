const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const deposit = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, method } = req.body;

    if (!amount || amount < 1000) {
      return res.status(400).json({ error: 'Minimum deposit is 1000 UGX' });
    }

    // Get or create savings account
    let savings = await prisma.savingsAccount.findUnique({ where: { userId } });
    if (!savings) {
      savings = await prisma.savingsAccount.create({
        data: {
          userId,
          targetAmount: 15000000,
          balance: 0,
          interestEarned: 0
        }
      });
    }

    const reference = `TX-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Create a PENDING transaction. Do NOT increment balance yet.
    await prisma.savingsTransaction.create({
      data: {
        accountId: savings.id,
        amount: amount,
        type: 'DEPOSIT',
        status: 'PENDING',
        reference: reference
      }
    });

    // MOCK: Auto-trigger the webhook after 3 seconds to simulate a successful mobile money flow in development ONLY
    if (process.env.NODE_ENV !== 'production') {
      setTimeout(async () => {
        try {
          await fetch(`http://localhost:${process.env.PORT || 3000}/api/transactions/webhook/payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reference, status: 'SUCCESS' })
          });
        } catch (err) {
          console.error('Mock Webhook failed:', err.message);
        }
      }, 3000);
    }

    res.json({
      message: 'Deposit initiated. Please check your phone for the mobile money prompt.',
      reference: reference,
      status: 'PENDING',
      balance: savings.balance
    });
  } catch (error) {
    console.error('Deposit Error:', error);
    res.status(500).json({ error: 'Server error processing deposit' });
  }
};

const paymentWebhook = async (req, res) => {
  try {
    const { reference, status } = req.body;
    
    if (!reference || status !== 'SUCCESS') {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    // Process transaction securely
    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.savingsTransaction.findUnique({
        where: { reference }
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (transaction.status === 'COMPLETED') {
        throw new Error('Transaction already processed');
      }

      // Mark as completed
      await tx.savingsTransaction.update({
        where: { id: transaction.id },
        data: { status: 'COMPLETED' }
      });

      // Securely increment balance
      const updatedSavings = await tx.savingsAccount.update({
        where: { id: transaction.accountId },
        data: { balance: { increment: transaction.amount } }
      });

      return { transaction, updatedSavings };
    });

    // Audit Log
    const savingsAcc = await prisma.savingsAccount.findUnique({ where: { id: result.transaction.accountId } });
    if (savingsAcc) {
      await prisma.auditLog.create({
        data: {
          userId: savingsAcc.userId,
          action: 'DEPOSIT_COMPLETED',
          details: `Webhook verified deposit of ${result.transaction.amount} UGX. Ref: ${reference}`
        }
      });
    }

    res.json({ success: true, message: 'Payment processed successfully' });
  } catch (error) {
    console.error('Webhook Error:', error.message);
    res.status(500).json({ error: 'Server error processing webhook' });
  }
};

const getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const savings = await prisma.savingsAccount.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { date: 'desc' },
          take: 50
        }
      }
    });

    if (!savings) {
      return res.json({ transactions: [] });
    }

    res.json({ transactions: savings.transactions });
  } catch (error) {
    console.error('History Error:', error);
    res.status(500).json({ error: 'Server error retrieving transactions' });
  }
};

const payFromWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, reason } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const savings = await tx.savingsAccount.findUnique({
        where: { userId }
      });

      if (!savings || savings.balance < amount) {
        throw new Error('Insufficient wallet balance');
      }

      const updatedSavings = await tx.savingsAccount.update({
        where: { id: savings.id },
        data: { balance: { decrement: amount } }
      });

      const transaction = await tx.savingsTransaction.create({
        data: {
          accountId: savings.id,
          amount: amount,
          type: 'WITHDRAWAL', // Using WITHDRAWAL to represent payment
          status: 'COMPLETED',
          reference: `PAY-${Date.now()}`
        }
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'WALLET_PAYMENT',
          details: `Paid ${amount} UGX from wallet. Reason: ${reason || 'Car Payment'}`
        }
      });

      return { updatedSavings, transaction };
    });

    res.json({
      message: 'Payment successful',
      balance: result.updatedSavings.balance
    });
  } catch (error) {
    console.error('Pay From Wallet Error:', error.message);
    if (error.message === 'Insufficient wallet balance') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error processing payment' });
  }
};

module.exports = {
  deposit,
  getHistory,
  paymentWebhook,
  payFromWallet
};
