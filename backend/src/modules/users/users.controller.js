const { PrismaClient } = require('@prisma/client');
const { logAction } = require('../../shared/utils/audit.util');

const prisma = new PrismaClient();

const submitKyc = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nationalId, selfieUrl, address, employmentStatus } = req.body;

    // Ensure all required KYC fields are present
    if (!nationalId || !selfieUrl || !address || !employmentStatus) {
      return res.status(400).json({ error: 'Missing required KYC fields' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        nationalId,
        selfieUrl,
        address,
        employmentStatus,
        kycStatus: 'PENDING' // Sets it back to pending if they are updating
      }
    });

    // Log the KYC submission
    await logAction(userId, 'KYC_SUBMISSION', JSON.stringify({ nationalId, employmentStatus }), req.ip);

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
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { 
        id: true, email: true, name: true, role: true, 
        status: true, kycStatus: true, nationalId: true, 
        address: true, employmentStatus: true 
      }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error retrieving profile' });
  }
};

const approveKyc = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body; // e.g., 'APPROVED', 'REJECTED'

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

    await logAction(req.user.id, 'KYC_REVIEWED', `Admin reviewed KYC for user ${userId}. Result: ${status}`, req.ip);

    res.json({ message: 'KYC status updated successfully', user: updatedUser });
  } catch (error) {
    console.error('KYC Approval Error:', error);
    res.status(500).json({ error: 'Server error updating KYC status' });
  }
};

const updateMyRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { role }
    });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: 'fail' });
  }
};

module.exports = {
  submitKyc,
  getMyProfile,
  approveKyc,
  updateMyRole
};
