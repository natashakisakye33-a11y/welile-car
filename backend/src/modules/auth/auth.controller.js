const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../../shared/utils/jwt.util');

const prisma = new PrismaClient();

const register = async (req, res) => {
  try {
    const { phone, password, name, email, residence } = req.body;
    
    // Check if user exists by phone
    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser) {
      return res.status(400).json({ error: 'Phone number already in use' });
    }

    if (email) {
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ error: 'Email address already in use' });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user and a linked SavingsAccount
    const user = await prisma.user.create({
      data: {
        phone,
        passwordHash,
        name,
        email: email || null,
        address: residence || null,
        status: 'PENDING_KYC',
        kycStatus: 'PENDING',
        savingsAccount: {
          create: {
            balance: 0.00,
            targetAmount: 90000000 // Default target, user can update later
          }
        }
      }
    });

    const token = generateToken(user);
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  try {
    const { phone, password } = req.body; // 'phone' could be an email string from the frontend

    // Determine if the input is an email or phone number
    const isEmail = phone && phone.includes('@');
    
    const user = await prisma.user.findFirst({ 
      where: isEmail ? { email: phone } : { phone } 
    });
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

module.exports = {
  register,
  login
};
