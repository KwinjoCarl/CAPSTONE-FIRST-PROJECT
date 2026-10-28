const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Profit/Loss Report
router.get('/profit-loss', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let dateFilter = '';
    let params = [];
    
    if (start_date && end_date) {
      dateFilter = 'WHERE DATE(created_at) BETWEEN ? AND ?';
      params = [start_date, end_date];
    }
    
    // Get sales data
    const [sales] = await db.query(`SELECT SUM(grand_total) as total_sales, SUM(shipping_charge) as sell_shipping, SUM(discount) as sell_discount FROM sales ${dateFilter}`, params);
    
    // Get purchases data
    const [purchases] = await db.query(`SELECT SUM(grand_total) as total_purchases, SUM(shipping_charge) as purchase_shipping, SUM(discount) as purchase_discount FROM purchases ${dateFilter}`, params);
    
    // Get expenses
    const [expenses] = await db.query(`SELECT SUM(amount) as total_expenses FROM expenses ${dateFilter}`, params);
    
    // Get stock adjustments
    const [adjustments] = await db.query(`
      SELECT SUM(sa.quantity * p.purchase_price) as total_adjustment 
      FROM stock_adjustments sa 
      JOIN products p ON sa.product_id = p.id 
      WHERE sa.type IN ('subtraction', 'damage') ${dateFilter ? 'AND ' + dateFilter.replace('WHERE', '') : ''}
    `, params);
    
    // Get opening and closing stock
    const [stockData] = await db.query(`
      SELECT 
        SUM(opening_stock * purchase_price) as opening_stock_purchase,
        SUM(opening_stock * selling_price) as opening_stock_sale,
        SUM(current_stock * purchase_price) as closing_stock_purchase,
        SUM(current_stock * selling_price) as closing_stock_sale
      FROM products
    `);
    
    const reportData = {
      opening_stock: {
        by_purchase: stockData[0].opening_stock_purchase || 0,
        by_sale: stockData[0].opening_stock_sale || 0
      },
      closing_stock: {
        by_purchase: stockData[0].closing_stock_purchase || 0,
        by_sale: stockData[0].closing_stock_sale || 0
      },
      total_sales: sales[0].total_sales || 0,
      total_purchases: purchases[0].total_purchases || 0,
      total_expenses: expenses[0].total_expenses || 0,
      total_stock_adjustment: adjustments[0].total_adjustment || 0,
      purchase_shipping: purchases[0].purchase_shipping || 0,
      sell_shipping: sales[0].sell_shipping || 0,
      purchase_discount: purchases[0].purchase_discount || 0,
      sell_discount: sales[0].sell_discount || 0
    };
    
    // Calculate COGS, Gross Profit, Net Profit
    reportData.cogs = reportData.opening_stock.by_purchase + reportData.total_purchases + reportData.total_expenses + reportData.purchase_shipping - reportData.closing_stock.by_purchase;
    reportData.gross_profit = reportData.total_sales - reportData.cogs;
    reportData.net_profit = reportData.gross_profit - reportData.sell_discount - reportData.total_stock_adjustment + reportData.purchase_discount + reportData.sell_shipping;
    
    res.json(reportData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sales Report
router.get('/sales', async (req, res) => {
  try {
    const { start_date, end_date, customer_id, payment_method, location, salesperson } = req.query;
    
    let whereConditions = [];
    let params = [];
    
    if (start_date && end_date) {
      whereConditions.push('DATE(s.sale_date) BETWEEN ? AND ?');
      params.push(start_date, end_date);
    }
    if (customer_id) {
      whereConditions.push('s.customer_id = ?');
      params.push(customer_id);
    }
    if (payment_method) {
      whereConditions.push('s.payment_method = ?');
      params.push(payment_method);
    }
    if (location) {
      whereConditions.push('s.location = ?');
      params.push(location);
    }
    if (salesperson) {
      whereConditions.push('s.salesperson = ?');
      params.push(salesperson);
    }
    
    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
    
    const [sales] = await db.query(`
      SELECT s.*, c.name as customer_name
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      ${whereClause}
      ORDER BY s.sale_date DESC, s.created_at DESC
    `, params);
    
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Purchases Report
router.get('/purchases', async (req, res) => {
  try {
    const { start_date, end_date, supplier_id, status } = req.query;
    
    let whereConditions = [];
    let params = [];
    
    if (start_date && end_date) {
      whereConditions.push('DATE(p.purchase_date) BETWEEN ? AND ?');
      params.push(start_date, end_date);
    }
    if (supplier_id) {
      whereConditions.push('p.supplier_id = ?');
      params.push(supplier_id);
    }
    if (status) {
      whereConditions.push('p.status = ?');
      params.push(status);
    }
    
    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
    
    const [purchases] = await db.query(`
      SELECT p.*, s.name as supplier_name
      FROM purchases p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      ${whereClause}
      ORDER BY p.purchase_date DESC, p.created_at DESC
    `, params);
    
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Product Stock Report
router.get('/product-stock', async (req, res) => {
  try {
    const { category, brand, stock_status } = req.query;
    
    let whereConditions = [];
    let params = [];
    
    if (category) {
      whereConditions.push('category = ?');
      params.push(category);
    }
    if (brand) {
      whereConditions.push('brand = ?');
      params.push(brand);
    }
    
    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
    
    const [products] = await db.query(`
      SELECT *,
        (current_stock * purchase_price) as stock_value,
        (current_stock * selling_price) as potential_revenue,
        (current_stock * (selling_price - purchase_price)) as potential_profit,
        CASE
          WHEN current_stock = 0 THEN 'Out of Stock'
          WHEN current_stock <= alert_quantity THEN 'Low Stock'
          ELSE 'In Stock'
        END as stock_status
      FROM products
      ${whereClause}
      ORDER BY name
    `, params);
    
    // Filter by stock status if provided
    let filteredProducts = products;
    if (stock_status) {
      filteredProducts = products.filter(p => p.stock_status === stock_status);
    }
    
    res.json(filteredProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Customers Report
router.get('/customers', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let dateFilter = '';
    let params = [];
    
    if (start_date && end_date) {
      dateFilter = 'AND DATE(s.sale_date) BETWEEN ? AND ?';
      params = [start_date, end_date];
    }
    
    const [customers] = await db.query(`
      SELECT 
        c.id,
        c.name,
        c.email,
        c.mobile,
        COUNT(s.id) as sales_count,
        COALESCE(SUM(s.grand_total), 0) as total_amount,
        COALESCE(SUM(s.amount_received), 0) as total_paid,
        COALESCE(SUM(s.grand_total - s.amount_received), 0) as total_due
      FROM customers c
      LEFT JOIN sales s ON c.id = s.customer_id ${dateFilter}
      GROUP BY c.id, c.name, c.email, c.mobile
      ORDER BY total_amount DESC
    `, params);
    
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Suppliers Report
router.get('/suppliers', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let dateFilter = '';
    let params = [];
    
    if (start_date && end_date) {
      dateFilter = 'AND DATE(p.purchase_date) BETWEEN ? AND ?';
      params = [start_date, end_date];
    }
    
    const [suppliers] = await db.query(`
      SELECT 
        s.id,
        s.name,
        s.email,
        s.mobile,
        COUNT(p.id) as purchase_count,
        COALESCE(SUM(p.grand_total), 0) as total_amount,
        COALESCE(SUM(p.amount_paid), 0) as total_paid,
        COALESCE(SUM(p.grand_total - p.amount_paid), 0) as total_due
      FROM suppliers s
      LEFT JOIN purchases p ON s.id = p.supplier_id ${dateFilter}
      GROUP BY s.id, s.name, s.email, s.mobile
      ORDER BY total_amount DESC
    `, params);
    
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
