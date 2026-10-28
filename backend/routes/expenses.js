const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all expenses
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM expenses ORDER BY expense_date DESC, created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single expense
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM expenses WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create expense
router.post('/', async (req, res) => {
  try {
    const { expense_date, category, amount, description } = req.body;
    const [result] = await db.query(
      'INSERT INTO expenses (expense_date, category, amount, description) VALUES (?, ?, ?, ?)',
      [expense_date, category, amount, description]
    );
    res.status(201).json({ id: result.insertId, message: 'Expense created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update expense
router.put('/:id', async (req, res) => {
  try {
    const { expense_date, category, amount, description } = req.body;
    await db.query(
      'UPDATE expenses SET expense_date=?, category=?, amount=?, description=? WHERE id=?',
      [expense_date, category, amount, description, req.params.id]
    );
    res.json({ message: 'Expense updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete expense
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM expenses WHERE id = ?', [req.params.id]);
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
