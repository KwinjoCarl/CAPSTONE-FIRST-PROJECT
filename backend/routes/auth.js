const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { signToken } = require('../middleware/auth');

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const [rows] = await db.query(`
      SELECT u.*, r.permissions as role_permissions, r.name as role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.email = ?
    `, [email]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Username or password is incorrect' });
    }

    const user = rows[0];

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Username or password is incorrect' });
    }

    if (user.status && user.status !== 'Active') {
      return res.status(401).json({ error: 'Your account is inactive. Contact an administrator.' });
    }

    let permissions = [];
    if (user.role_permissions) {
      try {
        permissions = typeof user.role_permissions === 'string'
          ? JSON.parse(user.role_permissions)
          : user.role_permissions;
      } catch (e) {
        permissions = [];
      }
    }

    const token = signToken(user);

    res.json({
      id: String(user.id),
      email: user.email,
      username: user.username,
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      role: user.role_name || user.role || 'User',
      roleId: user.role_id,
      permissions,
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
