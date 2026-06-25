const { PrismaClient } = require('@prisma/client');
const { logAction } = require('../../shared/utils/audit.util');

const prisma = new PrismaClient();

const getDbUser = async (id) => {
  return await prisma.user.findUnique({ where: { id: parseInt(id) } });
};

const submitKyc = async (req, res) => {
  try {
    const dbUser = await getDbUser(req.user.id);
    if (!dbUser) return res.status(404).json({ error: 'User not found' });
    
    const { nationalId, selfieUrl, address, employmentStatus } = req.body;

    if (!nationalId || !selfieUrl || !address || !employmentStatus) {
      return res.status(400).json({ error: 'Missing required KYC fields' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        nationalId,
        selfieUrl,
        address,
        employmentStatus,
        kycStatus: 'PENDING'
      }
    });

    await logAction(dbUser.id, 'KYC_SUBMISSION', JSON.stringify({ nationalId, employmentStatus }), req.ip);

    res.json({ message: 'KYC documents submitted successfully', user: updatedUser });
  } catch (error) {
    console.error('KYC Submission Error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'National ID is already registered to another user' });
    }
    res.status(500).json({ error: 'Server error during KYC submission' });
  }
};

const getMyProfile = async (req, res) => {
  try {
    let user = await prisma.user.findUnique({
      where: { id: parseInt(req.user.id) },
      select: { 
        id: true, email: true, name: true, role: true, 
        status: true, kycStatus: true, nationalId: true, 
        address: true, employmentStatus: true 
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const savings = await prisma.savingsAccount.findUnique({
      where: { userId: user.id }
    });

    res.json({ ...user, savingsAccount: savings || null });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
};

const approveKyc = async (req, res) => {
  try {
    const adminUser = await getDbUser(req.auth.userId);
    const { userId } = req.params;
    const { status } = req.body; 

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Status must be APPROVED or REJECTED' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        kycStatus: status,
        status: status === 'APPROVED' ? 'ACTIVE' : 'PENDING_KYC'
      }
    });

    if (adminUser) {
      await logAction(adminUser.id, 'KYC_REVIEWED', `Admin reviewed KYC for user ${userId}. Result: ${status}`, req.ip);
    }

    res.json({ message: 'KYC status updated successfully', user: updatedUser });
  } catch (error) {
    console.error('KYC Approval Error:', error);
    res.status(500).json({ error: 'Server error updating KYC status' });
  }
};

const updateMyRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    // Upsert equivalent since Prisma upsert requires unique non-nullable fields we might not have in update
    let existingUser = await prisma.user.findUnique({
      where: { clerkUserId: req.auth.userId }
    });

    if (!existingUser) {
       const newUser = await prisma.user.create({
          data: {
            clerkUserId: req.auth.userId,
            name: 'Restored User',
            phone: `TEMP_${req.auth.userId}`,
            role
          }
       });
       return res.json(newUser);
    }
    
    const user = await prisma.user.update({
      where: { clerkUserId: req.auth.userId },
      data: { role }
    });
    
    res.json(user);
  } catch (e) {
    console.error('Update Role Error:', e);
    res.status(500).json({ error: 'fail' });
  }
};

module.exports = {
  submitKyc,
  getMyProfile,
  approveKyc,
  updateMyRole
};
