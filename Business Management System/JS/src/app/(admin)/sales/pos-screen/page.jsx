import { Card, Col, Row, Button, Form, Table, Badge, Modal } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const POSScreenPage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    customer: '',
    serviceStaff: '',
    productSearch: ''
  });

  const [cartItems, setCartItems] = useState([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    const storedCustomers = JSON.parse(localStorage.getItem('bms_customers') || '[]');
    setCustomers(storedCustomers);
    
    const storedProducts = JSON.parse(localStorage.getItem('bms_products') || '[]');
    setProducts(storedProducts);
  }, []);

  const handleAddToCart = (product) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setCartItems([...cartItems, {
        id: product.id,
        name: product.name,
        price: product.sellingPrice,
        quantity: 1,
        subtotal: product.sellingPrice
      }]);
    }
  };

  const handleRemoveFromCart = (itemId) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  const calculateTotals = () => {
    const itemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    return { itemsCount, total };
  };

  const totals = calculateTotals();

  const handleQuotation = () => {
    if (cartItems.length === 0) {
      alert('Please add items to cart first');
      return;
    }
    const quotation = {
      id: Date.now().toString(),
      invoiceNo: `QUOTE-${Date.now()}`,
      customer: formData.customer || 'Walk-In Customer',
      customerName: 'Walk-In Customer',
      items: cartItems,
      total: totals.total,
      date: new Date().toISOString(),
      status: 'quotation',
      documentType: 'QUOTATION'
    };
    const quotations = JSON.parse(localStorage.getItem('bms_quotations') || '[]');
    quotations.push(quotation);
    localStorage.setItem('bms_quotations', JSON.stringify(quotations));
    setReceiptData(quotation);
    setShowReceipt(true);
    setCartItems([]);
  };

  const handleBankPayment = () => {
    if (cartItems.length === 0) {
      alert('Please add items to cart first');
      return;
    }
    const sale = {
      id: Date.now().toString(),
      invoiceNo: `INV-${Date.now()}`,
      customer: formData.customer || 'Walk-In Customer',
      customerName: 'Walk-In Customer',
      customerMobile: '',
      saleDate: formData.date,
      items: cartItems,
      subtotal: totals.total,
      discount: 0,
      grandTotal: totals.total,
      total: totals.total,
      totalItems: totals.itemsCount,
      paymentMethod: 'bank',
      status: 'final',
      documentType: 'BANK PAYMENT INVOICE',
      createdAt: new Date().toISOString()
    };
    const sales = JSON.parse(localStorage.getItem('bms_sales') || '[]');
    sales.push(sale);
    localStorage.setItem('bms_sales', JSON.stringify(sales));
    
    // Update product stock
    const products = JSON.parse(localStorage.getItem('bms_products') || '[]');
    cartItems.forEach(cartItem => {
      const productIndex = products.findIndex(p => p.id === cartItem.id);
      if (productIndex !== -1) {
        products[productIndex].currentStock = (products[productIndex].currentStock || 0) - cartItem.quantity;
      }
    });
    localStorage.setItem('bms_products', JSON.stringify(products));
    setProducts(products);
    
    setReceiptData(sale);
    setShowReceipt(true);
    setCartItems([]);
  };

  const handleEcocashPayment = () => {
    if (cartItems.length === 0) {
      alert('Please add items to cart first');
      return;
    }
    const sale = {
      id: Date.now().toString(),
      invoiceNo: `INV-${Date.now()}`,
      customer: formData.customer || 'Walk-In Customer',
      customerName: 'Walk-In Customer',
      customerMobile: '',
      saleDate: formData.date,
      items: cartItems,
      subtotal: totals.total,
      discount: 0,
      grandTotal: totals.total,
      total: totals.total,
      totalItems: totals.itemsCount,
      paymentMethod: 'ecocash',
      status: 'final',
      documentType: 'ECOCASH PAYMENT INVOICE',
      createdAt: new Date().toISOString()
    };
    const sales = JSON.parse(localStorage.getItem('bms_sales') || '[]');
    sales.push(sale);
    localStorage.setItem('bms_sales', JSON.stringify(sales));
    
    // Update product stock
    const products = JSON.parse(localStorage.getItem('bms_products') || '[]');
    cartItems.forEach(cartItem => {
      const productIndex = products.findIndex(p => p.id === cartItem.id);
      if (productIndex !== -1) {
        products[productIndex].currentStock = (products[productIndex].currentStock || 0) - cartItem.quantity;
      }
    });
    localStorage.setItem('bms_products', JSON.stringify(products));
    setProducts(products);
    
    setReceiptData(sale);
    setShowReceipt(true);
    setCartItems([]);
  };

  const handleCashPayment = () => {
    if (cartItems.length === 0) {
      alert('Please add items to cart first');
      return;
    }
    const sale = {
      id: Date.now().toString(),
      invoiceNo: `INV-${Date.now()}`,
      customer: formData.customer || 'Walk-In Customer',
      customerName: 'Walk-In Customer',
      customerMobile: '',
      saleDate: formData.date,
      items: cartItems,
      subtotal: totals.total,
      discount: 0,
      grandTotal: totals.total,
      total: totals.total,
      totalItems: totals.itemsCount,
      paymentMethod: 'cash',
      amountReceived: totals.total,
      status: 'final',
      documentType: 'CASH SALE INVOICE',
      createdAt: new Date().toISOString()
    };
    const sales = JSON.parse(localStorage.getItem('bms_sales') || '[]');
    sales.push(sale);
    localStorage.setItem('bms_sales', JSON.stringify(sales));
    
    // Update product stock
    const products = JSON.parse(localStorage.getItem('bms_products') || '[]');
    cartItems.forEach(cartItem => {
      const productIndex = products.findIndex(p => p.id === cartItem.id);
      if (productIndex !== -1) {
        products[productIndex].currentStock = (products[productIndex].currentStock || 0) - cartItem.quantity;
      }
    });
    localStorage.setItem('bms_products', JSON.stringify(products));
    setProducts(products);
    
    setReceiptData(sale);
    setShowReceipt(true);
    setCartItems([]);
  };

  const handleCancel = () => {
    if (cartItems.length > 0) {
      if (window.confirm('Are you sure you want to cancel this sale?')) {
        setCartItems([]);
      }
    }
  };

  const handleRecentTransactions = () => {
    navigate('/sales/all');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  return (
    <div className="pos-screen" style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', padding: '15px' }}>
      <Row className="g-3">
        {/* Left Panel - Product Selection */}
        <Col lg={7}>
          <Card>
            <Card.Body>
              {/* Header Controls */}

              {/* Customer Selection */}
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group>
                    <div className="input-group">
                      <span className="input-group-text"><i className="mdi mdi-account"></i></span>
                      <Form.Select name="customer" value={formData.customer} onChange={handleInputChange}>
                        <option value="">Walk-In Customer</option>
                        {customers.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.name} - {customer.mobile}
                          </option>
                        ))}
                      </Form.Select>
                      <Button variant="primary" onClick={() => navigate('/contacts/customers')}>
                        <i className="mdi mdi-plus"></i>
                      </Button>
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              {/* Product Search */}
              <Row className="mb-3">
                <Col md={12}>
                  <div className="input-group">
                    <span className="input-group-text"><i className="mdi mdi-magnify"></i></span>
                    <Form.Control
                      type="text"
                      placeholder="Enter Product name / SKU / Scan bar code"
                      name="productSearch"
                      value={formData.productSearch}
                      onChange={handleInputChange}
                    />
                    <Button variant="primary">
                      <i className="mdi mdi-refresh"></i>
                    </Button>
                  </div>
                </Col>
              </Row>

              {/* Cart Table */}
              <div className="table-responsive" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                <Table bordered size="sm" className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Product <i className="mdi mdi-information-outline"></i></th>
                      <th>Quantity</th>
                      <th>Subtotal</th>
                      <th><i className="mdi mdi-close"></i></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center text-muted py-3">
                          No items in cart
                        </td>
                      </tr>
                    ) : (
                      cartItems.map((item, index) => (
                        <tr key={index}>
                          <td>{item.name}</td>
                          <td>{item.quantity}</td>
                          <td>$ {item.subtotal.toFixed(2)}</td>
                          <td>
                            <Button variant="link" size="sm" className="text-danger p-0" onClick={() => handleRemoveFromCart(item.id)}>
                              <i className="mdi mdi-delete"></i>
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>

              {/* Cart Summary */}
              <Row className="mt-3">
                <Col md={6}>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Items: <strong>{totals.itemsCount}</strong></span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Discount @ (-): <strong>$ 0.00</strong></span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Order Tax(+): <strong>$ 0.00</strong></span>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Total: <strong>$ {totals.total.toFixed(2)}</strong></span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Shipping(+): <strong>$ 0.00</strong></span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Packing Charge(+): <strong>$ 0.00</strong></span>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Panel - Categories/Products */}
        <Col lg={5}>
          <Card>
            <Card.Body>
              <div className="text-center mb-3">
                <Button variant="primary" className="w-100">
                  <i className="mdi mdi-package-variant me-2"></i> Products
                </Button>
              </div>

              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <Row className="g-2">
                  {products.length === 0 ? (
                    <Col xs={12}>
                      <div className="text-center text-muted py-4">
                        <i className="mdi mdi-package-variant" style={{ fontSize: '48px' }}></i>
                        <p className="mt-2">No products available</p>
                      </div>
                    </Col>
                  ) : (
                    products.map((product) => (
                      <Col xs={6} key={product.id}>
                        <Card 
                          className="text-center" 
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleAddToCart(product)}
                        >
                          <Card.Body className="p-2">
                            <div className="mb-2">
                              <i className="mdi mdi-package-variant" style={{ fontSize: '32px', color: '#6c757d' }}></i>
                            </div>
                            <div className="fw-bold" style={{ fontSize: '13px' }}>{product.name}</div>
                            <div className="text-muted" style={{ fontSize: '11px' }}>SKU: {product.sku}</div>
                            <div className="text-primary fw-bold mt-1" style={{ fontSize: '14px' }}>$ {product.sellingPrice?.toFixed(2) || '0.00'}</div>
                            <div className="text-muted" style={{ fontSize: '11px' }}>Stock: {product.currentStock || 0}</div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))
                  )}
                </Row>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Bottom Action Bar */}
      <Row className="mt-3">
        <Col xs={12}>
          <Card>
            <Card.Body className="p-2">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <Button variant="outline-secondary" size="sm" className="me-2" onClick={handleQuotation}>
                    <i className="mdi mdi-file-document-outline"></i> Quotation
                  </Button>
                </div>
                <div>
                  <Button variant="warning" size="sm" className="me-2" onClick={handleEcocashPayment}>
                    <i className="mdi mdi-cellphone me-1"></i> Ecocash
                  </Button>
                  <Button variant="info" size="sm" className="me-2" onClick={handleBankPayment}>
                    <i className="mdi mdi-bank me-1"></i> Bank (POS/Transfer)
                  </Button>
                  <Button variant="success" size="sm" className="me-2" onClick={handleCashPayment}>
                    <i className="mdi mdi-cash me-1"></i> Cash
                  </Button>
                  <Button variant="danger" size="sm" onClick={handleCancel}>
                    <i className="mdi mdi-close me-1"></i> Cancel
                  </Button>
                </div>
                <div>
                  <h4 className="mb-0">
                    <Badge bg="dark">Total Payable: $ {totals.total.toFixed(2)}</Badge>
                  </h4>
                </div>
                <div>
                  <Button variant="info" size="sm" onClick={handleRecentTransactions}>
                    <i className="mdi mdi-receipt me-1"></i> Recent transactions
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Receipt/Invoice Modal */}
      <Modal show={showReceipt} onHide={() => setShowReceipt(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{receiptData?.documentType || 'RECEIPT'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {receiptData && (
            <div className="invoice-container" style={{ padding: '20px' }}>
              {/* Business Header */}
              <div className="text-center mb-4">
                <h3 className="mb-1">Business Management System</h3>
                <p className="text-muted mb-0">123 Business Street, City, Country</p>
                <p className="text-muted mb-0">Phone: +1234567890 | Email: info@bms.com</p>
              </div>

              <hr />

              {/* Document Type */}
              <div className="text-center mb-4">
                <h4 className="text-primary fw-bold">{receiptData.documentType}</h4>
              </div>

              {/* Invoice Details */}
              <Row className="mb-4">
                <Col md={6}>
                  <p className="mb-1"><strong>Document No:</strong> {receiptData.invoiceNo}</p>
                  <p className="mb-1"><strong>Date:</strong> {new Date(receiptData.date || receiptData.saleDate || receiptData.createdAt).toLocaleDateString()}</p>
                  <p className="mb-1"><strong>Customer:</strong> {receiptData.customerName}</p>
                </Col>
                <Col md={6} className="text-end">
                  <p className="mb-1"><strong>Payment Method:</strong> {receiptData.paymentMethod?.toUpperCase() || 'N/A'}</p>
                  <p className="mb-1"><strong>Status:</strong> <Badge bg={receiptData.status === 'final' ? 'success' : 'warning'}>{receiptData.status?.toUpperCase()}</Badge></p>
                </Col>
              </Row>

              {/* Items Table */}
              <Table bordered className="mb-4">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th className="text-center">Quantity</th>
                    <th className="text-end">Unit Price</th>
                    <th className="text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {receiptData.items.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.name}</td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-end">$ {item.price?.toFixed(2) || '0.00'}</td>
                      <td className="text-end">$ {item.subtotal?.toFixed(2) || '0.00'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Totals */}
              <Row>
                <Col md={6} className="ms-auto">
                  <Table borderless size="sm">
                    <tbody>
                      <tr>
                        <td className="text-end"><strong>Subtotal:</strong></td>
                        <td className="text-end">$ {(receiptData.subtotal || receiptData.total)?.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="text-end"><strong>Discount:</strong></td>
                        <td className="text-end">$ {(receiptData.discount || 0).toFixed(2)}</td>
                      </tr>
                      <tr className="border-top">
                        <td className="text-end"><h5 className="mb-0"><strong>Grand Total:</strong></h5></td>
                        <td className="text-end"><h5 className="mb-0 text-primary"><strong>$ {(receiptData.grandTotal || receiptData.total)?.toFixed(2)}</strong></h5></td>
                      </tr>
                      {receiptData.amountReceived && (
                        <>
                          <tr>
                            <td className="text-end"><strong>Amount Received:</strong></td>
                            <td className="text-end">$ {receiptData.amountReceived.toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td className="text-end"><strong>Change:</strong></td>
                            <td className="text-end">$ {(receiptData.amountReceived - (receiptData.grandTotal || receiptData.total)).toFixed(2)}</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </Table>
                </Col>
              </Row>

              <hr />

              {/* Footer */}
              <div className="text-center mt-4">
                <p className="text-muted mb-1">Thank you for your business!</p>
                <p className="text-muted small">This is a computer-generated document. No signature required.</p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReceipt(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={() => window.print()}>
            <i className="mdi mdi-printer me-1"></i> Print
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default POSScreenPage;
