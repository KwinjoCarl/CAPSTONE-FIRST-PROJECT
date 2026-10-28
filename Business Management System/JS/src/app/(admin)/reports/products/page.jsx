import { Card, Col, Row, Table, Form, Button, ButtonGroup } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { exportToCSV, exportToExcel, formatDataForExport } from '@/utils/exportUtils';

const ProductsReportPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    loadProducts();
    loadFilters();
  }, []);

  const loadProducts = () => {
    const storedProducts = JSON.parse(localStorage.getItem('bms_products') || '[]');
    const sales = JSON.parse(localStorage.getItem('bms_sales') || '[]');
    const purchases = JSON.parse(localStorage.getItem('bms_purchases') || '[]');

    // Calculate sold and purchased quantities with detailed breakdown
    const productStats = storedProducts.map(product => {
      let totalSold = 0;
      let totalPurchased = 0;
      let revenue = 0;
      let purchaseCost = 0;
      let profit = 0;

      // Calculate sold quantity and revenue
      sales.forEach(sale => {
        sale.items?.forEach(item => {
          if (item.id === product.id || item.name === product.name) {
            const quantity = item.quantity || 0;
            const itemRevenue = item.subtotal || 0;
            totalSold += quantity;
            revenue += itemRevenue;
            
            // Calculate cost based on purchase price
            const itemCost = quantity * (product.purchasePrice || 0);
            purchaseCost += itemCost;
          }
        });
      });

      // Calculate purchased quantity and total purchase cost
      purchases.forEach(purchase => {
        purchase.items?.forEach(item => {
          if (item.id === product.id || item.name === product.name) {
            totalPurchased += item.quantity || 0;
          }
        });
      });

      // Calculate profit (revenue - cost)
      profit = revenue - purchaseCost;

      // Calculate profit margin percentage
      const profitMargin = revenue > 0 ? ((profit / revenue) * 100) : 0;

      return {
        ...product,
        totalSold,
        totalPurchased,
        revenue,
        purchaseCost,
        profit,
        profitMargin,
        currentStock: product.currentStock || 0,
        variations: product.variations || []
      };
    });

    setProducts(productStats);
    setFilteredProducts(productStats);
  };

  const loadFilters = () => {
    const storedProducts = JSON.parse(localStorage.getItem('bms_products') || '[]');
    const uniqueCategories = [...new Set(storedProducts.map(p => p.category).filter(Boolean))];
    const uniqueBrands = [...new Set(storedProducts.map(p => p.brand).filter(Boolean))];
    setCategories(uniqueCategories);
    setBrands(uniqueBrands);
  };

  const handleFilter = () => {
    let filtered = [...products];

    if (filterCategory) {
      filtered = filtered.filter(p => p.category === filterCategory);
    }

    if (filterBrand) {
      filtered = filtered.filter(p => p.brand === filterBrand);
    }

    setFilteredProducts(filtered);
  };

  const handleReset = () => {
    setFilterCategory('');
    setFilterBrand('');
    setFilteredProducts(products);
  };

  const totalRevenue = filteredProducts.reduce((sum, p) => sum + p.revenue, 0);
  const totalSold = filteredProducts.reduce((sum, p) => sum + p.totalSold, 0);
  const totalStock = filteredProducts.reduce((sum, p) => sum + p.currentStock, 0);

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <div className="page-title-right">
              <ButtonGroup>
                <Button 
                  variant="success" 
                  size="sm"
                  onClick={() => {
                    const exportData = formatDataForExport(filteredProducts, {
                      name: 'Product Name',
                      sku: 'SKU',
                      category: 'Category',
                      brand: 'Brand',
                      currentStock: 'Current Stock',
                      totalSold: 'Total Sold',
                      totalPurchased: 'Total Purchased',
                      revenue: 'Revenue'
                    });
                    exportToExcel(exportData, 'products-report.xlsx');
                  }}
                >
                  <i className="mdi mdi-file-excel me-1"></i> Export Excel
                </Button>
                <Button 
                  variant="info" 
                  size="sm"
                  onClick={() => {
                    const exportData = formatDataForExport(filteredProducts, {
                      name: 'Product Name',
                      sku: 'SKU',
                      category: 'Category',
                      brand: 'Brand',
                      currentStock: 'Current Stock',
                      totalSold: 'Total Sold',
                      totalPurchased: 'Total Purchased',
                      revenue: 'Revenue'
                    });
                    exportToCSV(exportData, 'products-report.csv');
                  }}
                >
                  <i className="mdi mdi-file-delimited me-1"></i> Export CSV
                </Button>
              </ButtonGroup>
            </div>
            <h4 className="page-title">Products Report</h4>
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
                    <Form.Label>Category</Form.Label>
                    <Form.Select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                    >
                      <option value="">All Categories</option>
                      {categories.map((cat, idx) => (
                        <option key={idx} value={cat}>{cat}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Brand</Form.Label>
                    <Form.Select
                      value={filterBrand}
                      onChange={(e) => setFilterBrand(e.target.value)}
                    >
                      <option value="">All Brands</option>
                      {brands.map((brand, idx) => (
                        <option key={idx} value={brand}>{brand}</option>
                      ))}
                    </Form.Select>
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

              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Product Name</th>
                      <th>SKU</th>
                      <th>Category</th>
                      <th>Brand</th>
                      <th>Current Stock</th>
                      <th>Total Purchased</th>
                      <th>Total Sold</th>
                      <th>Purchase Cost</th>
                      <th>Revenue</th>
                      <th>Profit</th>
                      <th>Margin %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan="12" className="text-center text-muted py-4">
                          No products available
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product, index) => (
                        <tr key={product.id}>
                          <td>{index + 1}</td>
                          <td>
                            {product.name}
                            {product.variations && product.variations.length > 0 && (
                              <div className="text-muted small">
                                {product.variations.length} variation(s)
                              </div>
                            )}
                          </td>
                          <td>{product.sku}</td>
                          <td>{product.category || '-'}</td>
                          <td>{product.brand || '-'}</td>
                          <td className="text-center">{product.currentStock}</td>
                          <td className="text-center">{product.totalPurchased}</td>
                          <td className="text-center">{product.totalSold}</td>
                          <td className="text-end">$ {product.purchaseCost.toFixed(2)}</td>
                          <td className="text-end">$ {product.revenue.toFixed(2)}</td>
                          <td className={`text-end ${product.profit >= 0 ? 'text-success' : 'text-danger'}`}>
                            $ {product.profit.toFixed(2)}
                          </td>
                          <td className="text-end">
                            {product.profitMargin.toFixed(1)}%
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <th colSpan="5" className="text-end">Total:</th>
                      <th className="text-center">{totalStock}</th>
                      <th></th>
                      <th className="text-center">{totalSold}</th>
                      <th className="text-end">
                        $ {filteredProducts.reduce((sum, p) => sum + p.purchaseCost, 0).toFixed(2)}
                      </th>
                      <th className="text-end">$ {totalRevenue.toFixed(2)}</th>
                      <th className="text-end">
                        $ {filteredProducts.reduce((sum, p) => sum + p.profit, 0).toFixed(2)}
                      </th>
                      <th></th>
                    </tr>
                  </tfoot>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ProductsReportPage;
