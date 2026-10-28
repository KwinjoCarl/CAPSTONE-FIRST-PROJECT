import { Card, Col, Row, Button, Table, Form, Dropdown, Modal, Badge, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getProducts, deleteProduct } from '@/services/api';

const ListProductsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load products from API
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getProducts();
      setProducts(response.data);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products. Please make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const stock = product.current_stock || 0;
    const alertQty = product.alert_quantity || 10;
    
    if (filterType === 'low-stock') {
      return matchesSearch && stock > 0 && stock <= alertQty;
    } else if (filterType === 'out-of-stock') {
      return matchesSearch && stock === 0;
    }
    
    return matchesSearch;
  });

  const lowStockCount = products.filter(p => {
    const stock = p.current_stock || 0;
    const alertQty = p.alert_quantity || 10;
    return stock > 0 && stock <= alertQty;
  }).length;

  const outOfStockCount = products.filter(p => (p.current_stock || 0) === 0).length;

  const getStockStatus = (product) => {
    const stock = product.current_stock || 0;
    const alertQty = product.alert_quantity || 10;
    
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

  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      try {
        await deleteProduct(productToDelete.id);
        // Reload products after successful delete
        await loadProducts();
        setShowDeleteModal(false);
        setProductToDelete(null);
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading products...</p>
      </div>
    );
  }

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
            <h4 className="page-title">Products</h4>
          </div>
        </Col>
      </Row>

      {error && (
        <Row>
          <Col xs={12}>
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              <i className="mdi mdi-alert-circle me-2"></i>
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Stock Status Cards */}
      <Row className="mb-3">
        <Col md={4}>
          <Card className="bg-success text-white">
            <Card.Body className="py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white mb-0">In Stock</h6>
                  <h3 className="text-white mb-0">{products.length - lowStockCount - outOfStockCount}</h3>
                </div>
                <i className="mdi mdi-check-circle" style={{ fontSize: '3rem', opacity: 0.5 }}></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="bg-warning text-white">
            <Card.Body className="py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white mb-0">Low Stock</h6>
                  <h3 className="text-white mb-0">{lowStockCount}</h3>
                </div>
                <i className="mdi mdi-alert-circle" style={{ fontSize: '3rem', opacity: 0.5 }}></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="bg-danger text-white">
            <Card.Body className="py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white mb-0">Out of Stock</h6>
                  <h3 className="text-white mb-0">{outOfStockCount}</h3>
                </div>
                <i className="mdi mdi-close-circle" style={{ fontSize: '3rem', opacity: 0.5 }}></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Control
                    type="text"
                    placeholder="Search by product name or SKU..."
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </Col>
                <Col md={6}>
                  <div className="btn-group" role="group">
                    <Button
                      variant={filterType === 'all' ? 'primary' : 'outline-primary'}
                      onClick={() => setFilterType('all')}
                    >
                      All Products
                    </Button>
                    <Button
                      variant={filterType === 'low-stock' ? 'warning' : 'outline-warning'}
                      onClick={() => setFilterType('low-stock')}
                    >
                      Low Stock
                    </Button>
                    <Button
                      variant={filterType === 'out-of-stock' ? 'danger' : 'outline-danger'}
                      onClick={() => setFilterType('out-of-stock')}
                    >
                      Out of Stock
                    </Button>
                  </div>
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
                      <th>Purchase Price</th>
                      <th>Selling Price</th>
                      <th>Current Stock</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="text-center text-muted py-4">
                          {searchTerm ? 'No products found matching your search' : 'No products available. Click "Add" to create one.'}
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product, index) => {
                        const status = getStockStatus(product);
                        return (
                          <tr key={product.id}>
                            <td>{index + 1}</td>
                            <td>{product.name}</td>
                            <td>{product.sku}</td>
                            <td>{product.category || '-'}</td>
                            <td>{product.brand || '-'}</td>
                            <td>$ {parseFloat(product.purchase_price || 0).toFixed(2)}</td>
                            <td>$ {parseFloat(product.selling_price || 0).toFixed(2)}</td>
                            <td className="text-center">
                              <strong>{product.current_stock || 0}</strong>
                            </td>
                            <td>
                              <Badge bg={status.variant}>
                                <i className={`mdi ${status.icon} me-1`}></i>
                                {status.label}
                              </Badge>
                            </td>
                            <td>
                              <Dropdown>
                                <Dropdown.Toggle variant="light" size="sm">
                                  <i className="mdi mdi-dots-vertical"></i>
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  <Dropdown.Item onClick={() => navigate(`/products/edit/${product.id}`)}>
                                    <i className="mdi mdi-pencil me-2"></i> Edit
                                  </Dropdown.Item>
                                  <Dropdown.Item onClick={() => handleDeleteClick(product)} className="text-danger">
                                    <i className="mdi mdi-delete me-2"></i> Delete
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </Table>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="text-muted">
                  Showing {filteredProducts.length} of {products.length} products
                </div>
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
          Are you sure you want to delete <strong>{productToDelete?.name}</strong>?
          <br />
          <small className="text-muted">This action cannot be undone.</small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleDeleteCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            <i className="mdi mdi-delete me-1"></i> Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ListProductsPage;
