import { Card, Col, Row, Button, Form, Table, Nav, ButtonGroup } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { exportToCSV, exportToExcel } from '@/utils/exportUtils';

const ProfitLossReportPage = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [formData, setFormData] = useState({
    location: 'all',
    showEntries: '25'
  });
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [reportData, setReportData] = useState({
    openingStock: { byPurchase: 0, bySale: 0 },
    closingStock: { byPurchase: 0, bySale: 0 },
    totalPurchases: 0,
    totalSales: 0,
    totalExpenses: 0,
    totalStockAdjustment: 0,
    purchaseShipping: 0,
    sellShipping: 0,
    purchaseDiscount: 0,
    sellDiscount: 0,
    sellReturn: 0,
    purchaseReturn: 0,
    cogs: 0,
    grossProfit: 0,
    netProfit: 0
  });
  const [profitBreakdown, setProfitBreakdown] = useState([]);

  useEffect(() => {
    calculateProfitLoss();
  }, [dateRange]);

  const calculateProfitLoss = () => {
    const products = JSON.parse(localStorage.getItem('bms_products') || '[]');
    const sales = JSON.parse(localStorage.getItem('bms_sales') || '[]');
    const purchases = JSON.parse(localStorage.getItem('bms_purchases') || '[]');
    const expenses = JSON.parse(localStorage.getItem('bms_expenses') || '[]');
    const stockAdjustments = JSON.parse(localStorage.getItem('bms_stock_adjustments') || '[]');

    let filteredSales = sales;
    let filteredPurchases = purchases;
    let filteredExpenses = expenses;
    let filteredAdjustments = stockAdjustments;

    if (dateRange.startDate && dateRange.endDate) {
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      
      filteredSales = sales.filter(s => {
        const date = new Date(s.saleDate || s.createdAt);
        return date >= start && date <= end;
      });
      
      filteredPurchases = purchases.filter(p => {
        const date = new Date(p.purchaseDate || p.createdAt);
        return date >= start && date <= end;
      });
      
      filteredExpenses = expenses.filter(e => {
        const date = new Date(e.date || e.expenseDate || e.createdAt);
        return date >= start && date <= end;
      });
      
      filteredAdjustments = stockAdjustments.filter(a => {
        const date = new Date(a.date || a.createdAt);
        return date >= start && date <= end;
      });
    }

    const openingStockByPurchase = products.reduce((sum, p) => sum + ((p.openingStock || 0) * (p.purchasePrice || 0)), 0);
    const openingStockBySale = products.reduce((sum, p) => sum + ((p.openingStock || 0) * (p.sellingPrice || 0)), 0);
    
    const closingStockByPurchase = products.reduce((sum, p) => sum + ((p.currentStock || 0) * (p.purchasePrice || 0)), 0);
    const closingStockBySale = products.reduce((sum, p) => sum + ((p.currentStock || 0) * (p.sellingPrice || 0)), 0);

    const totalPurchases = filteredPurchases.reduce((sum, p) => sum + (p.grandTotal || 0), 0);
    const totalSales = filteredSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (parseFloat(e.totalAmount ?? e.amount) || 0), 0);
    
    const totalStockAdjustment = filteredAdjustments
      .filter(a => a.type === 'subtraction')
      .reduce((sum, a) => sum + ((a.quantity || 0) * (a.unitCost || 0)), 0);

    const purchaseShipping = filteredPurchases.reduce((sum, p) => sum + (p.shippingCharge || 0), 0);
    const sellShipping = filteredSales.reduce((sum, s) => sum + (s.shippingCharge || 0), 0);
    
    const purchaseDiscount = filteredPurchases.reduce((sum, p) => sum + (p.discount || 0), 0);
    const sellDiscount = filteredSales.reduce((sum, s) => sum + (s.discount || 0), 0);

    const sellReturn = 0;
    const purchaseReturn = 0;

    const cogs = openingStockByPurchase + totalPurchases + purchaseShipping - closingStockByPurchase;
    const grossProfit = totalSales - cogs;
    const netProfit = grossProfit - totalExpenses - sellDiscount - totalStockAdjustment + purchaseDiscount + sellShipping;

    setReportData({
      openingStock: { byPurchase: openingStockByPurchase, bySale: openingStockBySale },
      closingStock: { byPurchase: closingStockByPurchase, bySale: closingStockBySale },
      totalPurchases,
      totalSales,
      totalExpenses,
      totalStockAdjustment,
      purchaseShipping,
      sellShipping,
      purchaseDiscount,
      sellDiscount,
      sellReturn,
      purchaseReturn,
      cogs,
      grossProfit,
      netProfit
    });

    calculateProfitBreakdown(filteredSales, filteredPurchases, products);
  };

  const calculateProfitBreakdown = (sales, purchases, products) => {
    const productMap = {};

    sales.forEach(sale => {
      sale.items?.forEach(item => {
        const product = products.find(p => p.id === item.id || p.name === item.name);
        if (!product) return;

        if (!productMap[product.id]) {
          productMap[product.id] = {
            id: product.id,
            name: product.name,
            sku: product.sku,
            category: product.category,
            brand: product.brand,
            totalSold: 0,
            totalRevenue: 0,
            totalCost: 0,
            grossProfit: 0
          };
        }

        const revenue = item.subtotal || 0;
        const cost = (item.quantity || 0) * (product.purchasePrice || 0);
        
        productMap[product.id].totalSold += item.quantity || 0;
        productMap[product.id].totalRevenue += revenue;
        productMap[product.id].totalCost += cost;
        productMap[product.id].grossProfit += revenue - cost;
      });
    });

    setProfitBreakdown(Object.values(productMap));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFilter = () => {
    calculateProfitLoss();
  };

  const handleReset = () => {
    setDateRange({ startDate: '', endDate: '' });
  };

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <div className="page-title-right">
              <ButtonGroup>
                <Button variant="success" size="sm" onClick={() => {
                  const exportData = [{
                    'Opening Stock (Purchase)': reportData.openingStock.byPurchase,
                    'Opening Stock (Sale)': reportData.openingStock.bySale,
                    'Total Purchases': reportData.totalPurchases,
                    'Total Sales': reportData.totalSales,
                    'Total Expenses': reportData.totalExpenses,
                    'Purchase Shipping': reportData.purchaseShipping,
                    'Sell Shipping': reportData.sellShipping,
                    'COGS': reportData.cogs,
                    'Gross Profit': reportData.grossProfit,
                    'Net Profit': reportData.netProfit
                  }];
                  exportToExcel(exportData, 'profit-loss-report.xlsx');
                }}>
                  <i className="mdi mdi-file-excel me-1"></i> Export Excel
                </Button>
                <Button variant="info" size="sm" onClick={() => {
                  const exportData = [{
                    'Opening Stock (Purchase)': reportData.openingStock.byPurchase,
                    'Opening Stock (Sale)': reportData.openingStock.bySale,
                    'Total Purchases': reportData.totalPurchases,
                    'Total Sales': reportData.totalSales,
                    'Total Expenses': reportData.totalExpenses,
                    'Purchase Shipping': reportData.purchaseShipping,
                    'Sell Shipping': reportData.sellShipping,
                    'COGS': reportData.cogs,
                    'Gross Profit': reportData.grossProfit,
                    'Net Profit': reportData.netProfit
                  }];
                  exportToCSV(exportData, 'profit-loss-report.csv');
                }}>
                  <i className="mdi mdi-file-delimited me-1"></i> Export CSV
                </Button>
              </ButtonGroup>
            </div>
            <h4 className="page-title">Profit / Loss Report</h4>
          </div>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body>
              <Row className="mb-3">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={3} className="d-flex align-items-end">
                  <Button variant="primary" className="me-2" onClick={handleFilter}>
                    <i className="mdi mdi-filter me-1"></i> Filter
                  </Button>
                  <Button variant="secondary" onClick={handleReset}>
                    <i className="mdi mdi-refresh me-1"></i> Reset
                  </Button>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <div className="mb-4">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Opening Stock:</span>
                      <strong>$ {reportData.openingStock.byPurchase.toFixed(2)}</strong>
                    </div>
                    <div className="text-muted small">By purchase price</div>

                    <div className="d-flex justify-content-between mb-2 mt-3">
                      <span>Opening Stock:</span>
                      <strong>$ {reportData.openingStock.bySale.toFixed(2)}</strong>
                    </div>
                    <div className="text-muted small">By sale price</div>

                    <div className="d-flex justify-content-between mb-2 mt-3">
                      <span className="text-primary">Total purchases:</span>
                      <strong className="text-primary">$ {reportData.totalPurchases.toFixed(2)}</strong>
                    </div>
                    <div className="text-muted small">(Inc. tax, discount)</div>

                    <div className="d-flex justify-content-between mb-2 mt-3">
                      <span className="text-primary">Total Stock Adjustment:</span>
                      <strong className="text-primary">$ {reportData.totalStockAdjustment.toFixed(2)}</strong>
                    </div>

                    <div className="d-flex justify-content-between mb-2 mt-3">
                      <span className="text-primary">Total Expense:</span>
                      <strong className="text-primary">$ {reportData.totalExpenses.toFixed(2)}</strong>
                    </div>

                    <div className="d-flex justify-content-between mb-2 mt-3">
                      <span className="text-primary">Total purchase shipping charge:</span>
                      <strong className="text-primary">$ {reportData.purchaseShipping.toFixed(2)}</strong>
                    </div>

                    <div className="d-flex justify-content-between mb-2 mt-3">
                      <span className="text-primary">Total Sell discount:</span>
                      <strong className="text-primary">$ {reportData.sellDiscount.toFixed(2)}</strong>
                    </div>

                    <div className="d-flex justify-content-between mb-2 mt-3">
                      <span className="text-primary">Total Sell Return:</span>
                      <strong className="text-primary">$ {reportData.sellReturn.toFixed(2)}</strong>
                    </div>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="mb-4">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Closing stock:</span>
                      <strong>$ {reportData.closingStock.byPurchase.toFixed(2)}</strong>
                    </div>
                    <div className="text-muted small">By purchase price</div>

                    <div className="d-flex justify-content-between mb-2 mt-3">
                      <span>Closing stock:</span>
                      <strong>$ {reportData.closingStock.bySale.toFixed(2)}</strong>
                    </div>
                    <div className="text-muted small">By sale price</div>

                    <div className="d-flex justify-content-between mb-2 mt-3">
                      <span className="text-success">Total Sales:</span>
                      <strong className="text-success">$ {reportData.totalSales.toFixed(2)}</strong>
                    </div>
                    <div className="text-muted small">(Inc. tax, discount)</div>

                    <div className="d-flex justify-content-between mb-2 mt-3">
                      <span className="text-success">Total sell shipping charge:</span>
                      <strong className="text-success">$ {reportData.sellShipping.toFixed(2)}</strong>
                    </div>

                    <div className="d-flex justify-content-between mb-2 mt-3">
                      <span className="text-success">Total Purchase Return:</span>
                      <strong className="text-success">$ {reportData.purchaseReturn.toFixed(2)}</strong>
                    </div>

                    <div className="d-flex justify-content-between mb-2 mt-3">
                      <span className="text-success">Total Purchase Discount:</span>
                      <strong className="text-success">$ {reportData.purchaseDiscount.toFixed(2)}</strong>
                    </div>
                  </div>
                </Col>
              </Row>

              <Row className="mt-4">
                <Col md={12}>
                  <div className="bg-light p-3">
                    <div className="mb-2">
                      <strong>COGS: $ {reportData.cogs.toFixed(2)}</strong>
                    </div>
                    <div className="text-muted small mb-3">
                      Cost of Goods Sold = Opening Stock + Purchases + Purchase Shipping - Closing Stock
                    </div>

                    <div className="mb-2">
                      <strong>Gross Profit: $ {reportData.grossProfit.toFixed(2)}</strong>
                    </div>
                    <div className="text-muted small mb-3">
                      Total Sales - COGS
                    </div>

                    <div className="mb-2">
                      <strong className={reportData.netProfit >= 0 ? 'text-success' : 'text-danger'}>
                        Net Profit: $ {reportData.netProfit.toFixed(2)}
                      </strong>
                    </div>
                    <div className="text-muted small">
                      Gross Profit - Expenses - Sell Discount - Stock Adjustment + Purchase Discount + Sell Shipping
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body>
              <Nav variant="tabs" className="mb-3">
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'products'} 
                    onClick={() => setActiveTab('products')}
                  >
                    <i className="mdi mdi-package-variant me-1"></i> Profit by products
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'categories'} 
                    onClick={() => setActiveTab('categories')}
                  >
                    <i className="mdi mdi-tag me-1"></i> Profit by categories
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'brands'} 
                    onClick={() => setActiveTab('brands')}
                  >
                    Profit by brands
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'locations'} 
                    onClick={() => setActiveTab('locations')}
                  >
                    <i className="mdi mdi-map-marker me-1"></i> Profit by locations
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'invoice'} 
                    onClick={() => setActiveTab('invoice')}
                  >
                    <i className="mdi mdi-file-document me-1"></i> Profit by invoice
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'date'} 
                    onClick={() => setActiveTab('date')}
                  >
                    <i className="mdi mdi-calendar me-1"></i> Profit by date
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'customer'} 
                    onClick={() => setActiveTab('customer')}
                  >
                    <i className="mdi mdi-account me-1"></i> Profit by customer
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'day'} 
                    onClick={() => setActiveTab('day')}
                  >
                    <i className="mdi mdi-calendar-today me-1"></i> Profit by day
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'service-staff'} 
                    onClick={() => setActiveTab('service-staff')}
                  >
                    <i className="mdi mdi-account-tie me-1"></i> Profit by service staff
                  </Nav.Link>
                </Nav.Item>
              </Nav>

              <div className="mb-3">
                <span className="me-2">Show:</span>
                <select 
                  className="form-select form-select-sm d-inline-block" 
                  style={{ width: 'auto' }}
                  name="showEntries"
                  value={formData.showEntries}
                  onChange={handleInputChange}
                >
                  <option>25</option>
                  <option>50</option>
                  <option>100</option>
                </select>
                <span className="ms-2 me-3">entries</span>
              </div>

              <div className="table-responsive">
                <Table className="table-centered table-nowrap mb-0" striped bordered hover>
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Product</th>
                      <th>SKU</th>
                      {activeTab === 'products' && <th>Category</th>}
                      {activeTab === 'products' && <th>Brand</th>}
                      <th>Units Sold</th>
                      <th>Revenue</th>
                      <th>Cost</th>
                      <th>Gross Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profitBreakdown.length === 0 ? (
                      <tr>
                        <td colSpan={activeTab === 'products' ? '9' : '7'} className="text-center text-muted py-4">
                          No data available
                        </td>
                      </tr>
                    ) : (
                      profitBreakdown.slice(0, parseInt(formData.showEntries)).map((item, index) => (
                        <tr key={item.id}>
                          <td>{index + 1}</td>
                          <td>{item.name}</td>
                          <td>{item.sku}</td>
                          {activeTab === 'products' && <td>{item.category || '-'}</td>}
                          {activeTab === 'products' && <td>{item.brand || '-'}</td>}
                          <td className="text-center">{item.totalSold}</td>
                          <td className="text-end">$ {item.totalRevenue.toFixed(2)}</td>
                          <td className="text-end">$ {item.totalCost.toFixed(2)}</td>
                          <td className={`text-end ${item.grossProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                            $ {item.grossProfit.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <th colSpan={activeTab === 'products' ? '6' : '4'} className="text-end">Total:</th>
                      <th className="text-end">
                        $ {profitBreakdown.reduce((sum, item) => sum + item.totalRevenue, 0).toFixed(2)}
                      </th>
                      <th className="text-end">
                        $ {profitBreakdown.reduce((sum, item) => sum + item.totalCost, 0).toFixed(2)}
                      </th>
                      <th className="text-end">
                        $ {profitBreakdown.reduce((sum, item) => sum + item.grossProfit, 0).toFixed(2)}
                      </th>
                    </tr>
                  </tfoot>
                </Table>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="text-muted">
                  Showing {profitBreakdown.length > 0 ? 1 : 0} to {Math.min(parseInt(formData.showEntries), profitBreakdown.length)} of {profitBreakdown.length} entries
                </div>
              </div>

              <div className="mt-3 text-muted small">
                <strong>Note:</strong> Profit calculations are based on purchase price vs selling price. Stock adjustments and returns are factored into the overall profit/loss summary above.
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ProfitLossReportPage;
