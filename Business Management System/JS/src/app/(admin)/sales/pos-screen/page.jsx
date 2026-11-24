import { Card, Col, Row, Button, Form, Table, Badge, Modal } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSettings } from '@/helpers/settings';

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
  const [searchOpen, setSearchOpen] = useState(false);
  const settings = getSettings();

  useEffect(() => {
    const storedCustomers = JSON.parse(localStorage.getItem('bms_customers') || '[]');
    setCustomers(storedCustomers);
    
    const storedProducts = JSON.parse(localStorage.getItem('bms_products') || '[]');
    setProducts(storedProducts);
  }, []);

  const handleAddToCart = (product) => {
    const stock = product.currentStock || 0;
    if (stock <= 0) {
      alert(`${product.name} is out of stock and cannot be added`);
      return;
    }
    const existingItem = cartItems.find(item => item.id === product.id);
    if (existingItem) {
      const maxQty = existingItem.availableStock ?? stock;
      if (existingItem.quantity >= maxQty) {
        alert(`Only ${maxQty} ${existingItem.name} available in stock`);
        return;
      }
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
        subtotal: product.sellingPrice,
        availableStock: stock
      }]);
    }
  };

  const handleQuantityChange = (itemId, value) => {
    const qty = parseInt(value, 10);
    if (isNaN(qty) || qty <= 0) {
      setCartItems(cartItems.filter(item => item.id !== itemId));
      return;
    }
    setCartItems(cartItems.map(item => {
      if (item.id !== itemId) return item;
      const max = item.availableStock ?? qty;
      const clamped = Math.min(qty, max);
      return { ...item, quantity: clamped, subtotal: clamped * item.price };
    }));
  };

  const handleRemoveFromCart = (itemId) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  const searchTerm = (formData.productSearch || '').trim().toLowerCase();
  const searchResults = searchTerm
    ? products.filter(p =>
        (p.name || '').toLowerCase().includes(searchTerm) ||
        String(p.sku || '').toLowerCase().includes(searchTerm)
      ).slice(0, 10)
    : [];

  const handleSelectSearchResult = (product) => {
    handleAddToCart(product);
    setFormData({ ...formData, productSearch: '' });
    setSearchOpen(false);
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

  const handleCreditSale = () => {
    if (cartItems.length === 0) {
      alert('Please add items to cart first');
      return;
    }
    const customer = customers.find(c => String(c.id) === String(formData.customer));
    if (!customer) {
      alert('Please select a customer to sell on credit');
      return;
    }
    const creditLimit = parseFloat(customer.creditLimit) || 0;
    if (creditLimit <= 0) {
      alert(`${customer.name} does not have a credit limit set. Add a credit limit in the customer profile first.`);
      return;
    }

    const existingSales = JSON.parse(localStorage.getItem('bms_sales') || '[]');
    const payments = JSON.parse(localStorage.getItem('bms_customer_payments') || '[]');
    const totalCredit = existingSales
      .filter(s => s.customerId === customer.id && s.paymentMethod === 'credit')
      .reduce((sum, s) => sum + (parseFloat(s.grandTotal) || parseFloat(s.total) || 0), 0);
    const totalPaid = payments
      .filter(p => p.customerId === customer.id)
      .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const availableCredit = creditLimit - (totalCredit - totalPaid);
    if (totals.total > availableCredit) {
      alert(`Credit limit exceeded for ${customer.name}. Available credit: $${availableCredit.toFixed(2)}, sale total: $${totals.total.toFixed(2)}`);
      return;
    }

    const sale = {
      id: Date.now().toString(),
      invoiceNo: `INV-${Date.now()}`,
      customer: customer.id,
      customerId: customer.id,
      customerName: customer.name,
      customerMobile: customer.mobile || '',
      saleDate: formData.date,
      items: cartItems,
      subtotal: totals.total,
      discount: 0,
      grandTotal: totals.total,
      total: totals.total,
      totalItems: totals.itemsCount,
      paymentMethod: 'credit',
      paymentStatus: 'due',
      amountReceived: 0,
      amountDue: totals.total,
      status: 'final',
      documentType: 'CREDIT SALE INVOICE',
      createdAt: new Date().toISOString()
    };
    existingSales.push(sale);
    localStorage.setItem('bms_sales', JSON.stringify(existingSales));

    const products = JSON.parse(localStorage.getItem('bms_products') || '[]');
    cartItems.forEach(cartItem => {
      const productIndex = products.findIndex(p => String(p.id) === String(cartItem.id));
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

  const printReceipt = (receipt) => {
    if (!receipt) return;
    const printWindow = window.open('', '_blank');
    const docTitle = receipt.documentType || 'RECEIPT';
    const grandTotal = receipt.grandTotal || receipt.total || 0;
    const itemsRows = (receipt.items || []).map((item, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${item.name}</td>
        <td style="text-align:center">${item.quantity}</td>
        <td style="text-align:right">$${(item.price || 0).toFixed(2)}</td>
        <td style="text-align:right">$${(item.subtotal || 0).toFixed(2)}</td>
      </tr>`).join('');
    const paymentInfo = receipt.paymentMethod === 'credit'
      ? `<p><strong>Payment Status:</strong> Credit Sale</p><p><strong>Amount Due:</strong> $${(receipt.amountDue || grandTotal).toFixed(2)}</p>`
      : receipt.amountReceived
        ? `<p><strong>Amount Received:</strong> $${receipt.amountReceived.toFixed(2)}</p><p><strong>Change:</strong> $${(receipt.amountReceived - grandTotal).toFixed(2)}</p>`
        : `<p><strong>Payment Method:</strong> ${(receipt.paymentMethod || '').toUpperCase()}</p>`;

    const invoiceHTML = `<!DOCTYPE html>
      <html>
      <head>
        <title>${docTitle} - ${receipt.invoiceNo}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .invoice-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 15px; }
          .invoice-header h2 { margin: 0; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 13px; }
          th { background-color: #2c3e50; color: #fff; }
          .totals { width: 280px; margin-left: auto; }
          .totals td { border: none; padding: 4px 8px; }
          .grand { font-weight: bold; font-size: 16px; border-top: 2px solid #333; }
          .payment-info { background: #e7f3ff; padding: 12px; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          .no-print { text-align: center; margin-top: 15px; }
          .no-print button { padding: 8px 18px; margin: 0 5px; cursor: pointer; }
          @media print { .no-print { display: none; } body { margin: 0; } }
        </style>
      </head>
      <body onload="setTimeout(function(){window.print()}, 300)">
        <div class="invoice-header">
          <h2>${settings.businessName}</h2>
          ${settings.ownerName ? `<p>Owner: ${settings.ownerName}</p>` : ''}
          <p>${[settings.address, settings.phone && `Phone: ${settings.phone}`, settings.email && `Email: ${settings.email}`, settings.taxNumber && `Tax No: ${settings.taxNumber}`].filter(Boolean).join(' | ')}</p>
          <h3>${docTitle}</h3>
        </div>
        <p><strong>Document No:</strong> ${receipt.invoiceNo} &nbsp;&nbsp; <strong>Date:</strong> ${new Date(receipt.date || receipt.saleDate || receipt.createdAt).toLocaleDateString()} &nbsp;&nbsp; <strong>Customer:</strong> ${receipt.customerName || 'Walk-In Customer'}</p>
        <table>
          <thead><tr><th>#</th><th>Product</th><th style="text-align:center">Qty</th><th style="text-align:right">Unit Price</th><th style="text-align:right">Subtotal</th></tr></thead>
          <tbody>${itemsRows}</tbody>
        </table>
        <table class="totals">
          <tr><td>Subtotal:</td><td style="text-align:right">$${(receipt.subtotal || receipt.total || 0).toFixed(2)}</td></tr>
          <tr><td>Discount:</td><td style="text-align:right">$${(receipt.discount || 0).toFixed(2)}</td></tr>
          <tr class="grand"><td>Grand Total:</td><td style="text-align:right">$${grandTotal.toFixed(2)}</td></tr>
        </table>
        <div class="payment-info">${paymentInfo}</div>
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>This is a computer-generated document. No signature required.</p>
        </div>
        <div class="no-print">
          <button onclick="window.print()">Print</button>
          <button onclick="window.close()">Close</button>
        </div>
      </body>
      </html>`;
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
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
                  <div style={{ position: 'relative' }}>
                    <div className="input-group">
                      <span className="input-group-text"><i className="mdi mdi-magnify"></i></span>
                      <Form.Control
                        type="text"
                        placeholder="Enter Product name / SKU / Scan bar code"
                        name="productSearch"
                        value={formData.productSearch}
                        onChange={handleInputChange}
                        onFocus={() => setSearchOpen(true)}
                        onBlur={() => setSearchOpen(false)}
                      />
                      <Button variant="primary">
                        <i className="mdi mdi-refresh"></i>
                      </Button>
                    </div>
                    {searchOpen && searchTerm && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 1050,
                        backgroundColor: '#fff',
                        border: '1px solid #dee2e6',
                        borderRadius: '0 0 4px 4px',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.12)',
                        maxHeight: '220px',
                        overflowY: 'auto'
                      }}>
                        {searchResults.length === 0 ? (
                          <div className="text-muted p-2" style={{ fontSize: '13px' }}>
                            No products found
                          </div>
                        ) : (
                          searchResults.map((product) => {
                            const inStock = (product.currentStock || 0) > 0;
                            return (
                              <div
                                key={product.id}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleSelectSearchResult(product);
                                }}
                                style={{
                                  padding: '8px 12px',
                                  cursor: inStock ? 'pointer' : 'not-allowed',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  borderBottom: '1px solid #f1f1f1',
                                  backgroundColor: inStock ? '#fff' : '#f8f9fa'
                                }}
                              >
                                <span style={{ fontSize: '13px' }}>
                                  {product.name}{' '}
                                  <span className="text-muted">({product.sku})</span>
                                </span>
                                <span style={{ fontSize: '12px' }} className={inStock ? 'text-success' : 'text-danger'}>
                                  Stock: {product.currentStock || 0}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
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
                          <td>
                            <Form.Control
                              type="number"
                              size="sm"
                              min="1"
                              max={item.availableStock}
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                              style={{ width: '70px' }}
                            />
                          </td>
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
                  <Button variant="secondary" size="sm" className="me-2" onClick={handleCreditSale}>
                    <i className="mdi mdi-credit-card-outline me-1"></i> Credit Sale
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
                <h3 className="mb-1">{settings.businessName}</h3>
                {settings.ownerName && <p className="text-muted mb-0">Owner: {settings.ownerName}</p>}
                {settings.address && <p className="text-muted mb-0">{settings.address}</p>}
                {(settings.phone || settings.email) && (
                  <p className="text-muted mb-0">
                    {[settings.phone && `Phone: ${settings.phone}`, settings.email && `Email: ${settings.email}`].filter(Boolean).join(' | ')}
                  </p>
                )}
                {settings.taxNumber && <p className="text-muted mb-0">Tax No: {settings.taxNumber}</p>}
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
                      {receiptData.paymentMethod === 'credit' && (
                        <tr>
                          <td className="text-end"><strong>Amount Due:</strong></td>
                          <td className="text-end">$ {(receiptData.amountDue || receiptData.grandTotal || receiptData.total)?.toFixed(2)}</td>
                        </tr>
                      )}
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
          <Button variant="primary" onClick={() => printReceipt(receiptData)}>
            <i className="mdi mdi-printer me-1"></i> Print
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default POSScreenPage;
