import { Card, Col, Row, Table, Badge, Alert, Form, Button } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const HomePage = () => {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState({
    todaySales: 0,
    totalSales: 0,
    totalPurchases: 0,
    totalExpenses: 0,
    netProfit: 0,
    currentStockValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    totalCustomers: 0,
    totalSuppliers: 0,
    totalProducts: 0
  });

  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [salesChartData, setSalesChartData] = useState({
    series: [],
    categories: []
  });

  // Date range filter — affects ONLY the KPI metric cards
  const [datePreset, setDatePreset] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [dateRange, setDateRange] = useState(null); // { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' } or null = all time

  const toDateStr = (d) => d.toISOString().split('T')[0];

  const presetRanges = {
    today: () => {
      const t = toDateStr(new Date());
      return { start: t, end: t };
    },
    '7days': () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 6);
      return { start: toDateStr(start), end: toDateStr(end) };
    },
    '30days': () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 29);
      return { start: toDateStr(start), end: toDateStr(end) };
    },
    lastMonth: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start: toDateStr(start), end: toDateStr(end) };
    },
    thisYear: () => {
      const now = new Date();
      return { start: `${now.getFullYear()}-01-01`, end: toDateStr(now) };
    },
    lastYearMonth: () => {
      const now = new Date();
      const start = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      const end = new Date(now.getFullYear() - 1, now.getMonth() + 1, 0);
      return { start: toDateStr(start), end: toDateStr(end) };
    }
  };

  const handlePresetChange = (e) => {
    const preset = e.target.value;
    setDatePreset(preset);
    if (preset === 'all') {
      setDateRange(null);
    } else if (preset === 'custom') {
      // keep current range until Apply is clicked with valid dates
      if (customStart && customEnd) applyCustomRange();
    } else {
      setDateRange(presetRanges[preset]());
    }
  };

  const applyCustomRange = () => {
    if (!customStart || !customEnd) {
      toast.error('Please select both start and end dates');
      return;
    }
    if (customEnd < customStart) {
      toast.error('End date cannot be before start date');
      return;
    }
    setDateRange({ start: customStart, end: customEnd });
  };

  const inRange = (dateStr, range) => {
    if (!range || !dateStr) return !range; // no range = include all; missing date = exclude when filtering
    const d = new Date(dateStr);
    if (isNaN(d)) return false;
    return dateStr >= range.start && dateStr <= range.end;
  };

  const activeRangeLabel = dateRange
    ? `${new Date(dateRange.start).toLocaleDateString()} – ${new Date(dateRange.end).toLocaleDateString()}`
    : 'All time';

  useEffect(() => {
    loadDashboardData(dateRange);
  }, [dateRange]);

  const loadDashboardData = (range) => {
    // Load all data from localStorage
    const products = JSON.parse(localStorage.getItem('bms_products') || '[]');
    const sales = JSON.parse(localStorage.getItem('bms_sales') || '[]');
    const purchases = JSON.parse(localStorage.getItem('bms_purchases') || '[]');
    const expenses = JSON.parse(localStorage.getItem('bms_expenses') || '[]');
    const customers = JSON.parse(localStorage.getItem('bms_customers') || '[]');
    const suppliers = JSON.parse(localStorage.getItem('bms_suppliers') || '[]');

    // Calculate KPIs — filtered by selected date range (metric cards only)
    const rangeSales = sales.filter(s => inRange(s.saleDate || s.createdAt, range));
    const rangePurchases = purchases.filter(p => inRange(p.purchaseDate || p.createdAt, range));
    const rangeExpenses = expenses.filter(e => inRange(e.date || e.createdAt, range));

    const rangeSalesTotal = rangeSales.reduce((sum, sale) => sum + (sale.grandTotal || 0), 0);

    // Total sales (all-time — used as subtitle only)
    const totalSalesAmount = sales.reduce((sum, sale) => sum + (sale.grandTotal || 0), 0);

    // Total purchases
    const totalPurchasesAmount = rangePurchases.reduce((sum, purchase) => sum + (purchase.grandTotal || 0), 0);

    // Total expenses
    const totalExpensesAmount = rangeExpenses.reduce((sum, expense) => sum + (parseFloat(expense.totalAmount) || 0), 0);

    // Net profit (simplified: sales - purchases - expenses)
    const netProfitAmount = rangeSalesTotal - totalPurchasesAmount - totalExpensesAmount;

    // Stock valuation
    const stockValue = products.reduce((sum, product) => {
      const stock = product.currentStock || 0;
      const purchasePrice = product.purchasePrice || 0;
      return sum + (stock * purchasePrice);
    }, 0);

    // Low stock and out of stock items
    const lowStock = products.filter(p => {
      const stock = p.currentStock || 0;
      const alertQty = p.alertQuantity || 10;
      return stock > 0 && stock <= alertQty;
    });

    const outOfStock = products.filter(p => (p.currentStock || 0) === 0);

    // Top selling products (from sales data)
    const productSales = {};
    sales.forEach(sale => {
      sale.items?.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            productId: item.productId,
            productName: item.productName,
            sku: item.sku,
            totalQuantity: 0,
            totalRevenue: 0
          };
        }
        productSales[item.productId].totalQuantity += item.quantity;
        productSales[item.productId].totalRevenue += item.lineTotal;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5);

    // Recent transactions (last 5 sales)
    const recentSales = sales
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    // Sales chart data (last 7 days)
    const last7Days = [];
    const salesByDay = {};
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last7Days.push(dateStr);
      salesByDay[dateStr] = 0;
    }

    sales.forEach(sale => {
      const saleDate = sale.saleDate;
      if (salesByDay.hasOwnProperty(saleDate)) {
        salesByDay[saleDate] += sale.grandTotal || 0;
      }
    });

    const chartCategories = last7Days.map(date => {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const chartData = last7Days.map(date => salesByDay[date]);

    // Update state
    setKpis({
      todaySales: rangeSalesTotal,
      totalSales: totalSalesAmount,
      totalPurchases: totalPurchasesAmount,
      totalExpenses: totalExpensesAmount,
      netProfit: netProfitAmount,
      currentStockValue: stockValue,
      lowStockItems: lowStock.length,
      outOfStockItems: outOfStock.length,
      totalCustomers: customers.length,
      totalSuppliers: suppliers.length,
      totalProducts: products.length
    });

    setLowStockProducts(lowStock.slice(0, 10));
    setTopSellingProducts(topProducts);
    setRecentTransactions(recentSales);
    setSalesChartData({
      series: chartData,
      categories: chartCategories
    });
  };

  const salesChart = {
    series: [{
      name: 'Sales',
      data: salesChartData.series
    }],
    options: {
      chart: {
        type: 'area',
        height: 350,
        toolbar: {
          show: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        width: 2
      },
      xaxis: {
        categories: salesChartData.categories
      },
      yaxis: {
        title: {
          text: 'Sales Amount ($)'
        }
      },
      colors: ['#3b82f6'],
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.3,
        }
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return "$ " + val.toFixed(2)
          }
        }
      }
    }
  };

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <h4 className="page-title">Dashboard - Business Overview</h4>
          </div>
        </Col>
      </Row>

      {/* Date Range Filter — affects KPI cards only */}
      <Row className="mb-3">
        <Col xs={12}>
          <Card>
            <Card.Body className="py-2">
              <div className="d-flex align-items-center flex-wrap gap-2">
                <span className="fw-bold text-nowrap">
                  <i className="mdi mdi-calendar-range me-1"></i>Date Range:
                </span>
                <Form.Select
                  size="sm"
                  style={{ width: 'auto' }}
                  value={datePreset}
                  onChange={handlePresetChange}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="thisYear">This Year</option>
                  <option value="lastYearMonth">This Month Last Year</option>
                  <option value="custom">Custom Range</option>
                </Form.Select>
                {datePreset === 'custom' && (
                  <>
                    <Form.Control
                      type="date"
                      size="sm"
                      style={{ width: 'auto' }}
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                    />
                    <span className="text-muted">to</span>
                    <Form.Control
                      type="date"
                      size="sm"
                      style={{ width: 'auto' }}
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                    />
                    <Button size="sm" variant="primary" onClick={applyCustomRange}>
                      Apply
                    </Button>
                  </>
                )}
                <span className="text-muted ms-auto text-nowrap">
                  <i className="mdi mdi-calendar-check me-1"></i>
                  Active: {activeRangeLabel}
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Low Stock Alert */}
      {(kpis.lowStockItems > 0 || kpis.outOfStockItems > 0) && (
        <Row>
          <Col xs={12}>
            <Alert variant="warning" className="d-flex align-items-center">
              <i className="mdi mdi-alert-circle-outline me-2 fs-4"></i>
              <div>
                <strong>Inventory Alert:</strong> 
                {kpis.outOfStockItems > 0 && (
                  <span className="ms-2">
                    <Badge bg="danger">{kpis.outOfStockItems}</Badge> items out of stock
                  </span>
                )}
                {kpis.lowStockItems > 0 && (
                  <span className="ms-2">
                    <Badge bg="warning">{kpis.lowStockItems}</Badge> items low on stock
                  </span>
                )}
                <span 
                  className="ms-3 text-primary" 
                  style={{ cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => navigate('/products/list')}
                >
                  View Details →
                </span>
              </div>
            </Alert>
          </Col>
        </Row>
      )}

      {/* KPI Cards */}
      <Row>
        <Col md={3}>
          <Card className="widget-flat">
            <Card.Body>
              <div className="float-end">
                <i className="mdi mdi-cash-multiple widget-icon bg-success-lighten text-success"></i>
              </div>
              <h5 className="text-muted fw-normal mt-0" title="Today's Sales">Today's Sales</h5>
              <h3 className="mt-3 mb-3">${kpis.todaySales.toFixed(2)}</h3>
              <p className="mb-0 text-muted">
                <span className="text-success me-2">
                  <i className="mdi mdi-arrow-up-bold"></i>
                </span>
                <span className="text-nowrap">Total: ${kpis.totalSales.toFixed(2)}</span>
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="widget-flat">
            <Card.Body>
              <div className="float-end">
                <i className="mdi mdi-package-variant widget-icon bg-primary-lighten text-primary"></i>
              </div>
              <h5 className="text-muted fw-normal mt-0" title="Stock Value">Current Stock Value</h5>
              <h3 className="mt-3 mb-3">${kpis.currentStockValue.toFixed(2)}</h3>
              <p className="mb-0 text-muted">
                <span className="text-nowrap">{kpis.totalProducts} Products</span>
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="widget-flat">
            <Card.Body>
              <div className="float-end">
                <i className="mdi mdi-alert-circle widget-icon bg-warning-lighten text-warning"></i>
              </div>
              <h5 className="text-muted fw-normal mt-0" title="Low Stock Items">Low Stock Items</h5>
              <h3 className="mt-3 mb-3">{kpis.lowStockItems}</h3>
              <p className="mb-0 text-muted">
                <span className="text-danger me-2">
                  <i className="mdi mdi-alert"></i> {kpis.outOfStockItems} Out of Stock
                </span>
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="widget-flat">
            <Card.Body>
              <div className="float-end">
                <i className="mdi mdi-chart-line widget-icon bg-info-lighten text-info"></i>
              </div>
              <h5 className="text-muted fw-normal mt-0" title="Net Profit">Net Profit</h5>
              <h3 className="mt-3 mb-3">
                <span className={kpis.netProfit >= 0 ? 'text-success' : 'text-danger'}>
                  ${kpis.netProfit.toFixed(2)}
                </span>
              </h3>
              <p className="mb-0 text-muted">
                <span className="text-nowrap">Revenue - Costs</span>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Secondary KPIs */}
      <Row>
        <Col md={3}>
          <Card className="widget-flat">
            <Card.Body>
              <div className="float-end">
                <i className="mdi mdi-cart widget-icon bg-danger-lighten text-danger"></i>
              </div>
              <h5 className="text-muted fw-normal mt-0">Total Purchases</h5>
              <h3 className="mt-3 mb-3">${kpis.totalPurchases.toFixed(2)}</h3>
              <p className="mb-0 text-muted">
                <span className="text-nowrap">{kpis.totalSuppliers} Suppliers</span>
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="widget-flat">
            <Card.Body>
              <div className="float-end">
                <i className="mdi mdi-receipt widget-icon bg-secondary-lighten text-secondary"></i>
              </div>
              <h5 className="text-muted fw-normal mt-0">Total Expenses</h5>
              <h3 className="mt-3 mb-3">${kpis.totalExpenses.toFixed(2)}</h3>
              <p className="mb-0 text-muted">
                <span className="text-nowrap">Operating Costs</span>
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="widget-flat">
            <Card.Body>
              <div className="float-end">
                <i className="mdi mdi-account-multiple widget-icon bg-success-lighten text-success"></i>
              </div>
              <h5 className="text-muted fw-normal mt-0">Total Customers</h5>
              <h3 className="mt-3 mb-3">{kpis.totalCustomers}</h3>
              <p className="mb-0 text-muted">
                <span className="text-nowrap">Registered</span>
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="widget-flat">
            <Card.Body>
              <div className="float-end">
                <i className="mdi mdi-cube-outline widget-icon bg-primary-lighten text-primary"></i>
              </div>
              <h5 className="text-muted fw-normal mt-0">Total Products</h5>
              <h3 className="mt-3 mb-3">{kpis.totalProducts}</h3>
              <p className="mb-0 text-muted">
                <span className="text-nowrap">In Catalog</span>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Sales Chart */}
      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body>
              <h4 className="header-title mb-3">Sales Trend - Last 7 Days</h4>
              <ReactApexChart
                options={salesChart.options}
                series={salesChart.series}
                type="area"
                height={350}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Low Stock Alert Table */}
        <Col lg={6}>
          <Card>
            <Card.Body>
              <h4 className="header-title mb-3">
                <i className="mdi mdi-alert-circle text-warning me-2"></i>
                Low Stock Alert
              </h4>
              <div className="table-responsive">
                <Table className="table-sm table-centered mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Current Stock</th>
                      <th>Alert Level</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockProducts.length > 0 ? (
                      lowStockProducts.map((product) => (
                        <tr key={product.id}>
                          <td>{product.name}</td>
                          <td>{product.sku}</td>
                          <td>
                            <span className="text-danger fw-bold">
                              {product.currentStock || 0}
                            </span>
                          </td>
                          <td>{product.alertQuantity || 10}</td>
                          <td>
                            <Badge bg="warning">Low Stock</Badge>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-3">
                          <i className="mdi mdi-check-circle text-success me-2"></i>
                          All products have sufficient stock
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
              {lowStockProducts.length > 0 && (
                <div className="text-center mt-3">
                  <span 
                    className="text-primary" 
                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() => navigate('/products/list')}
                  >
                    View All Products →
                  </span>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Top Selling Products */}
        <Col lg={6}>
          <Card>
            <Card.Body>
              <h4 className="header-title mb-3">
                <i className="mdi mdi-star text-warning me-2"></i>
                Top Selling Products
              </h4>
              <div className="table-responsive">
                <Table className="table-sm table-centered mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Qty Sold</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topSellingProducts.length > 0 ? (
                      topSellingProducts.map((product, index) => (
                        <tr key={product.productId}>
                          <td>
                            <Badge bg="primary" className="me-2">{index + 1}</Badge>
                            {product.productName}
                          </td>
                          <td>{product.sku}</td>
                          <td>
                            <span className="fw-bold">{product.totalQuantity}</span>
                          </td>
                          <td className="text-success fw-bold">
                            ${product.totalRevenue.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center text-muted py-3">
                          No sales data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Transactions */}
      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body>
              <h4 className="header-title mb-3">
                <i className="mdi mdi-clock-outline me-2"></i>
                Recent Transactions
              </h4>
              <div className="table-responsive">
                <Table className="table-centered table-nowrap mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Transaction ID</th>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Payment Method</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.length > 0 ? (
                      recentTransactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td>
                            <span className="text-primary fw-bold">
                              {transaction.transactionId || transaction.invoiceNo}
                            </span>
                          </td>
                          <td>{new Date(transaction.saleDate).toLocaleDateString()}</td>
                          <td>{transaction.customerName}</td>
                          <td>{transaction.totalItems}</td>
                          <td>
                            <Badge bg="secondary">
                              {transaction.paymentMethod?.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="text-success fw-bold">
                            ${transaction.grandTotal.toFixed(2)}
                          </td>
                          <td>
                            <Badge bg={transaction.status === 'final' ? 'success' : 'warning'}>
                              {transaction.status}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center text-muted py-3">
                          No recent transactions
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
              {recentTransactions.length > 0 && (
                <div className="text-center mt-3">
                  <span 
                    className="text-primary" 
                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() => navigate('/sales/all')}
                  >
                    View All Sales →
                  </span>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default HomePage;
