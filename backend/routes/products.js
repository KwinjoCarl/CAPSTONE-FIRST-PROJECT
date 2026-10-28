const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all products
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create product
router.post('/', async (req, res) => {
  try {
    const { name, sku, category, brand, unit, purchase_price, selling_price, current_stock, opening_stock, alert_quantity } = req.body;
    const [result] = await db.query(
      'INSERT INTO products (name, sku, category, brand, unit, purchase_price, selling_price, current_stock, opening_stock, alert_quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, sku, category, brand, unit, purchase_price, selling_price, current_stock || 0, opening_stock || 0, alert_quantity || 0]
    );
    res.status(201).json({ id: result.insertId, message: 'Product created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const { name, sku, category, brand, unit, purchase_price, selling_price, current_stock, alert_quantity } = req.body;
    await db.query(
      'UPDATE products SET name=?, sku=?, category=?, brand=?, unit=?, purchase_price=?, selling_price=?, current_stock=?, alert_quantity=? WHERE id=?',
      [name, sku, category, brand, unit, purchase_price, selling_price, current_stock, alert_quantity, req.params.id]
    );
    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
