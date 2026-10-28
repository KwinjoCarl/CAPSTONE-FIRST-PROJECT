const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'bms3-dev-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h';

const signToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, roleId: user.role_id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });

// Verify JWT and load the user's current role permissions from the DB
const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    const [rows] = await db.query(
      `SELECT u.id, u.email, u.username, u.first_name, u.last_name, u.status,
              u.role_id, r.name AS role_name, r.permissions AS role_permissions
       FROM users u LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [payload.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'User no longer exists' });
    }
    const user = rows[0];
    if (user.status && user.status !== 'Active') {
      return res.status(403).json({ error: 'Account is inactive' });
    }

    let permissions = [];
    if (user.role_permissions) {
      try {
        permissions =
          typeof user.role_permissions === 'string'
            ? JSON.parse(user.role_permissions)
            : user.role_permissions;
      } catch (e) {
        permissions = [];
      }
    }

    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role_name || 'User',
      roleId: user.role_id,
      permissions
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired, please sign in again' });
    }
    return res.status(401).json({ error: 'Invalid authentication token' });
  }
};

// Admin role bypasses permission checks, matching the frontend behavior
const requirePermission = (permission) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (req.user.role === 'Admin') return next();
  if (req.user.permissions.includes(permission)) return next();
  return res.status(403).json({ error: 'You do not have permission to perform this action' });
};

module.exports = { authenticate, requirePermission, signToken, JWT_SECRET };
