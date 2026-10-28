const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/dashboard/stats?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
router.get('/stats', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let salesFilter = '';
    let purchaseFilter = '';
    let expenseFilter = '';
    const params = [];

    if (start_date && end_date) {
      salesFilter = 'WHERE DATE(sale_date) BETWEEN ? AND ?';
      purchaseFilter = 'WHERE DATE(purchase_date) BETWEEN ? AND ?';
      expenseFilter = 'WHERE DATE(expense_date) BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }

    const [[sales]] = await db.query(
      `SELECT COALESCE(SUM(grand_total),0) AS total_sales,
              COALESCE(SUM(amount_received),0) AS total_received,
              COUNT(*) AS sales_count
       FROM sales ${salesFilter}`, params);

    const [[purchases]] = await db.query(
      `SELECT COALESCE(SUM(grand_total),0) AS total_purchases,
              COUNT(*) AS purchase_count
       FROM purchases ${purchaseFilter}`, params);

    const [[expenses]] = await db.query(
      `SELECT COALESCE(SUM(amount),0) AS total_expenses,
              COUNT(*) AS expense_count
       FROM expenses ${expenseFilter}`, params);

    const [[customers]] = await db.query('SELECT COUNT(*) AS total_customers FROM customers');
    const [[products]] = await db.query(
      'SELECT COUNT(*) AS total_products, COALESCE(SUM(current_stock * purchase_price),0) AS stock_value FROM products');

    // Daily sales trend for the selected range
    let trendQuery = `SELECT DATE(sale_date) AS day, COALESCE(SUM(grand_total),0) AS total
                      FROM sales ${salesFilter} GROUP BY DATE(sale_date) ORDER BY day`;
    const [trend] = await db.query(trendQuery, params);

    res.json({
      total_sales: sales.total_sales,
      total_received: sales.total_received,
      sales_count: sales.sales_count,
      total_purchases: purchases.total_purchases,
      purchase_count: purchases.purchase_count,
      total_expenses: expenses.total_expenses,
      expense_count: expenses.expense_count,
      total_customers: customers.total_customers,
      total_products: products.total_products,
      stock_value: products.stock_value,
      net_profit: sales.total_sales - purchases.total_purchases - expenses.total_expenses,
      sales_trend: trend
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
