import { Card, Col, Row, Table, Form, Button, Badge, ButtonGroup } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { exportToCSV, exportToExcel } from '@/utils/exportUtils';

const ProductStockReportPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterStockStatus, setFilterStockStatus] = useState('');
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    loadProducts();
    loadFilters();
  }, []);

  const loadProducts = () => {
    const storedProducts = JSON.parse(localStorage.getItem('bms_products') || '[]');
    
    const productsWithStatus = storedProducts.map(product => {
      const currentStock = product.currentStock || 0;
      const alertQuantity = product.alertQuantity || 0;
      
      let stockStatus = 'In Stock';
      let statusColor = 'success';
      
      if (currentStock === 0) {
        stockStatus = 'Out of Stock';
        statusColor = 'danger';
      } else if (currentStock <= alertQuantity) {
        stockStatus = 'Low Stock';
        statusColor = 'warning';
      }
      
      // Calculate potential profit if all stock is sold
      const potentialRevenue = currentStock * (product.sellingPrice || 0);
      const potentialProfit = potentialRevenue - (currentStock * (product.purchasePrice || 0));
      const profitMargin = product.sellingPrice > 0 ? 
        (((product.sellingPrice - product.purchasePrice) / product.sellingPrice) * 100) : 0;
      
      return {
        ...product,
        stockStatus,
        statusColor,
        stockValue: currentStock * (product.purchasePrice || 0),
        potentialRevenue,
        potentialProfit,
        profitMargin
      };
    });
    
    setProducts(productsWithStatus);
    setFilteredProducts(productsWithStatus);
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

    if (filterStockStatus) {
      filtered = filtered.filter(p => p.stockStatus === filterStockStatus);
    }

    setFilteredProducts(filtered);
  };

  const handleReset = () => {
    setFilterCategory('');
    setFilterBrand('');
    setFilterStockStatus('');
    setFilteredProducts(products);
  };

  const totalStock = filteredProducts.reduce((sum, p) => sum + (p.currentStock || 0), 0);
  const totalValue = filteredProducts.reduce((sum, p) => sum + p.stockValue, 0);
  const totalPotentialProfit = filteredProducts.reduce((sum, p) => sum + p.potentialProfit, 0);
  const outOfStock = filteredProducts.filter(p => p.stockStatus === 'Out of Stock').length;
  const lowStock = filteredProducts.filter(p => p.stockStatus === 'Low Stock').length;

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <div className="page-title-right">
              <ButtonGroup>
                <Button variant="success" size="sm" onClick={() => {
                  const exportData = filteredProducts.map(p => ({
                    'Product Name': p.name,
                    'SKU': p.sku,
                    'Category': p.category || '-',
                    'Brand': p.brand || '-',
                    'Unit': p.unit,
                    'Current Stock': p.currentStock || 0,
                    'Alert Quantity': p.alertQuantity || 0,
                    'Unit Price': p.purchasePrice || 0,
                    'Stock Value': p.stockValue,
                    'Status': p.stockStatus
                  }));
                  exportToExcel(exportData, 'product-stock-report.xlsx');
                }}>
                  <i className="mdi mdi-file-excel me-1"></i> Export Excel
                </Button>
                <Button variant="info" size="sm" onClick={() => {
                  const exportData = filteredProducts.map(p => ({
                    'Product Name': p.name,
                    'SKU': p.sku,
                    'Category': p.category || '-',
                    'Brand': p.brand || '-',
                    'Unit': p.unit,
                    'Current Stock': p.currentStock || 0,
                    'Alert Quantity': p.alertQuantity || 0,
                    'Unit Price': p.purchasePrice || 0,
                    'Stock Value': p.stockValue,
                    'Status': p.stockStatus
                  }));
                  exportToCSV(exportData, 'product-stock-report.csv');
                }}>
                  <i className="mdi mdi-file-delimited me-1"></i> Export CSV
                </Button>
              </ButtonGroup>
            </div>
            <h4 className="page-title">Product Stock Report</h4>
          </div>
        </Col>
      </Row>

      {/* Summary Cards */}
      <Row className="mb-3">
        <Col md={3}>
          <Card className="bg-primary text-white">
            <Card.Body>
              <h6 className="text-white">Total Products</h6>
              <h3 className="text-white mb-0">{filteredProducts.length}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-success text-white">
            <Card.Body>
              <h6 className="text-white">Total Stock Quantity</h6>
              <h3 className="text-white mb-0">{totalStock}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-warning text-white">
            <Card.Body>
              <h6 className="text-white">Low Stock Items</h6>
              <h3 className="text-white mb-0">{lowStock}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-danger text-white">
            <Card.Body>
              <h6 className="text-white">Out of Stock</h6>
              <h3 className="text-white mb-0">{outOfStock}</h3>
            </Card.Body>
          </Card>
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
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Stock Status</Form.Label>
                    <Form.Select
                      value={filterStockStatus}
                      onChange={(e) => setFilterStockStatus(e.target.value)}
                    >
                      <option value="">All Status</option>
                      <option value="In Stock">In Stock</option>
                      <option value="Low Stock">Low Stock</option>
                      <option value="Out of Stock">Out of Stock</option>
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
                      <th>Unit</th>
                      <th>Current Stock</th>
                      <th>Alert Quantity</th>
                      <th>Purchase Price</th>
                      <th>Selling Price</th>
                      <th>Stock Value</th>
                      <th>Potential Profit</th>
                      <th>Margin %</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan="14" className="text-center text-muted py-4">
                          No products available
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product, index) => (
                        <tr key={product.id}>
                          <td>{index + 1}</td>
                          <td>{product.name}</td>
                          <td>{product.sku}</td>
                          <td>{product.category || '-'}</td>
                          <td>{product.brand || '-'}</td>
                          <td>{product.unit}</td>
                          <td className="text-center">
                            <strong>{product.currentStock || 0}</strong>
                          </td>
                          <td className="text-center">{product.alertQuantity || 0}</td>
                          <td className="text-end">$ {(product.purchasePrice || 0).toFixed(2)}</td>
                          <td className="text-end">$ {(product.sellingPrice || 0).toFixed(2)}</td>
                          <td className="text-end">$ {product.stockValue.toFixed(2)}</td>
                          <td className={`text-end ${product.potentialProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                            $ {product.potentialProfit.toFixed(2)}
                          </td>
                          <td className="text-end">{product.profitMargin.toFixed(1)}%</td>
                          <td>
                            <Badge bg={product.statusColor}>
                              {product.stockStatus}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <th colSpan="6" className="text-end">Total:</th>
                      <th className="text-center">{totalStock}</th>
                      <th colSpan="3"></th>
                      <th className="text-end">$ {totalValue.toFixed(2)}</th>
                      <th className="text-end text-success">$ {totalPotentialProfit.toFixed(2)}</th>
                      <th colSpan="2"></th>
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

export default ProductStockReportPage;
