import { Card, Col, Row, Button, Table, Form, Dropdown, Modal, Badge, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const ListProductsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [filterType, setFilterType] = useState('all'); // all, low-stock, out-of-stock

  const [products, setProducts] = useState([]);

  // Load products from localStorage on component mount
  useEffect(() => {
    const loadProducts = () => {
      const storedProducts = JSON.parse(localStorage.getItem('bms_products') || '[]');
      setProducts(storedProducts);
    };

    loadProducts();

    // Listen for storage changes
    window.addEventListener('storage', loadProducts);
    return () => window.removeEventListener('storage', loadProducts);
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const stock = product.currentStock || 0;
    const alertQty = product.alertQuantity || 10;
    
    if (filterType === 'low-stock') {
      return matchesSearch && stock > 0 && stock <= alertQty;
    } else if (filterType === 'out-of-stock') {
      return matchesSearch && stock === 0;
    }
    
    return matchesSearch;
  });

  const lowStockCount = products.filter(p => {
    const stock = p.currentStock || 0;
    const alertQty = p.alertQuantity || 10;
    return stock > 0 && stock <= alertQty;
  }).length;

  const outOfStockCount = products.filter(p => (p.currentStock || 0) === 0).length;

  const getStockStatus = (product) => {
    const stock = product.currentStock || 0;
    const alertQty = product.alertQuantity || 10;
    
    if (stock === 0) {
      return { label: 'Out of Stock', variant: 'danger', icon: 'mdi-close-circle' };
    } else if (stock <= alertQty) {
      return { label: 'Low Stock', variant: 'warning', icon: 'mdi-alert-circle' };
    } else {
      return { label: 'In Stock', variant: 'success', icon: 'mdi-check-circle' };
    }
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (productToDelete) {
      const updatedProducts = products.filter(p => p.id !== productToDelete.id);
      setProducts(updatedProducts);
      localStorage.setItem('bms_products', JSON.stringify(updatedProducts));
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <div className="page-title-right">
              <Button variant="primary" onClick={() => navigate('/products/add')}>
                <i className="mdi mdi-plus me-1"></i> Add
              </Button>
              <Button variant="success" className="ms-2">
                <i className="mdi mdi-download me-1"></i> Download Excel
              </Button>
            </div>
            <h4 className="page-title">Products <span className="text-muted">Manage your products</span></h4>
          </div>
        </Col>
      </Row>

      {/* Stock Alert Banner */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <Row>
          <Col xs={12}>
            <Alert variant="warning" className="d-flex align-items-center justify-content-between">
              <div>
                <i className="mdi mdi-alert-circle-outline me-2 fs-4"></i>
                <strong>Inventory Alert:</strong>
                {outOfStockCount > 0 && (
                  <span className="ms-2">
                    <Badge bg="danger">{outOfStockCount}</Badge> items out of stock
                  </span>
                )}
                {lowStockCount > 0 && (
                  <span className="ms-2">
                    <Badge bg="warning">{lowStockCount}</Badge> items low on stock
                  </span>
                )}
              </div>
              <div>
                <Button 
                  variant="outline-warning" 
                  size="sm" 
                  className="me-2"
                  onClick={() => setFilterType('low-stock')}
                >
                  View Low Stock
                </Button>
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => setFilterType('out-of-stock')}
                >
                  View Out of Stock
                </Button>
              </div>
            </Alert>
          </Col>
        </Row>
      )}

      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-0" style={{ maxWidth: '400px' }}>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="mdi mdi-magnify"></i>
                      </span>
                      <Form.Control
                        type="text"
                        placeholder="Search by Product name or SKU..."
                        value={searchTerm}
                        onChange={handleSearch}
                      />
                    </div>
                  </Form.Group>
                </Col>
                <Col md={6} className="text-end">
                  <Button 
                    variant={filterType === 'all' ? 'primary' : 'outline-primary'} 
                    size="sm" 
                    className="me-2"
                    onClick={() => setFilterType('all')}
                  >
                    All Products ({products.length})
                  </Button>
                  <Button 
                    variant={filterType === 'low-stock' ? 'warning' : 'outline-warning'} 
                    size="sm" 
                    className="me-2"
                    onClick={() => setFilterType('low-stock')}
                  >
                    Low Stock ({lowStockCount})
                  </Button>
                  <Button 
                    variant={filterType === 'out-of-stock' ? 'danger' : 'outline-danger'} 
                    size="sm"
                    onClick={() => setFilterType('out-of-stock')}
                  >
                    Out of Stock ({outOfStockCount})
                  </Button>
                </Col>
              </Row>

              <div className="table-responsive">
                <Table className="table-centered table-nowrap mb-0">
                  <thead className="table-light">
                    <tr>
                      <th><input type="checkbox" /></th>
                      <th>Product Image</th>
                      <th>Action</th>
                      <th>Product</th>
                      <th>Unit Purchase Price</th>
                      <th>Selling Price</th>
                      <th>Current stock</th>
                      <th>Product type</th>
                      <th>Category</th>
                      <th>Brand</th>
                      <th>Tax</th>
                      <th>SKU</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => {
                        const stockStatus = getStockStatus(product);
                        const rowClass = stockStatus.variant === 'danger' ? 'table-danger' : 
                                        stockStatus.variant === 'warning' ? 'table-warning' : '';
                        
                        return (
                          <tr key={product.id} className={rowClass}>
                            <td><input type="checkbox" /></td>
                            <td>
                              {product.image ? (
                                <img src={product.image} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                              ) : (
                                <div style={{ width: '40px', height: '40px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <i className="mdi mdi-image"></i>
                                </div>
                              )}
                            </td>
                            <td>
                              <Dropdown>
                                <Dropdown.Toggle variant="primary" size="sm">
                                  Actions
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  <Dropdown.Item onClick={() => navigate(`/products/edit/${product.id}`)}>
                                    <i className="mdi mdi-pencil me-2"></i>
                                    Edit/View
                                  </Dropdown.Item>
                                  <Dropdown.Item onClick={() => handleDeleteClick(product)} className="text-danger">
                                    <i className="mdi mdi-delete me-2"></i>
                                    Delete
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </td>
                            <td>
                              {product.name}
                              {stockStatus.variant !== 'success' && (
                                <div className="mt-1">
                                  <Badge bg={stockStatus.variant} className="badge-sm">
                                    <i className={`mdi ${stockStatus.icon} me-1`}></i>
                                    {stockStatus.label}
                                  </Badge>
                                </div>
                              )}
                            </td>
                            <td>$ {product.purchasePrice.toFixed(2)}</td>
                            <td>$ {product.sellingPrice.toFixed(2)}</td>
                            <td>
                              <span className={
                                stockStatus.variant === 'danger' ? 'text-danger fw-bold' :
                                stockStatus.variant === 'warning' ? 'text-warning fw-bold' :
                                'text-success fw-bold'
                              }>
                                {product.currentStock || 0} {product.unit}
                              </span>
                              {product.alertQuantity && (
                                <div className="text-muted small">
                                  Alert: {product.alertQuantity}
                                </div>
                              )}
                            </td>
                            <td>{product.productType}</td>
                            <td>{product.category || '-'}</td>
                            <td>{product.brand || '-'}</td>
                            <td>{product.tax || '-'}</td>
                            <td>{product.sku}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="12" className="text-center text-muted py-4">
                          {filterType === 'all' ? 'No products found' :
                           filterType === 'low-stock' ? 'No low stock items' :
                           'No out of stock items'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
              <div className="mt-3 text-muted">
                Showing {filteredProducts.length} of {products.length} entries
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleDeleteCancel} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this product?</p>
          {productToDelete && (
            <div className="alert alert-warning">
              <strong>Product:</strong> {productToDelete.name}<br />
              <strong>SKU:</strong> {productToDelete.sku}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleDeleteCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ListProductsPage;
