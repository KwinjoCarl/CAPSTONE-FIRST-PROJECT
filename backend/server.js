const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const { authenticate, requirePermission } = require('./middleware/auth');
const { protectModule, protectReport } = require('./middleware/permissions');

const app = express();

// CORS: only allow the configured frontend origin
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((o) => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser tools (no Origin header) and whitelisted origins
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Public routes
app.get('/', (req, res) => {
  res.json({ message: 'BMS3 API Server is running!' });
});
app.use('/api/auth', require('./routes/auth'));

// All routes below require a valid JWT + module permission
app.use('/api/users', authenticate, protectModule('users'), require('./routes/users'));
app.use('/api/roles', authenticate, protectModule('roles'), require('./routes/roles'));
app.use('/api/products', authenticate, protectModule('products'), require('./routes/products'));
app.use('/api/customers', authenticate, protectModule('customers'), require('./routes/customers'));
app.use('/api/suppliers', authenticate, protectModule('suppliers'), require('./routes/suppliers'));
app.use('/api/sales', authenticate, protectModule('sales'), require('./routes/sales'));
app.use('/api/purchases', authenticate, protectModule('purchases'), require('./routes/purchases'));
app.use('/api/expenses', authenticate, protectModule('expenses'), require('./routes/expenses'));
app.use('/api/stock-adjustments', authenticate, protectModule('stock_adjustments'), require('./routes/stockAdjustments'));
app.use('/api/reports', authenticate, protectReport, require('./routes/reports'));
app.use('/api/dashboard', authenticate, requirePermission('dashboard.view'), require('./routes/dashboard'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
