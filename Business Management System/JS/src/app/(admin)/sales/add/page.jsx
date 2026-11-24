import { Card, Col, Row, Button, Form, Table, Modal, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getSettings, nextInvoiceNumber, getTaxRates } from '@/helpers/settings';

const AddSalePage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    mobile: '',
    email: ''
  });
  
  const [formData, setFormData] = useState({
    customer: '',
    saleDate: new Date().toISOString().split('T')[0],
    billingAddress: '',
    status: 'final',
    invoiceScheme: 'default',
    invoiceNo: '',
    discountType: 'none',
    discountAmount: '',
    orderTax: 'none',
    sellNote: '',
    paymentMethod: 'cash',
    amountReceived: '',
    mobileMoneyReference: '',
    paymentNote: ''
  });

  const [saleItems, setSaleItems] = useState([]);

  const [taxRates, setTaxRates] = useState([]);

  useEffect(() => {
    // Load customers from localStorage
    const storedCustomers = JSON.parse(localStorage.getItem('bms_customers') || '[]');
    setCustomers(storedCustomers);

    // Load products from localStorage
    const storedProducts = JSON.parse(localStorage.getItem('bms_products') || '[]');
    setAvailableProducts(storedProducts);

    // Load tax rates from settings
    setTaxRates(getTaxRates());
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleNewCustomerChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer({
      ...newCustomer,
      [name]: value
    });
  };

  const handleAddCustomer = (e) => {
    e.preventDefault();

    if (!newCustomer.name || !newCustomer.mobile) {
      toast.error('Name and Mobile are required');
      return;
    }

    const customer = {
      id: Date.now().toString(),
      name: newCustomer.name,
      contactType: 'customer',
      type: 'Individual',
      contactId: `CUST-${Date.now()}`,
      mobile: newCustomer.mobile,
      email: newCustomer.email,
      creditLimit: 0,
      currentBalance: 0,
      status: 'Active',
      createdAt: new Date().toISOString()
    };

    const existingCustomers = JSON.parse(localStorage.getItem('bms_customers') || '[]');
    existingCustomers.push(customer);
    localStorage.setItem('bms_customers', JSON.stringify(existingCustomers));

    setCustomers([...customers, customer]);
    setFormData({ ...formData, customer: customer.id });
    setNewCustomer({ name: '', mobile: '', email: '' });
    setShowCustomerModal(false);
    toast.success('Customer added successfully!');
  };

  const handleSearchProducts = () => {
    setShowProductModal(true);
  };

  const filteredProducts = availableProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = (product) => {
    // Check if product already exists in sale items
    const existingItem = saleItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      toast.warning('Product already added to sale');
      return;
    }

    // Check stock availability
    const currentStock = product.currentStock || 0;
    if (currentStock <= 0) {
      toast.error(`${product.name} is out of stock!`);
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      quantity: 1,
      availableStock: currentStock,
      unitPrice: product.sellingPrice || 0,
      discountPercent: 0,
      unitPriceAfterDiscount: product.sellingPrice || 0,
      lineTotal: product.sellingPrice || 0,
      tax: 0
    };

    setSaleItems([...saleItems, newItem]);
    setShowProductModal(false);
    setSearchTerm('');
    toast.success('Product added to sale');
  };

  const handleItemChange = (itemId, field, value) => {
    setSaleItems(saleItems.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: parseFloat(value) || 0 };
        
        // Validate stock when quantity changes
        if (field === 'quantity') {
          if (updatedItem.quantity > item.availableStock) {
            toast.error(`Insufficient stock! Only ${item.availableStock} ${item.productName} available.`);
            updatedItem.quantity = item.availableStock;
          }
          if (updatedItem.quantity < 1) {
            updatedItem.quantity = 1;
          }
        }
        
        // Recalculate based on changes
        if (field === 'quantity' || field === 'unitPrice' || field === 'discountPercent') {
          const discount = (updatedItem.unitPrice * updatedItem.discountPercent) / 100;
          updatedItem.unitPriceAfterDiscount = updatedItem.unitPrice - discount;
          updatedItem.lineTotal = updatedItem.unitPriceAfterDiscount * updatedItem.quantity;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const handleRemoveItem = (itemId) => {
    setSaleItems(saleItems.filter(item => item.id !== itemId));
    toast.info('Product removed from sale');
  };

  const calculateTotals = () => {
    const totalItems = saleItems.reduce((sum, item) => sum + item.quantity, 0);
    const netTotal = saleItems.reduce((sum, item) => sum + item.lineTotal, 0);

    let discount = 0;
    if (formData.discountType === 'fixed') {
      discount = parseFloat(formData.discountAmount) || 0;
    } else if (formData.discountType === 'percentage') {
      discount = (netTotal * (parseFloat(formData.discountAmount) || 0)) / 100;
    }

    const totalAfterDiscount = netTotal - discount;

    // Apply order tax rate from tax settings
    const taxRate = formData.orderTax === 'none'
      ? 0
      : (taxRates.find(t => t.id === formData.orderTax)?.rate || 0);
    const taxAmount = (totalAfterDiscount * taxRate) / 100;
    const grandTotal = totalAfterDiscount + taxAmount;

    return {
      totalItems,
      netTotal,
      discount,
      taxRate,
      taxAmount,
      totalAfterDiscount,
      grandTotal
    };
  };

  const totals = calculateTotals();

  // Calculate change for cash payments
  const calculateChange = () => {
    if (formData.paymentMethod === 'cash') {
      const amountReceived = parseFloat(formData.amountReceived) || 0;
      const change = amountReceived - totals.grandTotal;
      return change >= 0 ? change : 0;
    }
    return 0;
  };

  const change = calculateChange();

  const isDraftOrQuotation = formData.status === 'draft' || formData.status === 'quotation';

  const updateInventory = (items) => {
    // Get current products
    const products = JSON.parse(localStorage.getItem('bms_products') || '[]');
    
    // Update stock levels
    const updatedProducts = products.map(product => {
      const soldItem = items.find(item => item.productId === product.id);
      if (soldItem) {
        return {
          ...product,
          currentStock: (product.currentStock || 0) - soldItem.quantity
        };
      }
      return product;
    });
    
    // Save updated products
    localStorage.setItem('bms_products', JSON.stringify(updatedProducts));
  };

  const validateSale = () => {
    // Validate items
    if (saleItems.length === 0) {
      toast.error('Please add at least one product');
      return false;
    }

    // Drafts and quotations skip payment validation
    if (isDraftOrQuotation) {
      return true;
    }

    // Validate payment method specific requirements
    if (formData.paymentMethod === 'cash') {
      const amountReceived = parseFloat(formData.amountReceived) || 0;
      if (amountReceived < totals.grandTotal) {
        toast.error('Amount received is less than total amount');
        return false;
      }
    }

    if (formData.paymentMethod === 'credit') {
      if (!formData.customer) {
        toast.error('Please select a customer for credit sales');
        return false;
      }
      
      // Check customer credit limit
      const customer = customers.find(c => c.id === formData.customer);
      if (customer) {
        const creditLimit = parseFloat(customer.creditLimit) || 0;
        if (totals.grandTotal > creditLimit) {
          toast.error(`Credit limit exceeded! Customer limit: $${creditLimit.toFixed(2)}`);
          return false;
        }
      }
    }

    if (formData.paymentMethod === 'mobile' && !formData.mobileMoneyReference) {
      toast.error('Please enter mobile money transaction reference');
      return false;
    }

    return true;
  };

  const saveSale = () => {
    if (!validateSale()) {
      return null;
    }

    // Get customer info
    const customerInfo = customers.find(c => c.id === formData.customer);

    // Generate unique transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const settings = getSettings();

    // Create sale object
    const newSale = {
      id: Date.now().toString(),
      transactionId: transactionId,
      customerId: formData.customer || 'walk-in',
      customerName: customerInfo?.name || 'Walk-In Customer',
      customerMobile: customerInfo?.mobile || '',
      saleDate: formData.saleDate,
      billingAddress: formData.billingAddress,
      status: formData.status,
      invoiceScheme: formData.invoiceScheme,
      invoiceNo: formData.invoiceNo || nextInvoiceNumber(),
      items: saleItems,
      discountType: formData.discountType,
      discountAmount: formData.discountAmount,
      discount: totals.discount,
      orderTax: formData.orderTax,
      orderTaxRate: totals.taxRate,
      taxAmount: totals.taxAmount,
      sellNote: formData.sellNote,
      paymentMethod: isDraftOrQuotation ? 'pending' : formData.paymentMethod,
      amountReceived: !isDraftOrQuotation && formData.paymentMethod === 'cash' ? parseFloat(formData.amountReceived) : (isDraftOrQuotation ? 0 : totals.grandTotal),
      change: !isDraftOrQuotation && formData.paymentMethod === 'cash' ? change : 0,
      mobileMoneyReference: formData.mobileMoneyReference,
      paymentNote: formData.paymentNote,
      totalItems: totals.totalItems,
      netTotal: totals.netTotal,
      totalAfterDiscount: totals.totalAfterDiscount,
      grandTotal: totals.grandTotal,
      createdAt: new Date().toISOString(),
      saleStatus: 'Active'
    };

    // Get existing sales
    const existingSales = JSON.parse(localStorage.getItem('bms_sales') || '[]');
    
    // Add new sale
    existingSales.push(newSale);
    
    // Save to localStorage
    localStorage.setItem('bms_sales', JSON.stringify(existingSales));
    
    // Update inventory levels (final sales only — drafts/quotations don't affect stock)
    if (!isDraftOrQuotation) {
      updateInventory(saleItems);
    }
    
    return newSale;
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    const sale = saveSale();
    if (sale) {
      const docLabel = sale.status === 'quotation' ? 'Quotation' : sale.status === 'draft' ? 'Draft' : 'Sale';
      toast.success(`${docLabel} saved! Transaction ID: ${sale.transactionId}`);
      navigate('/sales/all');
    }
  };

  const handleSaveAndPrint = (e) => {
    e.preventDefault();
    
    const sale = saveSale();
    if (sale) {
      const docLabel = sale.status === 'quotation' ? 'Quotation' : sale.status === 'draft' ? 'Draft' : 'Sale';
      toast.success(`${docLabel} saved! Transaction ID: ${sale.transactionId}`);
      printInvoice(sale);
    }
  };

  const printInvoice = (sale) => {
    const printWindow = window.open('', '_blank');
    const settings = getSettings();
    const docType = sale.status === 'quotation' ? 'Quotation' : sale.status === 'draft' ? 'Draft' : 'Sales Invoice';
    const isPending = sale.status === 'draft' || sale.status === 'quotation';

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${docType} - ${sale.invoiceNo}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          .invoice-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .invoice-header h1 {
            margin: 0;
            color: #2c3e50;
          }
          .transaction-id {
            background-color: #f8f9fa;
            padding: 10px;
            margin: 20px 0;
            border-left: 4px solid #2c3e50;
          }
          .invoice-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .invoice-info div {
            flex: 1;
          }
          .invoice-info h3 {
            margin-top: 0;
            color: #2c3e50;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #2c3e50;
            color: white;
          }
          .totals {
            text-align: right;
            margin-top: 20px;
          }
          .totals table {
            margin-left: auto;
            width: 350px;
          }
          .totals th {
            background-color: #f8f9fa;
            color: #333;
          }
          .grand-total {
            font-size: 18px;
            font-weight: bold;
            background-color: #2c3e50 !important;
            color: white !important;
          }
          .payment-info {
            background-color: #e7f3ff;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          @media print {
            body {
              margin: 0;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <h1>${settings.businessName}</h1>
          <p>${docType}</p>
          ${settings.ownerName ? `<p>Owner: ${settings.ownerName}</p>` : ''}
          ${settings.address ? `<p>${settings.address}</p>` : ''}
          ${settings.phone ? `<p>Phone: ${settings.phone}</p>` : ''}
          ${settings.email ? `<p>Email: ${settings.email}</p>` : ''}
          ${settings.taxNumber ? `<p>Tax No: ${settings.taxNumber}</p>` : ''}
        </div>

        <div class="transaction-id">
          <strong>Transaction ID:</strong> ${sale.transactionId}
        </div>

        <div class="invoice-info">
          <div>
            <h3>Invoice Details</h3>
            <p><strong>Invoice No:</strong> ${sale.invoiceNo}</p>
            <p><strong>Date:</strong> ${new Date(sale.saleDate).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${sale.status.toUpperCase()}</p>
          </div>
          <div>
            <h3>Customer Details</h3>
            <p><strong>Name:</strong> ${sale.customerName}</p>
            <p><strong>Mobile:</strong> ${sale.customerMobile || 'N/A'}</p>
            <p><strong>Address:</strong> ${sale.billingAddress || 'N/A'}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>SKU</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Discount %</th>
              <th>Line Total</th>
            </tr>
          </thead>
          <tbody>
            ${sale.items.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.productName}</td>
                <td>${item.sku}</td>
                <td>${item.quantity}</td>
                <td>$${item.unitPrice.toFixed(2)}</td>
                <td>${item.discountPercent}%</td>
                <td>$${item.lineTotal.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <table>
            <tr>
              <th>Total Items:</th>
              <td>${sale.totalItems}</td>
            </tr>
            <tr>
              <th>Net Total:</th>
              <td>$${sale.netTotal.toFixed(2)}</td>
            </tr>
            <tr>
              <th>Discount:</th>
              <td>-$${sale.discount.toFixed(2)}</td>
            </tr>
            <tr class="grand-total">
              <th>Grand Total:</th>
              <td>$${sale.grandTotal.toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <div class="payment-info">
          <h3>Payment Information</h3>
          ${isPending ? `
            <p><strong>Payment Status:</strong> Pending — payment will be collected when this ${docType.toLowerCase()} is finalized.</p>
          ` : `
          <p><strong>Payment Method:</strong> ${sale.paymentMethod.toUpperCase()}</p>
          ${sale.paymentMethod === 'cash' ? `
            <p><strong>Amount Received:</strong> $${sale.amountReceived.toFixed(2)}</p>
            <p><strong>Change:</strong> $${sale.change.toFixed(2)}</p>
          ` : ''}
          ${sale.paymentMethod === 'mobile' ? `
            <p><strong>Mobile Money Reference:</strong> ${sale.mobileMoneyReference}</p>
          ` : ''}
          ${sale.paymentMethod === 'credit' ? `
            <p><strong>Payment Status:</strong> Credit Sale</p>
          ` : ''}
          `}
        </div>

        ${sale.sellNote ? `
          <div style="margin-top: 30px;">
            <h3>Notes:</h3>
            <p>${sale.sellNote}</p>
          </div>
        ` : ''}

        <div class="footer">
          <p>${settings.invoiceFooterText || 'Thank you for your business!'}</p>
          <p>Transaction completed on ${new Date().toLocaleString()}</p>
          ${isPending ? '' : '<p><strong>Inventory Updated:</strong> Stock levels have been automatically adjusted</p>'}
        </div>

        <div class="no-print" style="text-align: center; margin-top: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; background-color: #2c3e50; color: white; border: none; border-radius: 5px;">Print Invoice</button>
          <button onclick="window.close()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; margin-left: 10px; background-color: #6c757d; color: white; border: none; border-radius: 5px;">Close</button>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  };

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <h4 className="page-title">Add Sale - Sales Transaction Workflow</h4>
          </div>
        </Col>
      </Row>

      <Form>
        <Row>
          <Col xs={12}>
            <Card>
              <Card.Body>
                <h5 className="mb-3">Step 1: Customer Information</h5>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Customer:</Form.Label>
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
                        <Button variant="primary" size="sm" onClick={() => setShowCustomerModal(true)} title="Add New Customer">
                          <i className="mdi mdi-plus"></i>
                        </Button>
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Sale Date: <span className="text-danger">*</span></Form.Label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="mdi mdi-calendar"></i></span>
                        <Form.Control
                          type="date"
                          name="saleDate"
                          value={formData.saleDate}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Status: <span className="text-danger">*</span></Form.Label>
                      <Form.Select name="status" value={formData.status} onChange={handleInputChange} required>
                        <option value="final">Final</option>
                        <option value="draft">Draft</option>
                        <option value="quotation">Quotation</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Billing Address:</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="billingAddress"
                        value={formData.billingAddress}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Invoice Scheme:</Form.Label>
                      <Form.Select name="invoiceScheme" value={formData.invoiceScheme} onChange={handleInputChange}>
                        <option value="default">Default</option>
                        <option value="custom">Custom</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Invoice No.:</Form.Label>
                      <Form.Control
                        type="text"
                        name="invoiceNo"
                        placeholder="Auto-generated if blank"
                        value={formData.invoiceNo}
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
                <h5 className="mb-3">Step 2: Select Products & Validate Stock</h5>
                <div className="mb-3">
                  <Button variant="primary" size="sm" onClick={handleSearchProducts}>
                    <i className="mdi mdi-magnify me-1"></i> Search Products
                  </Button>
                </div>

                {saleItems.length > 0 && saleItems.some(item => item.quantity >= item.availableStock * 0.8) && (
                  <Alert variant="warning">
                    <i className="mdi mdi-alert me-2"></i>
                    Some products are running low on stock. Please verify quantities.
                  </Alert>
                )}

                <div className="table-responsive">
                  <Table className="table-bordered mb-0">
                    <thead className="table-primary">
                      <tr>
                        <th>#</th>
                        <th>Product Name</th>
                        <th>SKU</th>
                        <th>Available Stock</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Discount %</th>
                        <th>Unit Price After Discount</th>
                        <th>Line Total</th>
                        <th>Remove</th>
                      </tr>
                    </thead>
                    <tbody>
                      {saleItems.length > 0 ? (
                        saleItems.map((item, index) => (
                          <tr key={item.id} className={item.quantity > item.availableStock ? 'table-danger' : ''}>
                            <td>{index + 1}</td>
                            <td>{item.productName}</td>
                            <td>{item.sku}</td>
                            <td>
                              <span className={item.availableStock < 10 ? 'text-danger fw-bold' : ''}>
                                {item.availableStock}
                              </span>
                            </td>
                            <td>
                              <Form.Control
                                type="number"
                                size="sm"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                                min="1"
                                max={item.availableStock}
                                style={{ width: '80px' }}
                              />
                            </td>
                            <td>
                              <Form.Control
                                type="number"
                                size="sm"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
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
                            <td>${item.unitPriceAfterDiscount.toFixed(2)}</td>
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
                        ))
                      ) : (
                        <tr>
                          <td colSpan="10" className="text-center text-muted py-3">
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
                      <p className="mb-1">Net Total: <strong>${totals.netTotal.toFixed(2)}</strong></p>
                      <p className="mb-1">Discount: <strong>-${totals.discount.toFixed(2)}</strong></p>
                      <p className="mb-1">Order Tax: <strong>+${totals.taxAmount.toFixed(2)}</strong></p>
                      <p className="mb-1 h5">Grand Total: <strong>${totals.grandTotal.toFixed(2)}</strong></p>
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
                <h5 className="mb-3">Step 3: Review Transaction</h5>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Discount Type:</Form.Label>
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
                      <Form.Label>Order Tax:</Form.Label>
                      <Form.Select name="orderTax" value={formData.orderTax} onChange={handleInputChange}>
                        <option value="none">None</option>
                        {taxRates.filter(t => t.rate > 0).map(tax => (
                          <option key={tax.id} value={tax.id}>
                            {tax.name} ({tax.rate}%)
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Sell Note:</Form.Label>
                      <Form.Control
                        type="text"
                        name="sellNote"
                        value={formData.sellNote}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tax Amount:</Form.Label>
                      <div className="form-control-plaintext">
                        +${totals.taxAmount.toFixed(2)} ({totals.taxRate}%)
                      </div>
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
                <h5 className="mb-3">Step 4: Payment Processing</h5>
                {isDraftOrQuotation ? (
                  <Alert variant="secondary" className="mb-0">
                    <i className="mdi mdi-information me-2"></i>
                    Payment processing is not required for Draft or Quotation sales. It will be completed when the sale is finalized.
                  </Alert>
                ) : (
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Payment Method: <span className="text-danger">*</span></Form.Label>
                      <Form.Select name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange} required>
                        <option value="cash">Cash</option>
                        <option value="credit">Credit</option>
                        <option value="mobile">Mobile Money</option>
                        <option value="card">Card</option>
                        <option value="bank">Bank Transfer</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  {formData.paymentMethod === 'cash' && (
                    <>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Amount Received: <span className="text-danger">*</span></Form.Label>
                          <Form.Control
                            type="number"
                            step="0.01"
                            name="amountReceived"
                            placeholder="Enter amount received"
                            value={formData.amountReceived}
                            onChange={handleInputChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Change:</Form.Label>
                          <div className="form-control-plaintext fw-bold text-success">
                            ${change.toFixed(2)}
                          </div>
                        </Form.Group>
                      </Col>
                    </>
                  )}

                  {formData.paymentMethod === 'credit' && (
                    <Col md={8}>
                      <Alert variant="info">
                        <i className="mdi mdi-information me-2"></i>
                        Credit sale requires customer selection. System will check credit limit.
                      </Alert>
                    </Col>
                  )}

                  {formData.paymentMethod === 'mobile' && (
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Mobile Money Reference: <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          name="mobileMoneyReference"
                          placeholder="Enter transaction reference"
                          value={formData.mobileMoneyReference}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  )}

                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Payment Note:</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="paymentNote"
                        value={formData.paymentNote}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col xs={12}>
            <Card className="bg-light">
              <Card.Body>
                <h5 className="mb-3">Transaction Summary</h5>
                <Row>
                  <Col md={6}>
                    <p><strong>Total Items:</strong> {totals.totalItems}</p>
                    <p><strong>Payment Method:</strong> {isDraftOrQuotation ? 'N/A' : formData.paymentMethod.toUpperCase()}</p>
                    {formData.customer && (
                      <p><strong>Customer:</strong> {customers.find(c => c.id === formData.customer)?.name || 'Walk-In'}</p>
                    )}
                  </Col>
                  <Col md={6} className="text-end">
                    <p><strong>Net Total:</strong> ${totals.netTotal.toFixed(2)}</p>
                    <p><strong>Discount:</strong> -${totals.discount.toFixed(2)}</p>
                    <p><strong>Order Tax:</strong> +${totals.taxAmount.toFixed(2)}</p>
                    <h4 className="text-success"><strong>Grand Total:</strong> ${totals.grandTotal.toFixed(2)}</h4>
                    {!isDraftOrQuotation && formData.paymentMethod === 'cash' && formData.amountReceived && (
                      <p className="text-muted">Change: ${change.toFixed(2)}</p>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col xs={12}>
            <div className="text-end mb-3">
              <Button variant="secondary" className="me-2" onClick={() => navigate('/sales/all')}>
                Cancel
              </Button>
              <Button variant="info" className="me-2" onClick={handleSaveAndPrint}>
                <i className="mdi mdi-printer me-1"></i> Complete Sale & Print Receipt
              </Button>
              <Button variant="success" onClick={handleSave}>
                <i className="mdi mdi-content-save me-1"></i> Complete Sale
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
                  <th>Selling Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => {
                    const stock = product.currentStock || 0;
                    const isLowStock = stock < 10;
                    const isOutOfStock = stock <= 0;
                    
                    return (
                      <tr key={product.id} className={isOutOfStock ? 'table-danger' : isLowStock ? 'table-warning' : ''}>
                        <td>{product.name}</td>
                        <td>{product.sku}</td>
                        <td>${product.sellingPrice?.toFixed(2) || '0.00'}</td>
                        <td>
                          <span className={isOutOfStock ? 'text-danger fw-bold' : isLowStock ? 'text-warning fw-bold' : ''}>
                            {stock} {product.unit}
                          </span>
                        </td>
                        <td>
                          {isOutOfStock ? (
                            <span className="badge bg-danger">Out of Stock</span>
                          ) : isLowStock ? (
                            <span className="badge bg-warning">Low Stock</span>
                          ) : (
                            <span className="badge bg-success">In Stock</span>
                          )}
                        </td>
                        <td>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleAddProduct(product)}
                            disabled={isOutOfStock}
                          >
                            <i className="mdi mdi-plus me-1"></i> Add
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-3">
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

      {/* Add Customer Modal */}
      <Modal show={showCustomerModal} onHide={() => setShowCustomerModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Customer</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddCustomer}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="Enter customer name"
                value={newCustomer.name}
                onChange={handleNewCustomerChange}
                required
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mobile <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="mobile"
                placeholder="Enter mobile number"
                value={newCustomer.mobile}
                onChange={handleNewCustomerChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter email (optional)"
                value={newCustomer.email}
                onChange={handleNewCustomerChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCustomerModal(false)}>
              Cancel
            </Button>
            <Button variant="success" type="submit">
              <i className="mdi mdi-content-save me-1"></i> Save Customer
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default AddSalePage;
