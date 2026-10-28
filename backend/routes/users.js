const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Get all users (with role name)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.role, u.role_id,
             u.status, u.pin, u.created_at, r.name as role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.created_at DESC
    `);
    res.json(rows.map(({ password, ...u }) => u));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single user
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.role, u.role_id,
             u.status, u.pin, u.created_at, r.name as role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create user
router.post('/', async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, role_id, pin, status } = req.body;

    if (!email || !password || !role_id) {
      return res.status(400).json({ error: 'Email, password and role are required' });
    }

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    const [role] = await db.query('SELECT * FROM roles WHERE id = ?', [role_id]);
    if (role.length === 0) {
      return res.status(400).json({ error: 'Invalid role selected' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO users (username, email, password, first_name, last_name, role, role_id, pin, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        username || email.split('@')[0],
        email,
        hashedPassword,
        first_name || '',
        last_name || '',
        role[0].name,
        role_id,
        pin || null,
        status || 'Active'
      ]
    );
    res.status(201).json({ id: result.insertId, message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, role_id, pin, status } = req.body;

    const [user] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!email || !role_id) {
      return res.status(400).json({ error: 'Email and role are required' });
    }

    const [existing] = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, req.params.id]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    const [role] = await db.query('SELECT * FROM roles WHERE id = ?', [role_id]);
    if (role.length === 0) {
      return res.status(400).json({ error: 'Invalid role selected' });
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query(
        'UPDATE users SET username=?, email=?, password=?, first_name=?, last_name=?, role=?, role_id=?, pin=?, status=? WHERE id=?',
        [username, email, hashedPassword, first_name, last_name, role[0].name, role_id, pin, status, req.params.id]
      );
    } else {
      await db.query(
        'UPDATE users SET username=?, email=?, first_name=?, last_name=?, role=?, role_id=?, pin=?, status=? WHERE id=?',
        [username, email, first_name, last_name, role[0].name, role_id, pin, status, req.params.id]
      );
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const [user] = await db.query('SELECT id FROM users WHERE id = ?', [req.params.id]);
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
