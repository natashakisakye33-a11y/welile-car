// Force nodemon restart
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('./shared/middleware/auth.middleware');

// Routes
const usersRoutes = require('./modules/users/users.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const transactionsRoutes = require('./modules/transactions/transactions.routes');
const loansRoutes = require('./modules/loans/loans.routes');
const repaymentsRoutes = require('./modules/repayments/repayments.routes');
const vehiclesRoutes = require('./modules/vehicles/vehicles.routes');
const savingsRoutes = require('./modules/savings/savings.routes');
const adminRoutes = require('./modules/admin/admin.routes');

const app = express();
const port = process.env.PORT || 3000;
const prisma = new PrismaClient();

const path = require('path');
app.use(cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Basic health route
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', message: 'Backend and Database are running perfectly!' });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ status: 'error', message: 'Database connection failed', error: error.message, stack: error.stack });
  }
});

const authRoutes = require('./modules/auth/auth.routes');

// App routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/loans', loansRoutes);
app.use('/api/repayments', repaymentsRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/savings', savingsRoutes);
app.use('/api/admin', adminRoutes);

app.listen(port, '0.0.0.0', () => {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  let localIp = 'localhost';
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        localIp = net.address;
        break;
      }
    }
  }

  console.log(`Server running on http://0.0.0.0:${port}`);
  console.log(`Access API on your phone at http://${localIp}:${port}`);
});
