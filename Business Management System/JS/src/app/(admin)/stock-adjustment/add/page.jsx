import { Card, Col, Row, Button, Form, Table, Modal, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getLocations } from '@/helpers/settings';

const AddStockAdjustmentPage = () => {
  const navigate = useNavigate();
  const [availableProducts, setAvailableProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    businessLocation: 'Main Store',
    referenceNo: '',
    date: new Date().toISOString().split('T')[0],
    adjustmentType: 'normal',
    reason: '',
    notes: ''
  });

  const [adjustmentItems, setAdjustmentItems] = useState([]);

  // Reason codes for stock adjustments
  const reasonCodes = {
    damaged: 'Damaged Goods',
    expired: 'Expired Products',
    theft: 'Theft/Loss',
    correction: 'Stock Count Correction',
    returned: 'Customer Return',
    supplier_return: 'Supplier Return',
    other: 'Other'
  };

  useEffect(() => {
    // Load products from localStorage
    const storedProducts = JSON.parse(localStorage.getItem('bms_products') || '[]');
    setAvailableProducts(storedProducts);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSearchProducts = () => {
    setShowProductModal(true);
  };

  const filteredProducts = availableProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = (product) => {
    // Check if product already exists
    const existingItem = adjustmentItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      toast.warning('Product already added to adjustment');
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      currentStock: product.currentStock || 0,
      adjustmentQuantity: 0,
      adjustmentType: 'increase', // increase or decrease
      newStock: product.currentStock || 0,
      unitCost: product.purchasePrice || 0,
      totalCost: 0,
      reason: ''
    };

    setAdjustmentItems([...adjustmentItems, newItem]);
    setShowProductModal(false);
    setSearchTerm('');
    toast.success('Product added to adjustment');
  };

  const handleItemChange = (itemId, field, value) => {
    setAdjustmentItems(adjustmentItems.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate new stock and total cost
        if (field === 'adjustmentQuantity' || field === 'adjustmentType') {
          const qty = parseFloat(updatedItem.adjustmentQuantity) || 0;
          
          if (updatedItem.adjustmentType === 'increase') {
            updatedItem.newStock = updatedItem.currentStock + qty;
            updatedItem.totalCost = qty * updatedItem.unitCost;
          } else {
            updatedItem.newStock = updatedItem.currentStock - qty;
            updatedItem.totalCost = -(qty * updatedItem.unitCost);
          }
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const handleRemoveItem = (itemId) => {
    setAdjustmentItems(adjustmentItems.filter(item => item.id !== itemId));
    toast.info('Product removed from adjustment');
  };

  const calculateTotals = () => {
    const totalCost = adjustmentItems.reduce((sum, item) => sum + item.totalCost, 0);
    const totalItems = adjustmentItems.length;
    
    return { totalCost, totalItems };
  };

  const totals = calculateTotals();

  const updateInventory = (items) => {
    // Get current products
    const products = JSON.parse(localStorage.getItem('bms_products') || '[]');
    
    // Update stock levels
    const updatedProducts = products.map(product => {
      const adjustedItem = items.find(item => item.productId === product.id);
      if (adjustedItem) {
        return {
          ...product,
          currentStock: adjustedItem.newStock
        };
      }
      return product;
    });
    
    // Save updated products
    localStorage.setItem('bms_products', JSON.stringify(updatedProducts));
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    // Validate
    if (adjustmentItems.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    // Check if all items have reasons
    const missingReason = adjustmentItems.find(item => !item.reason);
    if (missingReason) {
      toast.error('Please select a reason for all items');
      return;
    }

    // Create adjustment object
    const newAdjustment = {
      id: Date.now().toString(),
      referenceNo: formData.referenceNo || `ADJ-${Date.now()}`,
      date: formData.date,
      businessLocation: formData.businessLocation,
      adjustmentType: formData.adjustmentType,
      reason: formData.reason,
      notes: formData.notes,
      items: adjustmentItems,
      totalItems: totals.totalItems,
      totalCost: totals.totalCost,
      createdAt: new Date().toISOString(),
      createdBy: 'Admin', // TODO: Get from logged-in user
      status: 'Completed'
    };

    // Get existing adjustments
    const existingAdjustments = JSON.parse(localStorage.getItem('bms_stock_adjustments') || '[]');
    
    // Add new adjustment
    existingAdjustments.push(newAdjustment);
    
    // Save to localStorage
    localStorage.setItem('bms_stock_adjustments', JSON.stringify(existingAdjustments));
    
    // Update inventory levels
    updateInventory(adjustmentItems);
    
    // Create audit log entry
    const auditLog = {
      id: Date.now().toString(),
      type: 'stock_adjustment',
      action: 'create',
      referenceNo: newAdjustment.referenceNo,
      details: `Stock adjustment created with ${totals.totalItems} items`,
      timestamp: new Date().toISOString(),
      user: 'Admin'
    };
    
    const auditLogs = JSON.parse(localStorage.getItem('bms_audit_logs') || '[]');
    auditLogs.push(auditLog);
    localStorage.setItem('bms_audit_logs', JSON.stringify(auditLogs));
    
    toast.success('Stock adjustment saved successfully!');
    navigate('/stock-adjustment/list');
  };

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <h4 className="page-title">
              Add Stock Adjustment
              <i className="mdi mdi-keyboard-backspace ms-2" style={{ cursor: 'pointer' }} onClick={() => navigate('/stock-adjustment/list')}></i>
            </h4>
          </div>
        </Col>
      </Row>

      <Form onSubmit={handleSave}>
        <Row>
          <Col xs={12}>
            <Card>
              <Card.Body>
                <h5 className="mb-3">Adjustment Details</h5>
                <Row>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Business Location:</Form.Label>
                      <Form.Select
                        name="businessLocation"
                        value={formData.businessLocation}
                        onChange={handleInputChange}
                      >
                        {getLocations().map((loc) => (
                          <option key={loc.id} value={loc.name}>{loc.name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Reference No.:</Form.Label>
                      <Form.Control
                        type="text"
                        name="referenceNo"
                        placeholder="Auto-generated if blank"
                        value={formData.referenceNo}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Date: <span className="text-danger">*</span></Form.Label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="mdi mdi-calendar"></i></span>
                        <Form.Control
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Adjustment Type:</Form.Label>
                      <Form.Select 
                        name="adjustmentType" 
                        value={formData.adjustmentType} 
                        onChange={handleInputChange}
                      >
                        <option value="normal">Normal</option>
                        <option value="abnormal">Abnormal</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Notes:</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Additional notes about this adjustment..."
                      />
                    </Form.Group>
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
                <h5 className="mb-3">Products to Adjust</h5>
                <div className="mb-3">
                  <Button variant="primary" size="sm" onClick={handleSearchProducts}>
                    <i className="mdi mdi-magnify me-1"></i> Search Products
                  </Button>
                </div>

                <div className="table-responsive">
                  <Table className="table-bordered mb-0">
                    <thead className="table-info">
                      <tr>
                        <th>#</th>
                        <th>Product Name</th>
                        <th>SKU</th>
                        <th>Current Stock</th>
                        <th>Adjustment Type</th>
                        <th>Adjustment Qty</th>
                        <th>New Stock</th>
                        <th>Unit Cost</th>
                        <th>Total Cost</th>
                        <th>Reason <span className="text-danger">*</span></th>
                        <th>Remove</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adjustmentItems.length > 0 ? (
                        adjustmentItems.map((item, index) => (
                          <tr key={item.id}>
                            <td>{index + 1}</td>
                            <td>{item.productName}</td>
                            <td>{item.sku}</td>
                            <td>
                              <Badge bg="secondary">{item.currentStock}</Badge>
                            </td>
                            <td>
                              <Form.Select
                                size="sm"
                                value={item.adjustmentType}
                                onChange={(e) => handleItemChange(item.id, 'adjustmentType', e.target.value)}
                                style={{ width: '120px' }}
                              >
                                <option value="increase">Increase (+)</option>
                                <option value="decrease">Decrease (-)</option>
                              </Form.Select>
                            </td>
                            <td>
                              <Form.Control
                                type="number"
                                size="sm"
                                value={item.adjustmentQuantity}
                                onChange={(e) => handleItemChange(item.id, 'adjustmentQuantity', e.target.value)}
                                min="0"
                                step="1"
                                style={{ width: '100px' }}
                              />
                            </td>
                            <td>
                              <Badge bg={item.adjustmentType === 'increase' ? 'success' : 'danger'}>
                                {item.newStock}
                              </Badge>
                            </td>
                            <td>${item.unitCost.toFixed(2)}</td>
                            <td className={item.totalCost >= 0 ? 'text-success' : 'text-danger'}>
                              ${Math.abs(item.totalCost).toFixed(2)}
                            </td>
                            <td>
                              <Form.Select
                                size="sm"
                                value={item.reason}
                                onChange={(e) => handleItemChange(item.id, 'reason', e.target.value)}
                                style={{ width: '180px' }}
                                required
                              >
                                <option value="">Select Reason</option>
                                {Object.entries(reasonCodes).map(([key, label]) => (
                                  <option key={key} value={key}>{label}</option>
                                ))}
                              </Form.Select>
                            </td>
                            <td>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleRemoveItem(item.id)}
                              >
                                <i className="mdi mdi-delete"></i>
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="11" className="text-center text-muted py-3">
                            No products added. Click "Search Products" to add items.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>

                <Row className="mt-3">
                  <Col md={8}></Col>
                  <Col md={4}>
                    <div className="text-end">
                      <p className="mb-1">Total Items: <strong>{totals.totalItems}</strong></p>
                      <p className="mb-1 h5">
                        Total Cost Impact: 
                        <strong className={totals.totalCost >= 0 ? 'text-success ms-2' : 'text-danger ms-2'}>
                          {totals.totalCost >= 0 ? '+' : '-'}${Math.abs(totals.totalCost).toFixed(2)}
                        </strong>
                      </p>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col xs={12}>
            <div className="text-end mb-3">
              <Button variant="secondary" className="me-2" onClick={() => navigate('/stock-adjustment/list')}>
                Cancel
              </Button>
              <Button variant="success" type="submit">
                <i className="mdi mdi-content-save me-1"></i> Save Adjustment
              </Button>
            </div>
          </Col>
        </Row>
      </Form>

      {/* Product Search Modal */}
      <Modal show={showProductModal} onHide={() => setShowProductModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Search Products</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              placeholder="Search by product name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </Form.Group>

          <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <Table className="table-hover">
              <thead className="table-light sticky-top">
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Current Stock</th>
                  <th>Unit Cost</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.sku}</td>
                      <td>
                        <Badge bg="secondary">
                          {product.currentStock || 0} {product.unit}
                        </Badge>
                      </td>
                      <td>${product.purchasePrice?.toFixed(2) || '0.00'}</td>
                      <td>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAddProduct(product)}
                        >
                          <i className="mdi mdi-plus me-1"></i> Add
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-3">
                      {searchTerm ? 'No products found' : 'Start typing to search products'}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProductModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AddStockAdjustmentPage;
