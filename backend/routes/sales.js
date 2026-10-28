const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all sales
router.get('/', async (req, res) => {
  try {
    const [sales] = await db.query(`
      SELECT s.*, c.name as customer_name 
      FROM sales s 
      LEFT JOIN customers c ON s.customer_id = c.id 
      ORDER BY s.created_at DESC
    `);
    
    // Get items for each sale
    for (let sale of sales) {
      const [items] = await db.query(`
        SELECT si.*, p.name as product_name, p.sku 
        FROM sale_items si 
        JOIN products p ON si.product_id = p.id 
        WHERE si.sale_id = ?
      `, [sale.id]);
      sale.items = items;
    }
    
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single sale
router.get('/:id', async (req, res) => {
  try {
    const [sales] = await db.query(`
      SELECT s.*, c.name as customer_name 
      FROM sales s 
      LEFT JOIN customers c ON s.customer_id = c.id 
      WHERE s.id = ?
    `, [req.params.id]);
    
    if (sales.length === 0) {
      return res.status(404).json({ error: 'Sale not found' });
    }
    
    const sale = sales[0];
    const [items] = await db.query(`
      SELECT si.*, p.name as product_name, p.sku 
      FROM sale_items si 
      JOIN products p ON si.product_id = p.id 
      WHERE si.sale_id = ?
    `, [sale.id]);
    
    sale.items = items;
    res.json(sale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create sale
router.post('/', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { invoice_no, customer_id, sale_date, subtotal, discount, tax, shipping_charge, grand_total, amount_received, payment_method, location, salesperson, status, items } = req.body;
    
    // Insert sale
    const [saleResult] = await connection.query(
      'INSERT INTO sales (invoice_no, customer_id, sale_date, subtotal, discount, tax, shipping_charge, grand_total, amount_received, payment_method, location, salesperson, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [invoice_no, customer_id, sale_date, subtotal, discount || 0, tax || 0, shipping_charge || 0, grand_total, amount_received, payment_method, location, salesperson, status || 'final']
    );
    
    const saleId = saleResult.insertId;
    
    // Insert sale items and update product stock
    for (let item of items) {
      await connection.query(
        'INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)',
        [saleId, item.product_id, item.quantity, item.unit_price, item.subtotal]
      );
      
      // Update product stock
      await connection.query(
        'UPDATE products SET current_stock = current_stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }
    
    await connection.commit();
    res.status(201).json({ id: saleId, message: 'Sale created successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// Delete sale
router.delete('/:id', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    // Get sale items to restore stock
    const [items] = await connection.query('SELECT * FROM sale_items WHERE sale_id = ?', [req.params.id]);
    
    // Restore product stock
    for (let item of items) {
      await connection.query(
        'UPDATE products SET current_stock = current_stock + ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }
    
    // Delete sale (items will be deleted by CASCADE)
    await connection.query('DELETE FROM sales WHERE id = ?', [req.params.id]);
    
    await connection.commit();
    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
