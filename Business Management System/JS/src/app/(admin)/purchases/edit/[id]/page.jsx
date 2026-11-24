import { Card, Col, Row, Button, Form, Table, Modal } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { markPurchaseInventoryApplied, updateInventoryForPurchase } from '@/utils/purchaseInventory';
import { getLocations } from '@/helpers/settings';

const EditPurchasePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [suppliers, setSuppliers] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    supplier: '',
    supplierName: '',
    referenceNo: '',
    purchaseDate: '',
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
    paidOn: '',
    paymentMethod: 'cash',
    paymentNote: ''
  });

  const [purchaseItems, setPurchaseItems] = useState([]);

  useEffect(() => {
    const storedSuppliers = JSON.parse(localStorage.getItem('bms_suppliers') || '[]');
    setSuppliers(storedSuppliers);
    
    const storedProducts = JSON.parse(localStorage.getItem('bms_products') || '[]');
    setAvailableProducts(storedProducts);

    const purchases = JSON.parse(localStorage.getItem('bms_purchases') || '[]');
    const purchase = purchases.find(p => p.id === id);
    
    if (purchase) {
      setFormData({
        supplier: purchase.supplier || '',
        supplierName: purchase.supplierName || '',
        referenceNo: purchase.referenceNo || '',
        purchaseDate: purchase.purchaseDate || '',
        purchaseStatus: purchase.purchaseStatus || 'received',
        businessLocation: purchase.businessLocation || 'Main Store',
        address: purchase.address || '',
        purchaseOrder: purchase.purchaseOrder || '',
        discountType: purchase.discountType || 'none',
        discountAmount: purchase.discountAmount || '',
        purchaseTax: purchase.purchaseTax || 'none',
        additionalNotes: purchase.additionalNotes || '',
        shippingDetails: purchase.shippingDetails || '',
        additionalShippingCharges: purchase.additionalShippingCharges || '',
        advanceBalance: purchase.advanceBalance || '',
        paymentAccount: purchase.paymentAccount || '',
        paidOn: purchase.paidOn || '',
        paymentMethod: purchase.paymentMethod || 'cash',
        paymentNote: purchase.paymentNote || ''
      });
      setPurchaseItems(purchase.items || []);
    } else {
      toast.error('Purchase not found');
      navigate('/purchases/list');
    }
  }, [id, navigate]);

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
    toast.success('SUCCESSFUL');
  };

  const handleItemChange = (itemId, field, value) => {
    setPurchaseItems(purchaseItems.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: parseFloat(value) || 0 };
        
        if (field === 'quantity' || field === 'unitCost' || field === 'discountPercent') {
          const discount = (updatedItem.unitCost * updatedItem.discountPercent) / 100;
          updatedItem.unitCostAfterDiscount = updatedItem.unitCost - discount;
          updatedItem.lineTotal = updatedItem.quantity * updatedItem.unitCostAfterDiscount;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const handleRemoveItem = (itemId) => {
    setPurchaseItems(purchaseItems.filter(item => item.id !== itemId));
  };

  const calculateTotals = () => {
    const subtotal = purchaseItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const totalItems = purchaseItems.reduce((sum, item) => sum + item.quantity, 0);
    
    let discount = 0;
    if (formData.discountType === 'fixed') {
      discount = parseFloat(formData.discountAmount) || 0;
    } else if (formData.discountType === 'percentage') {
      discount = (subtotal * (parseFloat(formData.discountAmount) || 0)) / 100;
    }
    
    const shippingCharges = parseFloat(formData.additionalShippingCharges) || 0;
    const grandTotal = subtotal - discount + shippingCharges;
    
    return { subtotal, discount, shippingCharges, grandTotal, totalItems };
  };

  const totals = calculateTotals();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (purchaseItems.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    const purchases = JSON.parse(localStorage.getItem('bms_purchases') || '[]');
    const purchaseIndex = purchases.findIndex(p => p.id === id);
    
    if (purchaseIndex === -1) {
      toast.error('Purchase not found');
      return;
    }

    const previousPurchase = purchases[purchaseIndex];
    if (previousPurchase.inventoryApplied) {
      updateInventoryForPurchase(previousPurchase, 'remove');
    }

    const updatedPurchase = markPurchaseInventoryApplied({
      ...purchases[purchaseIndex],
      supplier: formData.supplier,
      supplierName: formData.supplierName,
      referenceNo: formData.referenceNo,
      purchaseDate: formData.purchaseDate,
      purchaseStatus: formData.purchaseStatus,
      businessLocation: formData.businessLocation,
      address: formData.address,
      purchaseOrder: formData.purchaseOrder,
      discountType: formData.discountType,
      discountAmount: formData.discountAmount,
      purchaseTax: formData.purchaseTax,
      additionalNotes: formData.additionalNotes,
      shippingDetails: formData.shippingDetails,
      additionalShippingCharges: formData.additionalShippingCharges,
      advanceBalance: formData.advanceBalance,
      paymentAccount: formData.paymentAccount,
      paidOn: formData.paidOn,
      paymentMethod: formData.paymentMethod,
      paymentNote: formData.paymentNote,
      items: purchaseItems,
      subtotal: totals.subtotal,
      discount: totals.discount,
      grandTotal: totals.grandTotal,
      totalItems: totals.totalItems,
      updatedAt: new Date().toISOString()
    });

    updateInventoryForPurchase(updatedPurchase, 'add');

    purchases[purchaseIndex] = updatedPurchase;
    localStorage.setItem('bms_purchases', JSON.stringify(purchases));

    toast.success('SUCCESSFUL');
    navigate('/purchases/list');
  };

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <div className="page-title-right">
              <Button variant="secondary" onClick={() => navigate('/purchases/list')}>
                <i className="mdi mdi-arrow-left me-1"></i> Back to Purchases
              </Button>
            </div>
            <h4 className="page-title">Edit/View Purchase</h4>
          </div>
        </Col>
      </Row>

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col xs={12}>
            <Card>
              <Card.Body>
                <h5 className="mb-3 text-uppercase bg-light p-2">
                  <i className="mdi mdi-truck me-1"></i> Supplier Information
                </h5>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Supplier Name <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="supplierName"
                        value={formData.supplierName}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Reference No <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="referenceNo"
                        value={formData.referenceNo}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Purchase Date <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="date"
                        name="purchaseDate"
                        value={formData.purchaseDate}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Purchase Status</Form.Label>
                      <Form.Select name="purchaseStatus" value={formData.purchaseStatus} onChange={handleInputChange}>
                        <option value="received">Received</option>
                        <option value="pending">Pending</option>
                        <option value="ordered">Ordered</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Address</Form.Label>
                      <Form.Control
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Business Location</Form.Label>
                      <Form.Select name="businessLocation" value={formData.businessLocation} onChange={handleInputChange}>
                        {getLocations().map((loc) => (
                          <option key={loc.id} value={loc.name}>{loc.name}</option>
                        ))}
                      </Form.Select>
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
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0 text-uppercase">
                    <i className="mdi mdi-package-variant me-1"></i> Purchase Items
                  </h5>
                  <Button variant="success" size="sm" onClick={handleSearchProducts}>
                    <i className="mdi mdi-plus me-1"></i> Add Product
                  </Button>
                </div>

                <div className="table-responsive">
                  <Table className="table-centered table-nowrap mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Unit Cost</th>
                        <th>Discount %</th>
                        <th>Line Total</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchaseItems.map((item) => (
                        <tr key={item.id}>
                          <td>{item.productName}</td>
                          <td>
                            <Form.Control
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                              style={{ width: '100px' }}
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitCost}
                              onChange={(e) => handleItemChange(item.id, 'unitCost', e.target.value)}
                              style={{ width: '120px' }}
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              min="0"
                              max="100"
                              value={item.discountPercent}
                              onChange={(e) => handleItemChange(item.id, 'discountPercent', e.target.value)}
                              style={{ width: '100px' }}
                            />
                          </td>
                          <td>${item.lineTotal.toFixed(2)}</td>
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
                      ))}
                      {purchaseItems.length === 0 && (
                        <tr>
                          <td colSpan="6" className="text-center text-muted py-3">
                            No items added. Click "Add Product" to add items.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>

                <Row className="mt-3">
                  <Col md={{ span: 6, offset: 6 }}>
                    <Table size="sm" borderless>
                      <tbody>
                        <tr>
                          <td className="text-end"><strong>Subtotal:</strong></td>
                          <td className="text-end">${totals.subtotal.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td className="text-end"><strong>Discount:</strong></td>
                          <td className="text-end">-${totals.discount.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td className="text-end"><strong>Shipping:</strong></td>
                          <td className="text-end">${totals.shippingCharges.toFixed(2)}</td>
                        </tr>
                        <tr className="border-top">
                          <td className="text-end"><strong>Grand Total:</strong></td>
                          <td className="text-end"><strong>${totals.grandTotal.toFixed(2)}</strong></td>
                        </tr>
                      </tbody>
                    </Table>
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
                <h5 className="mb-3 text-uppercase bg-light p-2">
                  <i className="mdi mdi-cash me-1"></i> Payment Information
                </h5>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Payment Method</Form.Label>
                      <Form.Select name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange}>
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="mobile_money">Mobile Money</option>
                        <option value="bank_transfer">Bank Transfer</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Additional Notes</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
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
                <i className="mdi mdi-content-save me-1"></i> Save
              </Button>
            </div>
          </Col>
        </Row>
      </Form>

      <Modal show={showProductModal} onHide={() => setShowProductModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Select Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              placeholder="Search by product name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form.Group>
          <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <Table hover>
              <thead className="table-light">
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Purchase Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.sku}</td>
                    <td>${product.purchasePrice?.toFixed(2)}</td>
                    <td>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAddProduct(product)}
                      >
                        Add
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default EditPurchasePage;
