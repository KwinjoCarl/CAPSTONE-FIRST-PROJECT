const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all suppliers
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM suppliers ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single supplier
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM suppliers WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create supplier
router.post('/', async (req, res) => {
  try {
    const { name, email, mobile, address } = req.body;
    const [result] = await db.query(
      'INSERT INTO suppliers (name, email, mobile, address) VALUES (?, ?, ?, ?)',
      [name, email, mobile, address]
    );
    res.status(201).json({ id: result.insertId, message: 'Supplier created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update supplier
router.put('/:id', async (req, res) => {
  try {
    const { name, email, mobile, address } = req.body;
    await db.query(
      'UPDATE suppliers SET name=?, email=?, mobile=?, address=? WHERE id=?',
      [name, email, mobile, address, req.params.id]
    );
    res.json({ message: 'Supplier updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete supplier
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM suppliers WHERE id = ?', [req.params.id]);
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
