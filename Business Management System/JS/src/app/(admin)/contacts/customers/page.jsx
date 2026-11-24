import { Card, Col, Row, Button, Modal, Form, Table, Badge, Tabs, Tab } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ActionsDropdown from '@/components/ActionsDropdown';
import { getSettings } from '@/helpers/settings';

const CustomersPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [showTopCustomersModal, setShowTopCustomersModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerHistory, setCustomerHistory] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [customers, setCustomers] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    contactType: 'customer',
    individual: true,
    business: false,
    contactId: '',
    customerGroup: '',
    mobile: '',
    alternateContactNumber: '',
    landline: '',
    email: '',
    assignedTo: '',
    creditLimit: 0,
    currentBalance: 0
  });

  const [creditData, setCreditData] = useState({
    creditLimit: 0
  });

  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    reference: '',
    notes: ''
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = () => {
    const storedCustomers = JSON.parse(localStorage.getItem('bms_customers') || '[]');
    // Calculate current balance for each customer
    const sales = JSON.parse(localStorage.getItem('bms_sales') || '[]');
    const payments = JSON.parse(localStorage.getItem('bms_customer_payments') || '[]');
    
    const customersWithBalance = storedCustomers.map(customer => {
      const customerSales = sales.filter(s => s.customerId === customer.id && s.paymentMethod === 'credit');
      const customerPayments = payments.filter(p => p.customerId === customer.id);
      
      const totalCredit = customerSales.reduce((sum, sale) => sum + (sale.grandTotal || 0), 0);
      const totalPaid = customerPayments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
      
      return {
        ...customer,
        currentBalance: totalCredit - totalPaid
      };
    });
    
    setCustomers(customersWithBalance);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditMode(false);
    setSelectedCustomer(null);
    setFormData({
      name: '',
      contactType: 'customer',
      individual: true,
      business: false,
      contactId: '',
      customerGroup: '',
      mobile: '',
      alternateContactNumber: '',
      landline: '',
      email: '',
      assignedTo: '',
      creditLimit: 0,
      currentBalance: 0
    });
  };

  const handleShow = () => {
    setEditMode(false);
    setShowModal(true);
  };

  const handleEdit = (customer) => {
    setEditMode(true);
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      contactType: customer.contactType,
      individual: customer.type === 'Individual',
      business: customer.type === 'Business',
      contactId: customer.contactId,
      customerGroup: customer.customerGroup || '',
      mobile: customer.mobile,
      alternateContactNumber: customer.alternateContactNumber || '',
      landline: customer.landline || '',
      email: customer.email || '',
      assignedTo: customer.assignedTo || '',
      creditLimit: customer.creditLimit || 0,
      currentBalance: customer.currentBalance || 0
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'radio' && name === 'contactTypeRadio') {
      setFormData({
        ...formData,
        individual: value === 'individual',
        business: value === 'business'
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.mobile) {
      toast.error('Name and Mobile are required');
      return;
    }

    if (editMode && selectedCustomer) {
      // Update existing customer
      const updatedCustomers = customers.map(customer => 
        customer.id === selectedCustomer.id
          ? {
              ...customer,
              name: formData.name,
              contactType: formData.contactType,
              type: formData.individual ? 'Individual' : 'Business',
              customerGroup: formData.customerGroup,
              mobile: formData.mobile,
              alternateContactNumber: formData.alternateContactNumber,
              landline: formData.landline,
              email: formData.email,
              assignedTo: formData.assignedTo,
              creditLimit: parseFloat(formData.creditLimit) || 0,
              updatedAt: new Date().toISOString()
            }
          : customer
      );
      
      localStorage.setItem('bms_customers', JSON.stringify(updatedCustomers));
      setCustomers(updatedCustomers);
      toast.success('Customer updated successfully!');
    } else {
      // Create new customer
      const newCustomer = {
        id: Date.now().toString(),
        name: formData.name,
        contactType: formData.contactType,
        type: formData.individual ? 'Individual' : 'Business',
        contactId: formData.contactId || `CUST-${Date.now()}`,
        customerGroup: formData.customerGroup,
        mobile: formData.mobile,
        alternateContactNumber: formData.alternateContactNumber,
        landline: formData.landline,
        email: formData.email,
        assignedTo: formData.assignedTo,
        creditLimit: parseFloat(formData.creditLimit) || 0,
        currentBalance: 0,
        status: 'Active',
        createdAt: new Date().toISOString()
      };

      const existingCustomers = JSON.parse(localStorage.getItem('bms_customers') || '[]');
      existingCustomers.push(newCustomer);
      localStorage.setItem('bms_customers', JSON.stringify(existingCustomers));
      
      setCustomers([...customers, newCustomer]);
      toast.success('Customer added successfully!');
    }
    
    handleClose();
  };

  const handleDelete = (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      const updatedCustomers = customers.filter(customer => customer.id !== customerId);
      localStorage.setItem('bms_customers', JSON.stringify(updatedCustomers));
      setCustomers(updatedCustomers);
      toast.success('Customer deleted successfully!');
    }
  };

  const handleViewHistory = (customer) => {
    setSelectedCustomer(customer);
    
    // Load customer purchase history
    const sales = JSON.parse(localStorage.getItem('bms_sales') || '[]');
    const customerSales = sales.filter(sale => sale.customerId === customer.id);
    
    // Calculate statistics
    const totalPurchases = customerSales.length;
    const totalSpent = customerSales.reduce((sum, sale) => sum + (sale.grandTotal || 0), 0);
    const avgOrderValue = totalPurchases > 0 ? totalSpent / totalPurchases : 0;
    
    // Get last purchase date
    const lastPurchase = customerSales.length > 0 
      ? new Date(Math.max(...customerSales.map(s => new Date(s.saleDate)))).toLocaleDateString()
      : 'Never';
    
    setCustomerHistory({
      sales: customerSales.sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate)),
      stats: {
        totalPurchases,
        totalSpent,
        avgOrderValue,
        lastPurchase
      }
    });
    
    setShowHistoryModal(true);
  };

  const handleManageCredit = (customer) => {
    setSelectedCustomer(customer);
    setCreditData({
      creditLimit: customer.creditLimit || 0
    });
    setShowCreditModal(true);
  };

  const handleCreditSubmit = (e) => {
    e.preventDefault();
    
    const updatedCustomers = customers.map(customer =>
      customer.id === selectedCustomer.id
        ? { ...customer, creditLimit: parseFloat(creditData.creditLimit) || 0 }
        : customer
    );
    
    localStorage.setItem('bms_customers', JSON.stringify(updatedCustomers));
    setCustomers(updatedCustomers);
    
    toast.success('Credit limit updated successfully!');
    setShowCreditModal(false);
  };

  const handleRecordPayment = (customer) => {
    setSelectedCustomer(customer);
    setPaymentData({
      amount: '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      reference: '',
      notes: ''
    });
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    
    const amount = parseFloat(paymentData.amount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }
    
    if (amount > selectedCustomer.currentBalance) {
      toast.error('Payment amount cannot exceed outstanding balance');
      return;
    }
    
    // Create payment record
    const payment = {
      id: Date.now().toString(),
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      amount: amount,
      paymentDate: paymentData.paymentDate,
      paymentMethod: paymentData.paymentMethod,
      reference: paymentData.reference,
      notes: paymentData.notes,
      createdAt: new Date().toISOString()
    };
    
    // Save payment
    const payments = JSON.parse(localStorage.getItem('bms_customer_payments') || '[]');
    payments.push(payment);
    localStorage.setItem('bms_customer_payments', JSON.stringify(payments));
    
    toast.success('Payment recorded successfully!');
    setShowPaymentModal(false);
    loadCustomers(); // Reload to update balances
  };

  const handleGenerateStatement = (customer) => {
    setSelectedCustomer(customer);
    
    // Load all transactions
    const sales = JSON.parse(localStorage.getItem('bms_sales') || '[]');
    const payments = JSON.parse(localStorage.getItem('bms_customer_payments') || '[]');
    
    const customerSales = sales.filter(s => s.customerId === customer.id && s.paymentMethod === 'credit');
    const customerPayments = payments.filter(p => p.customerId === customer.id);
    
    // Combine and sort by date
    const transactions = [
      ...customerSales.map(s => ({
        type: 'sale',
        date: s.saleDate,
        reference: s.invoiceNo,
        debit: s.grandTotal,
        credit: 0,
        description: `Sale - ${s.totalItems} items`
      })),
      ...customerPayments.map(p => ({
        type: 'payment',
        date: p.paymentDate,
        reference: p.reference || 'Payment',
        debit: 0,
        credit: p.amount,
        description: `Payment - ${p.paymentMethod}`
      }))
    ].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Calculate running balance
    let balance = 0;
    const transactionsWithBalance = transactions.map(t => {
      balance += t.debit - t.credit;
      return { ...t, balance };
    });
    
    setCustomerHistory({
      transactions: transactionsWithBalance,
      currentBalance: customer.currentBalance
    });
    
    setShowStatementModal(true);
  };

  const handleViewTopCustomers = () => {
    const sales = JSON.parse(localStorage.getItem('bms_sales') || '[]');
    
    // Calculate customer statistics
    const customerStats = {};
    sales.forEach(sale => {
      if (!customerStats[sale.customerId]) {
        customerStats[sale.customerId] = {
          customerId: sale.customerId,
          customerName: sale.customerName,
          totalPurchases: 0,
          totalSpent: 0,
          lastPurchase: sale.saleDate
        };
      }
      
      customerStats[sale.customerId].totalPurchases++;
      customerStats[sale.customerId].totalSpent += sale.grandTotal || 0;
      
      if (new Date(sale.saleDate) > new Date(customerStats[sale.customerId].lastPurchase)) {
        customerStats[sale.customerId].lastPurchase = sale.saleDate;
      }
    });
    
    // Sort by total spent
    const topCustomersList = Object.values(customerStats)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);
    
    setTopCustomers(topCustomersList);
    setShowTopCustomersModal(true);
  };

  const printStatement = () => {
    const printWindow = window.open('', '_blank');
    const settings = getSettings();
    
    const statementHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Customer Statement - ${selectedCustomer?.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .customer-info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #2c3e50; color: white; }
          .total-row { background-color: #f8f9fa; font-weight: bold; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${settings.businessName}</h1>
          ${settings.ownerName ? `<p>Owner: ${settings.ownerName}</p>` : ''}
          <p>${[settings.address, settings.phone && `Phone: ${settings.phone}`, settings.email && `Email: ${settings.email}`, settings.taxNumber && `Tax No: ${settings.taxNumber}`].filter(Boolean).join(' | ')}</p>
          <h2>Customer Account Statement</h2>
        </div>
        <div class="customer-info">
          <p><strong>Customer:</strong> ${selectedCustomer?.name}</p>
          <p><strong>Contact ID:</strong> ${selectedCustomer?.contactId}</p>
          <p><strong>Mobile:</strong> ${selectedCustomer?.mobile}</p>
          <p><strong>Statement Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Reference</th>
              <th>Description</th>
              <th>Debit</th>
              <th>Credit</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            ${customerHistory.transactions?.map(t => `
              <tr>
                <td>${new Date(t.date).toLocaleDateString()}</td>
                <td>${t.reference}</td>
                <td>${t.description}</td>
                <td>${t.debit > 0 ? '$' + t.debit.toFixed(2) : '-'}</td>
                <td>${t.credit > 0 ? '$' + t.credit.toFixed(2) : '-'}</td>
                <td>$${t.balance.toFixed(2)}</td>
              </tr>
            `).join('') || ''}
            <tr class="total-row">
              <td colspan="5">Current Balance</td>
              <td>$${customerHistory.currentBalance?.toFixed(2) || '0.00'}</td>
            </tr>
          </tbody>
        </table>
        <div class="no-print" style="text-align: center; margin-top: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">Print Statement</button>
          <button onclick="window.close()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; margin-left: 10px;">Close</button>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(statementHTML);
    printWindow.document.close();
  };

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <div className="page-title-right">
              <Button variant="info" className="me-2" onClick={handleViewTopCustomers}>
                <i className="mdi mdi-star me-1"></i> Top Customers
              </Button>
              <Button variant="primary" onClick={handleShow}>
                <i className="mdi mdi-plus-circle me-1"></i> Add Customer
              </Button>
            </div>
            <h4 className="page-title">Customers</h4>
          </div>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body>
              <h4 className="header-title mb-3">All Customers</h4>
              <p className="text-muted">Manage your customers, credit limits, and payments.</p>
              <div className="table-responsive">
                <Table className="table table-centered table-nowrap mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Contact ID</th>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Mobile</th>
                      <th>Email</th>
                      <th>Credit Limit</th>
                      <th>Balance</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.length > 0 ? (
                      customers.map((customer) => (
                        <tr key={customer.id}>
                          <td>{customer.contactId}</td>
                          <td>{customer.name}</td>
                          <td>{customer.type}</td>
                          <td>{customer.mobile}</td>
                          <td>{customer.email || '-'}</td>
                          <td>${(customer.creditLimit || 0).toFixed(2)}</td>
                          <td>
                            <span className={customer.currentBalance > 0 ? 'text-danger fw-bold' : 'text-success'}>
                              ${(customer.currentBalance || 0).toFixed(2)}
                            </span>
                          </td>
                          <td>
                            <Badge bg={customer.status === 'Active' ? 'success' : 'danger'}>
                              {customer.status}
                            </Badge>
                          </td>
                          <td>
                            <ActionsDropdown
                              onEdit={() => handleEdit(customer)}
                              onDelete={() => handleDelete(customer.id)}
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="text-center">No customers found</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add/Edit Customer Modal */}
      <Modal show={showModal} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Edit Customer' : 'Add a new customer'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Name: <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Customer Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Type:</Form.Label>
                  <Form.Check
                    type="radio"
                    label="Individual"
                    name="contactTypeRadio"
                    value="individual"
                    checked={formData.individual}
                    onChange={handleInputChange}
                  />
                  <Form.Check
                    type="radio"
                    label="Business"
                    name="contactTypeRadio"
                    value="business"
                    checked={formData.business}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Contact ID:</Form.Label>
                  <Form.Control
                    type="text"
                    name="contactId"
                    placeholder="Contact ID"
                    value={formData.contactId}
                    onChange={handleInputChange}
                    disabled={editMode}
                  />
                  <Form.Text className="text-muted">
                    Leave empty to autogenerate
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mobile: <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="mobile"
                    placeholder="Mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email:</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Customer Group:</Form.Label>
                  <Form.Select name="customerGroup" value={formData.customerGroup} onChange={handleInputChange}>
                    <option value="">None</option>
                    <option value="retail">Retail</option>
                    <option value="wholesale">Wholesale</option>
                    <option value="vip">VIP</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Credit Limit ($):</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="creditLimit"
                    placeholder="0.00"
                    value={formData.creditLimit}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" type="submit">
              {editMode ? 'Update' : 'Save'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Purchase History Modal */}
      <Modal show={showHistoryModal} onHide={() => setShowHistoryModal(false)} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="mdi mdi-history me-2"></i>
            Purchase History - {selectedCustomer?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {customerHistory.stats && (
            <>
              <Row className="mb-4">
                <Col md={3}>
                  <Card className="bg-primary text-white">
                    <Card.Body className="p-3">
                      <div className="text-center">
                        <h3 className="mb-1">{customerHistory.stats.totalPurchases}</h3>
                        <p className="mb-0 small">Total Purchases</p>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="bg-success text-white">
                    <Card.Body className="p-3">
                      <div className="text-center">
                        <h3 className="mb-1">${customerHistory.stats.totalSpent.toFixed(2)}</h3>
                        <p className="mb-0 small">Total Spent</p>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="bg-info text-white">
                    <Card.Body className="p-3">
                      <div className="text-center">
                        <h3 className="mb-1">${customerHistory.stats.avgOrderValue.toFixed(2)}</h3>
                        <p className="mb-0 small">Avg Order Value</p>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="bg-warning text-white">
                    <Card.Body className="p-3">
                      <div className="text-center">
                        <h3 className="mb-1 small">{customerHistory.stats.lastPurchase}</h3>
                        <p className="mb-0 small">Last Purchase</p>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <h5 className="mb-3">Purchase History</h5>
              <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <Table className="table-sm table-hover">
                  <thead className="table-light sticky-top">
                    <tr>
                      <th>Date</th>
                      <th>Invoice No.</th>
                      <th>Items</th>
                      <th>Payment Method</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerHistory.sales && customerHistory.sales.length > 0 ? (
                      customerHistory.sales.map((sale) => (
                        <tr key={sale.id}>
                          <td>{new Date(sale.saleDate).toLocaleDateString()}</td>
                          <td>
                            <span className="text-primary fw-bold">
                              {sale.invoiceNo}
                            </span>
                          </td>
                          <td>{sale.totalItems}</td>
                          <td>
                            <Badge bg="secondary">
                              {sale.paymentMethod?.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="text-success fw-bold">
                            ${sale.grandTotal.toFixed(2)}
                          </td>
                          <td>
                            <Badge bg={sale.status === 'final' ? 'success' : 'warning'}>
                              {sale.status}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-4">
                          No purchase history found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowHistoryModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Manage Credit Modal */}
      <Modal show={showCreditModal} onHide={() => setShowCreditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Manage Credit Limit - {selectedCustomer?.name}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreditSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Current Balance:</Form.Label>
              <div className="form-control-plaintext fw-bold text-danger">
                ${(selectedCustomer?.currentBalance || 0).toFixed(2)}
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Credit Limit ($): <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={creditData.creditLimit}
                onChange={(e) => setCreditData({ creditLimit: e.target.value })}
                required
              />
              <Form.Text className="text-muted">
                Set the maximum credit amount for this customer
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Update Credit Limit
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Record Payment - {selectedCustomer?.name}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handlePaymentSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Outstanding Balance:</Form.Label>
              <div className="form-control-plaintext fw-bold text-danger">
                ${(selectedCustomer?.currentBalance || 0).toFixed(2)}
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Payment Amount ($): <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={paymentData.amount}
                onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Payment Date:</Form.Label>
              <Form.Control
                type="date"
                value={paymentData.paymentDate}
                onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Payment Method:</Form.Label>
              <Form.Select
                value={paymentData.paymentMethod}
                onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="mobile">Mobile Money</option>
                <option value="bank">Bank Transfer</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Reference:</Form.Label>
              <Form.Control
                type="text"
                value={paymentData.reference}
                onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                placeholder="Payment reference/receipt number"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Notes:</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={paymentData.notes}
                onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
              Cancel
            </Button>
            <Button variant="success" type="submit">
              Record Payment
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Customer Statement Modal */}
      <Modal show={showStatementModal} onHide={() => setShowStatementModal(false)} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="mdi mdi-file-document me-2"></i>
            Customer Statement - {selectedCustomer?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <p><strong>Customer:</strong> {selectedCustomer?.name}</p>
            <p><strong>Contact ID:</strong> {selectedCustomer?.contactId}</p>
            <p><strong>Mobile:</strong> {selectedCustomer?.mobile}</p>
            <p><strong>Statement Date:</strong> {new Date().toLocaleDateString()}</p>
          </div>

          <div className="table-responsive">
            <Table className="table-bordered">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Reference</th>
                  <th>Description</th>
                  <th>Debit</th>
                  <th>Credit</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {customerHistory.transactions && customerHistory.transactions.length > 0 ? (
                  customerHistory.transactions.map((transaction, index) => (
                    <tr key={index}>
                      <td>{new Date(transaction.date).toLocaleDateString()}</td>
                      <td>{transaction.reference}</td>
                      <td>{transaction.description}</td>
                      <td className="text-danger">
                        {transaction.debit > 0 ? `$${transaction.debit.toFixed(2)}` : '-'}
                      </td>
                      <td className="text-success">
                        {transaction.credit > 0 ? `$${transaction.credit.toFixed(2)}` : '-'}
                      </td>
                      <td className="fw-bold">
                        ${transaction.balance.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      No transactions found
                    </td>
                  </tr>
                )}
                <tr className="table-primary">
                  <td colSpan="5" className="text-end fw-bold">Current Balance:</td>
                  <td className="fw-bold text-danger">
                    ${(customerHistory.currentBalance || 0).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatementModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={printStatement}>
            <i className="mdi mdi-printer me-1"></i> Print Statement
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Top Customers Modal */}
      <Modal show={showTopCustomersModal} onHide={() => setShowTopCustomersModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="mdi mdi-star me-2"></i>
            Top 10 Customers by Purchase Value
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="table-responsive">
            <Table className="table-hover">
              <thead className="table-light">
                <tr>
                  <th>Rank</th>
                  <th>Customer Name</th>
                  <th>Total Purchases</th>
                  <th>Total Spent</th>
                  <th>Last Purchase</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.length > 0 ? (
                  topCustomers.map((customer, index) => (
                    <tr key={customer.customerId}>
                      <td>
                        <Badge bg={index === 0 ? 'warning' : index === 1 ? 'secondary' : index === 2 ? 'danger' : 'primary'}>
                          #{index + 1}
                        </Badge>
                      </td>
                      <td className="fw-bold">{customer.customerName}</td>
                      <td>{customer.totalPurchases}</td>
                      <td className="text-success fw-bold">${customer.totalSpent.toFixed(2)}</td>
                      <td>{new Date(customer.lastPurchase).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">
                      No customer data available
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTopCustomersModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CustomersPage;
