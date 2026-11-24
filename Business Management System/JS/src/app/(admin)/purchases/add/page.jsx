import { Card, Col, Row, Button, Form, Table, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { markPurchaseInventoryApplied, updateInventoryForPurchase } from '@/utils/purchaseInventory';
import { getSettings } from '@/helpers/settings';

const AddPurchasePage = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    supplier: '',
    referenceNo: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseStatus: 'received',
    businessLocation: 'Main Store',
    address: '',
    purchaseOrder: '',
    discountType: 'none',
    discountAmount: '',
    purchaseTax: 'none',
    additionalNotes: '',
    shippingDetails: '',
    additionalShippingCharges: '',
    advanceBalance: '',
    paymentAccount: '',
    paidOn: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    paymentNote: ''
  });

  const [purchaseItems, setPurchaseItems] = useState([]);

  useEffect(() => {
    // Load suppliers from localStorage
    const storedSuppliers = JSON.parse(localStorage.getItem('bms_suppliers') || '[]');
    setSuppliers(storedSuppliers);
    
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
    // Check if product already exists in purchase items
    const existingItem = purchaseItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      toast.warning('Product already added to purchase list');
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      quantity: 1,
      unitCost: product.purchasePrice || 0,
      discountPercent: 0,
      unitCostAfterDiscount: product.purchasePrice || 0,
      lineTotal: product.purchasePrice || 0,
      profitMargin: product.margin || 0,
      sellingPrice: product.sellingPrice || 0,
      lotNumber: ''
    };

    setPurchaseItems([...purchaseItems, newItem]);
    setShowProductModal(false);
    setSearchTerm('');
    toast.success('Product added to purchase list');
  };

  const handleItemChange = (itemId, field, value) => {
    setPurchaseItems(purchaseItems.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: parseFloat(value) || 0 };
        
        // Recalculate based on changes
        if (field === 'quantity' || field === 'unitCost' || field === 'discountPercent') {
          const discount = (updatedItem.unitCost * updatedItem.discountPercent) / 100;
          updatedItem.unitCostAfterDiscount = updatedItem.unitCost - discount;
          updatedItem.lineTotal = updatedItem.unitCostAfterDiscount * updatedItem.quantity;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const handleRemoveItem = (itemId) => {
    setPurchaseItems(purchaseItems.filter(item => item.id !== itemId));
    toast.info('Product removed from purchase list');
  };

  const calculateTotals = () => {
    const totalItems = purchaseItems.reduce((sum, item) => sum + item.quantity, 0);
    const netTotal = purchaseItems.reduce((sum, item) => sum + item.lineTotal, 0);
    
    let discount = 0;
    if (formData.discountType === 'fixed') {
      discount = parseFloat(formData.discountAmount) || 0;
    } else if (formData.discountType === 'percentage') {
      discount = (netTotal * (parseFloat(formData.discountAmount) || 0)) / 100;
    }
    
    const totalAfterDiscount = netTotal - discount;
    
    return {
      totalItems,
      netTotal,
      discount,
      totalAfterDiscount
    };
  };

  const totals = calculateTotals();

  const handleSave = (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.supplier) {
      toast.error('Please select a supplier');
      return;
    }
    
    if (purchaseItems.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    // Create purchase object
    const newPurchase = {
      id: Date.now().toString(),
      supplierId: formData.supplier,
      supplierName: suppliers.find(s => s.id === formData.supplier)?.name || 'Unknown',
      referenceNo: formData.referenceNo || `${getSettings().purchasePrefix || 'PUR-'}${Date.now()}`,
      purchaseDate: formData.purchaseDate,
      purchaseStatus: formData.purchaseStatus,
      businessLocation: formData.businessLocation,
      address: formData.address,
      purchaseOrder: formData.purchaseOrder,
      items: purchaseItems,
      discountType: formData.discountType,
      discountAmount: formData.discountAmount,
      discount: totals.discount,
      purchaseTax: formData.purchaseTax,
      additionalNotes: formData.additionalNotes,
      shippingDetails: formData.shippingDetails,
      additionalShippingCharges: formData.additionalShippingCharges,
      advanceBalance: formData.advanceBalance,
      paymentAccount: formData.paymentAccount,
      paidOn: formData.paidOn,
      paymentMethod: formData.paymentMethod,
      paymentNote: formData.paymentNote,
      totalItems: totals.totalItems,
      netTotal: totals.netTotal,
      grandTotal: totals.totalAfterDiscount,
      createdAt: new Date().toISOString(),
      status: 'Active'
    };

    updateInventoryForPurchase(newPurchase, 'add');
    const purchaseWithInventory = markPurchaseInventoryApplied(newPurchase);

    // Get existing purchases
    const existingPurchases = JSON.parse(localStorage.getItem('bms_purchases') || '[]');
    
    // Add new purchase
    existingPurchases.push(purchaseWithInventory);
    
    // Save to localStorage
    localStorage.setItem('bms_purchases', JSON.stringify(existingPurchases));
    
    toast.success('Purchase saved successfully!');
    navigate('/purchases/list');
  };

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <h4 className="page-title">
              Add Purchase <i className="mdi mdi-keyboard-backspace ms-2" style={{ cursor: 'pointer' }} onClick={() => navigate('/purchases/list')}></i>
            </h4>
          </div>
        </Col>
      </Row>

      <Form onSubmit={handleSave}>
        <Row>
          <Col xs={12}>
            <Card>
              <Card.Body>
                <Row>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Supplier: <span className="text-danger">*</span></Form.Label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="mdi mdi-account"></i></span>
                        <Form.Select name="supplier" value={formData.supplier} onChange={handleInputChange} required>
                          <option value="">Please Select</option>
                          {suppliers.map((supplier) => (
                            <option key={supplier.id} value={supplier.id}>
                              {supplier.name} - {supplier.mobile}
                            </option>
                          ))}
                        </Form.Select>
                        <Button variant="primary" size="sm" onClick={() => navigate('/contacts/suppliers')}>
                          <i className="mdi mdi-plus"></i>
                        </Button>
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Reference No:</Form.Label>
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
                      <Form.Label>Purchase Date: <span className="text-danger">*</span></Form.Label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="mdi mdi-calendar"></i></span>
                        <Form.Control
                          type="date"
                          name="purchaseDate"
                          value={formData.purchaseDate}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Purchase Status:</Form.Label>
                      <Form.Select name="purchaseStatus" value={formData.purchaseStatus} onChange={handleInputChange}>
                        <option value="received">Received</option>
                        <option value="pending">Pending</option>
                        <option value="ordered">Ordered</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Address:</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Purchase Order:</Form.Label>
                      <Form.Control
                        type="text"
                        name="purchaseOrder"
                        value={formData.purchaseOrder}
                        onChange={handleInputChange}
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
                <div className="mb-3">
                  <Button variant="primary" size="sm" onClick={handleSearchProducts}>
                    <i className="mdi mdi-magnify me-1"></i> Search Products
                  </Button>
                  <Button variant="success" size="sm" className="ms-2" onClick={() => navigate('/products/add')}>
                    <i className="mdi mdi-plus me-1"></i> Add new product
                  </Button>
                </div>

                <div className="table-responsive">
                  <Table className="table-bordered mb-0">
                    <thead className="table-success">
                      <tr>
                        <th>#</th>
                        <th>Product Name</th>
                        <th>SKU</th>
                        <th>Quantity</th>
                        <th>Unit Cost</th>
                        <th>Discount %</th>
                        <th>Unit Cost After Discount</th>
                        <th>Line Total</th>
                        <th>Profit Margin %</th>
                        <th>Selling Price</th>
                        <th>Lot Number</th>
                        <th>Remove</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchaseItems.length > 0 ? (
                        purchaseItems.map((item, index) => (
                          <tr key={item.id}>
                            <td>{index + 1}</td>
                            <td>{item.productName}</td>
                            <td>{item.sku}</td>
                            <td>
                              <Form.Control
                                type="number"
                                size="sm"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                                min="1"
                                style={{ width: '80px' }}
                              />
                            </td>
                            <td>
                              <Form.Control
                                type="number"
                                size="sm"
                                step="0.01"
                                value={item.unitCost}
                                onChange={(e) => handleItemChange(item.id, 'unitCost', e.target.value)}
                                style={{ width: '100px' }}
                              />
                            </td>
                            <td>
                              <Form.Control
                                type="number"
                                size="sm"
                                step="0.01"
                                value={item.discountPercent}
                                onChange={(e) => handleItemChange(item.id, 'discountPercent', e.target.value)}
                                style={{ width: '80px' }}
                              />
                            </td>
                            <td>${item.unitCostAfterDiscount.toFixed(2)}</td>
                            <td>${item.lineTotal.toFixed(2)}</td>
                            <td>{item.profitMargin}%</td>
                            <td>${item.sellingPrice.toFixed(2)}</td>
                            <td>
                              <Form.Control
                                type="text"
                                size="sm"
                                value={item.lotNumber}
                                onChange={(e) => handleItemChange(item.id, 'lotNumber', e.target.value)}
                                style={{ width: '100px' }}
                              />
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
                          <td colSpan="12" className="text-center text-muted py-3">
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
                      <p className="mb-1">Total Items: <strong>{totals.totalItems.toFixed(2)}</strong></p>
                      <p className="mb-1">Net Total Amount: <strong>${totals.netTotal.toFixed(2)}</strong></p>
                      <p className="mb-1">Discount: <strong>-${totals.discount.toFixed(2)}</strong></p>
                      <p className="mb-1 h5">Grand Total: <strong>${totals.totalAfterDiscount.toFixed(2)}</strong></p>
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
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Discount type:</Form.Label>
                      <Form.Select name="discountType" value={formData.discountType} onChange={handleInputChange}>
                        <option value="none">None</option>
                        <option value="fixed">Fixed</option>
                        <option value="percentage">Percentage</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Discount Amount:</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        name="discountAmount"
                        placeholder="0"
                        value={formData.discountAmount}
                        onChange={handleInputChange}
                        disabled={formData.discountType === 'none'}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Discount(-):</Form.Label>
                      <div className="form-control-plaintext">${totals.discount.toFixed(2)}</div>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Additional Notes:</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="additionalNotes"
                        value={formData.additionalNotes}
                        onChange={handleInputChange}
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
            <div className="text-end mb-3">
              <Button variant="secondary" className="me-2" onClick={() => navigate('/purchases/list')}>
                Cancel
              </Button>
              <Button variant="success" type="submit">
                <i className="mdi mdi-content-save me-1"></i> Save Purchase
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
                  <th>Purchase Price</th>
                  <th>Selling Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.sku}</td>
                      <td>${product.purchasePrice?.toFixed(2) || '0.00'}</td>
                      <td>${product.sellingPrice?.toFixed(2) || '0.00'}</td>
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

export default AddPurchasePage;
