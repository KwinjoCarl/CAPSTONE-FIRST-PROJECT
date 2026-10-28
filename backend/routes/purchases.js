const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all purchases
router.get('/', async (req, res) => {
  try {
    const [purchases] = await db.query(`
      SELECT p.*, s.name as supplier_name 
      FROM purchases p 
      LEFT JOIN suppliers s ON p.supplier_id = s.id 
      ORDER BY p.created_at DESC
    `);
    
    // Get items for each purchase
    for (let purchase of purchases) {
      const [items] = await db.query(`
        SELECT pi.*, pr.name as product_name, pr.sku 
        FROM purchase_items pi 
        JOIN products pr ON pi.product_id = pr.id 
        WHERE pi.purchase_id = ?
      `, [purchase.id]);
      purchase.items = items;
    }
    
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single purchase
router.get('/:id', async (req, res) => {
  try {
    const [purchases] = await db.query(`
      SELECT p.*, s.name as supplier_name 
      FROM purchases p 
      LEFT JOIN suppliers s ON p.supplier_id = s.id 
      WHERE p.id = ?
    `, [req.params.id]);
    
    if (purchases.length === 0) {
      return res.status(404).json({ error: 'Purchase not found' });
    }
    
    const purchase = purchases[0];
    const [items] = await db.query(`
      SELECT pi.*, pr.name as product_name, pr.sku 
      FROM purchase_items pi 
      JOIN products pr ON pi.product_id = pr.id 
      WHERE pi.purchase_id = ?
    `, [purchase.id]);
    
    purchase.items = items;
    res.json(purchase);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create purchase
router.post('/', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { reference_no, supplier_id, purchase_date, subtotal, discount, tax, shipping_charge, grand_total, amount_paid, status, items } = req.body;
    
    // Insert purchase
    const [purchaseResult] = await connection.query(
      'INSERT INTO purchases (reference_no, supplier_id, purchase_date, subtotal, discount, tax, shipping_charge, grand_total, amount_paid, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [reference_no, supplier_id, purchase_date, subtotal, discount || 0, tax || 0, shipping_charge || 0, grand_total, amount_paid, status || 'pending']
    );
    
    const purchaseId = purchaseResult.insertId;
    
    // Insert purchase items and update product stock
    for (let item of items) {
      await connection.query(
        'INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)',
        [purchaseId, item.product_id, item.quantity, item.unit_price, item.subtotal]
      );
      
      // Update product stock if purchase is received
      if (status === 'received') {
        await connection.query(
          'UPDATE products SET current_stock = current_stock + ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }
    }
    
    await connection.commit();
    res.status(201).json({ id: purchaseId, message: 'Purchase created successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// Update purchase status
router.patch('/:id/status', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { status } = req.body;
    const [currentPurchase] = await connection.query('SELECT status FROM purchases WHERE id = ?', [req.params.id]);
    
    if (currentPurchase.length === 0) {
      return res.status(404).json({ error: 'Purchase not found' });
    }
    
    // If changing to received, update stock
    if (status === 'received' && currentPurchase[0].status !== 'received') {
      const [items] = await connection.query('SELECT * FROM purchase_items WHERE purchase_id = ?', [req.params.id]);
      
      for (let item of items) {
        await connection.query(
          'UPDATE products SET current_stock = current_stock + ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }
    }
    
    await connection.query('UPDATE purchases SET status = ? WHERE id = ?', [status, req.params.id]);
    
    await connection.commit();
    res.json({ message: 'Purchase status updated successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// Delete purchase
router.delete('/:id', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    // Get purchase status and items
    const [purchase] = await connection.query('SELECT status FROM purchases WHERE id = ?', [req.params.id]);
    
    if (purchase.length === 0) {
      return res.status(404).json({ error: 'Purchase not found' });
    }
    
    // If purchase was received, restore stock
    if (purchase[0].status === 'received') {
      const [items] = await connection.query('SELECT * FROM purchase_items WHERE purchase_id = ?', [req.params.id]);
      
      for (let item of items) {
        await connection.query(
          'UPDATE products SET current_stock = current_stock - ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }
    }
    
    // Delete purchase (items will be deleted by CASCADE)
    await connection.query('DELETE FROM purchases WHERE id = ?', [req.params.id]);
    
    await connection.commit();
    res.json({ message: 'Purchase deleted successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
