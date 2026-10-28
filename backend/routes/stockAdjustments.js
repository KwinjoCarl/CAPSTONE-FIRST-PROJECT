const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all stock adjustments
router.get('/', async (req, res) => {
  try {
    const [adjustments] = await db.query(`
      SELECT sa.*, p.name as product_name, p.sku as product_sku, p.purchase_price as unit_cost
      FROM stock_adjustments sa
      JOIN products p ON sa.product_id = p.id
      ORDER BY sa.date DESC, sa.created_at DESC
    `);
    res.json(adjustments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single stock adjustment
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT sa.*, p.name as product_name, p.sku as product_sku, p.purchase_price as unit_cost
      FROM stock_adjustments sa
      JOIN products p ON sa.product_id = p.id
      WHERE sa.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Stock adjustment not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create stock adjustment
router.post('/', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { reference_no, product_id, type, quantity, reason, adjusted_by, date } = req.body;
    
    // Insert stock adjustment
    const [result] = await connection.query(
      'INSERT INTO stock_adjustments (reference_no, product_id, type, quantity, reason, adjusted_by, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [reference_no, product_id, type, quantity, reason, adjusted_by, date]
    );
    
    // Update product stock based on adjustment type
    if (type === 'addition') {
      await connection.query(
        'UPDATE products SET current_stock = current_stock + ? WHERE id = ?',
        [quantity, product_id]
      );
    } else if (type === 'subtraction' || type === 'damage') {
      await connection.query(
        'UPDATE products SET current_stock = current_stock - ? WHERE id = ?',
        [quantity, product_id]
      );
    }
    
    await connection.commit();
    res.status(201).json({ id: result.insertId, message: 'Stock adjustment created successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// Delete stock adjustment
router.delete('/:id', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    // Get adjustment details to reverse stock change
    const [adjustment] = await connection.query('SELECT * FROM stock_adjustments WHERE id = ?', [req.params.id]);
    
    if (adjustment.length === 0) {
      return res.status(404).json({ error: 'Stock adjustment not found' });
    }
    
    const adj = adjustment[0];
    
    // Reverse the stock adjustment
    if (adj.type === 'addition') {
      await connection.query(
        'UPDATE products SET current_stock = current_stock - ? WHERE id = ?',
        [adj.quantity, adj.product_id]
      );
    } else if (adj.type === 'subtraction' || adj.type === 'damage') {
      await connection.query(
        'UPDATE products SET current_stock = current_stock + ? WHERE id = ?',
        [adj.quantity, adj.product_id]
      );
    }
    
    // Delete adjustment
    await connection.query('DELETE FROM stock_adjustments WHERE id = ?', [req.params.id]);
    
    await connection.commit();
    res.json({ message: 'Stock adjustment deleted successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
