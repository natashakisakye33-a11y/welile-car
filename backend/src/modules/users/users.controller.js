const { PrismaClient } = require('@prisma/client');
const { logAction } = require('../../shared/utils/audit.util');
const fs = require('fs');
const path = require('path');

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
        id: true, email: true, name: true, phone: true, role: true, 
        status: true, kycStatus: true, nationalId: true, 
        address: true, employmentStatus: true, avatarUrl: true, passportUrl: true,
        selectedVehicleId: true, selectedVehicleCondition: true, selectedVehiclePrice: true
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

const selectVehicle = async (req, res) => {
  try {
    const userId = req.user.id;
    const { vehicleId, condition, price } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        selectedVehicleId: vehicleId ? parseInt(vehicleId) : null,
        selectedVehicleCondition: condition || 'used',
        selectedVehiclePrice: price ? parseFloat(price) : null
      }
    });

    await logAction(userId, 'VEHICLE_SELECTED', `Selected vehicle ${vehicleId} as target.`, req.ip);

    res.json({ message: 'Vehicle selected successfully', user: updatedUser });
  } catch (error) {
    console.error('Select Vehicle Error:', error);
    res.status(500).json({ error: 'Server error selecting vehicle' });
  }
};

const saveBase64Image = (base64Str, prefix) => {
  if (!base64Str || !base64Str.startsWith('data:')) return base64Str;
  
  try {
    const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return base64Str;
    
    const ext = matches[1].split('/')[1] || 'jpg';
    const buffer = Buffer.from(matches[2], 'base64');
    
    const uploadsDir = path.join(__dirname, '../../../public/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const filename = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);
    
    return `/uploads/${filename}`;
  } catch (err) {
    console.error('Failed to save base64 image:', err);
    return base64Str;
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      name, phone, residence, address, nationalId, national_id, employmentStatus, employment_status, avatar_url, passport_url, avatarUrl, passportUrl,
      guarantor1Name, guarantor1Phone, guarantor1Email, guarantor1Id_url,
      guarantor2Name, guarantor2Phone, guarantor2Email, guarantor2Id_url
    } = req.body;

    const dataToUpdate = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (phone !== undefined) dataToUpdate.phone = phone;
    if (residence !== undefined) dataToUpdate.address = residence;
    if (address !== undefined) dataToUpdate.address = address;
    
    if (guarantor1Name !== undefined) dataToUpdate.guarantor1Name = guarantor1Name;
    if (guarantor1Phone !== undefined) dataToUpdate.guarantor1Phone = guarantor1Phone;
    if (guarantor1Email !== undefined) dataToUpdate.guarantor1Email = guarantor1Email;
    if (guarantor2Name !== undefined) dataToUpdate.guarantor2Name = guarantor2Name;
    if (guarantor2Phone !== undefined) dataToUpdate.guarantor2Phone = guarantor2Phone;
    if (guarantor2Email !== undefined) dataToUpdate.guarantor2Email = guarantor2Email;
    
    if (guarantor1Id_url !== undefined) {
      if (guarantor1Id_url === '' || guarantor1Id_url === null) dataToUpdate.guarantor1IdUrl = null;
      else dataToUpdate.guarantor1IdUrl = saveBase64Image(guarantor1Id_url, 'g1_id');
    }
    if (guarantor2Id_url !== undefined) {
      if (guarantor2Id_url === '' || guarantor2Id_url === null) dataToUpdate.guarantor2IdUrl = null;
      else dataToUpdate.guarantor2IdUrl = saveBase64Image(guarantor2Id_url, 'g2_id');
    }
    
    const rawNationalId = nationalId !== undefined ? nationalId : national_id;
    if (rawNationalId !== undefined) dataToUpdate.nationalId = rawNationalId;

    const rawEmploymentStatus = employmentStatus !== undefined ? employmentStatus : employment_status;
    if (rawEmploymentStatus !== undefined) dataToUpdate.employmentStatus = rawEmploymentStatus;

    const rawAvatar = avatar_url !== undefined ? avatar_url : avatarUrl;
    if (rawAvatar !== undefined) {
      if (rawAvatar === '' || rawAvatar === null) {
        dataToUpdate.avatarUrl = null;
      } else {
        dataToUpdate.avatarUrl = saveBase64Image(rawAvatar, 'avatar');
      }
    }

    const rawPassport = passport_url !== undefined ? passport_url : passportUrl;
    if (rawPassport !== undefined) {
      if (rawPassport === '' || rawPassport === null) {
        dataToUpdate.passportUrl = null;
      } else {
        dataToUpdate.passportUrl = saveBase64Image(rawPassport, 'passport');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        status: true,
        kycStatus: true,
        nationalId: true,
        address: true,
        employmentStatus: true,
        avatarUrl: true,
        passportUrl: true,
        guarantor1Name: true,
        guarantor1Phone: true,
        guarantor1Email: true,
        guarantor1IdUrl: true,
        guarantor2Name: true,
        guarantor2Phone: true,
        guarantor2Email: true,
        guarantor2IdUrl: true
      }
    });

    await logAction(userId, 'PROFILE_UPDATED', 'Updated profile details.', req.ip);

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Update Profile Error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Phone number or National ID is already registered to another user' });
    }
    res.status(500).json({ error: 'Server error updating profile' });
  }
};

module.exports = {
  submitKyc,
  getMyProfile,
  approveKyc,
  updateMyRole,
  selectVehicle,
  updateMyProfile
};
