import { Card, Col, Row, Button, Form, Table, Modal, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const EditSalePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [customers, setCustomers] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    customer: '',
    customerName: '',
    customerMobile: '',
    saleDate: '',
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

  useEffect(() => {
    const storedCustomers = JSON.parse(localStorage.getItem('bms_customers') || '[]');
    setCustomers(storedCustomers);
    
    const storedProducts = JSON.parse(localStorage.getItem('bms_products') || '[]');
    setAvailableProducts(storedProducts);

    const sales = JSON.parse(localStorage.getItem('bms_sales') || '[]');
    const sale = sales.find(s => s.id === id);
    
    if (sale) {
      setFormData({
        customer: sale.customer || '',
        customerName: sale.customerName || '',
        customerMobile: sale.customerMobile || '',
        saleDate: sale.saleDate || '',
        billingAddress: sale.billingAddress || '',
        status: sale.status || 'final',
        invoiceScheme: sale.invoiceScheme || 'default',
        invoiceNo: sale.invoiceNo || '',
        discountType: sale.discountType || 'none',
        discountAmount: sale.discountAmount || '',
        orderTax: sale.orderTax || 'none',
        sellNote: sale.sellNote || '',
        paymentMethod: sale.paymentMethod || 'cash',
        amountReceived: sale.amountReceived || '',
        mobileMoneyReference: sale.mobileMoneyReference || '',
        paymentNote: sale.paymentNote || ''
      });
      setSaleItems(sale.items || []);
    } else {
      toast.error('Sale not found');
      navigate('/sales/all');
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
    const existingItem = saleItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      toast.warning('Product already added to sale');
      return;
    }

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
    toast.success('SUCCESSFUL');
  };

  const handleItemChange = (itemId, field, value) => {
    setSaleItems(saleItems.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: parseFloat(value) || 0 };
        
        if (field === 'quantity' && updatedItem.quantity > item.availableStock) {
          toast.error(`Only ${item.availableStock} units available in stock`);
          return item;
        }
        
        if (field === 'quantity' || field === 'unitPrice' || field === 'discountPercent') {
          const discount = (updatedItem.unitPrice * updatedItem.discountPercent) / 100;
          updatedItem.unitPriceAfterDiscount = updatedItem.unitPrice - discount;
          updatedItem.lineTotal = updatedItem.quantity * updatedItem.unitPriceAfterDiscount;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const handleRemoveItem = (itemId) => {
    setSaleItems(saleItems.filter(item => item.id !== itemId));
  };

  const calculateTotals = () => {
    const subtotal = saleItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const totalItems = saleItems.reduce((sum, item) => sum + item.quantity, 0);
    
    let discount = 0;
    if (formData.discountType === 'fixed') {
      discount = parseFloat(formData.discountAmount) || 0;
    } else if (formData.discountType === 'percentage') {
      discount = (subtotal * (parseFloat(formData.discountAmount) || 0)) / 100;
    }
    
    const grandTotal = subtotal - discount;
    
    return { subtotal, discount, grandTotal, totalItems };
  };

  const totals = calculateTotals();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (saleItems.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    const sales = JSON.parse(localStorage.getItem('bms_sales') || '[]');
    const saleIndex = sales.findIndex(s => s.id === id);
    
    if (saleIndex === -1) {
      toast.error('Sale not found');
      return;
    }

    const updatedSale = {
      ...sales[saleIndex],
      customer: formData.customer,
      customerName: formData.customerName,
      customerMobile: formData.customerMobile,
      saleDate: formData.saleDate,
      billingAddress: formData.billingAddress,
      status: formData.status,
      invoiceNo: formData.invoiceNo,
      discountType: formData.discountType,
      discountAmount: formData.discountAmount,
      orderTax: formData.orderTax,
      sellNote: formData.sellNote,
      paymentMethod: formData.paymentMethod,
      amountReceived: formData.amountReceived,
      mobileMoneyReference: formData.mobileMoneyReference,
      paymentNote: formData.paymentNote,
      items: saleItems,
      subtotal: totals.subtotal,
      discount: totals.discount,
      grandTotal: totals.grandTotal,
      totalItems: totals.totalItems,
      updatedAt: new Date().toISOString()
    };

    sales[saleIndex] = updatedSale;
    localStorage.setItem('bms_sales', JSON.stringify(sales));

    toast.success('SUCCESSFUL');
    navigate('/sales/all');
  };

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <div className="page-title-right">
              <Button variant="secondary" onClick={() => navigate('/sales/all')}>
                <i className="mdi mdi-arrow-left me-1"></i> Back to Sales
              </Button>
            </div>
            <h4 className="page-title">Edit/View Sale</h4>
          </div>
        </Col>
      </Row>

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col xs={12}>
            <Card>
              <Card.Body>
                <h5 className="mb-3 text-uppercase bg-light p-2">
                  <i className="mdi mdi-account me-1"></i> Customer Information
                </h5>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Customer Name <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Mobile Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="customerMobile"
                        value={formData.customerMobile}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Sale Date <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="date"
                        name="saleDate"
                        value={formData.saleDate}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Invoice No</Form.Label>
                      <Form.Control
                        type="text"
                        name="invoiceNo"
                        value={formData.invoiceNo}
                        onChange={handleInputChange}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Status</Form.Label>
                      <Form.Select name="status" value={formData.status} onChange={handleInputChange}>
                        <option value="final">Final</option>
                        <option value="draft">Draft</option>
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
                    <i className="mdi mdi-cart me-1"></i> Sale Items
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
                        <th>Unit Price</th>
                        <th>Discount %</th>
                        <th>Line Total</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {saleItems.map((item) => (
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
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
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
                      {saleItems.length === 0 && (
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
                      <Form.Label>Sell Note</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="sellNote"
                        value={formData.sellNote}
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
              <Button variant="secondary" className="me-2" onClick={() => navigate('/sales/all')}>
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
                  <th>Stock</th>
                  <th>Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.sku}</td>
                    <td>{product.currentStock || 0}</td>
                    <td>${product.sellingPrice?.toFixed(2)}</td>
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

export default EditSalePage;
