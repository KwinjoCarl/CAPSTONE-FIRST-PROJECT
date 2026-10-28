const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all roles
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM roles ORDER BY is_system DESC, name ASC');
    const roles = rows.map(r => ({
      ...r,
      permissions: typeof r.permissions === 'string' ? JSON.parse(r.permissions) : r.permissions
    }));
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single role
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM roles WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }
    const role = rows[0];
    role.permissions = typeof role.permissions === 'string' ? JSON.parse(role.permissions) : role.permissions;
    res.json(role);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create role
router.post('/', async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    if (!name || !Array.isArray(permissions)) {
      return res.status(400).json({ error: 'Role name and permissions array are required' });
    }

    const [existing] = await db.query('SELECT id FROM roles WHERE name = ?', [name]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'A role with this name already exists' });
    }

    const [result] = await db.query(
      'INSERT INTO roles (name, description, permissions) VALUES (?, ?, ?)',
      [name, description || '', JSON.stringify(permissions)]
    );
    res.status(201).json({ id: result.insertId, message: 'Role created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update role
router.put('/:id', async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    const [role] = await db.query('SELECT * FROM roles WHERE id = ?', [req.params.id]);
    if (role.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }

    if (!name || !Array.isArray(permissions)) {
      return res.status(400).json({ error: 'Role name and permissions array are required' });
    }

    await db.query(
      'UPDATE roles SET name = ?, description = ?, permissions = ? WHERE id = ?',
      [name, description || '', JSON.stringify(permissions), req.params.id]
    );
    res.json({ message: 'Role updated successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'A role with this name already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete role
router.delete('/:id', async (req, res) => {
  try {
    const [role] = await db.query('SELECT * FROM roles WHERE id = ?', [req.params.id]);
    if (role.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }

    if (role[0].is_system) {
      return res.status(400).json({ error: 'System roles cannot be deleted' });
    }

    const [users] = await db.query('SELECT COUNT(*) as c FROM users WHERE role_id = ?', [req.params.id]);
    if (users[0].c > 0) {
      return res.status(400).json({ error: `Cannot delete: ${users[0].c} user(s) still assigned to this role` });
    }

    await db.query('DELETE FROM roles WHERE id = ?', [req.params.id]);
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
