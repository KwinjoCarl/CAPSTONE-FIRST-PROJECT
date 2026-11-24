import { Card, Col, Row, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getTaxRates, getPaymentAccounts, getSettings, getLocations } from '@/helpers/settings';

const AddExpensePage = () => {
  const navigate = useNavigate();
  const [taxRates, setTaxRates] = useState([]);
  const [paymentAccounts, setPaymentAccounts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const locations = getLocations();
  const defaultLocation = locations.find((l) => l.isDefault)?.name || locations[0]?.name || '';

  const safeParse = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      return [];
    }
  };

  useEffect(() => {
    setTaxRates(getTaxRates());
    setPaymentAccounts(getPaymentAccounts());
    setCustomers(safeParse('bms_customers'));
    setSuppliers(safeParse('bms_suppliers'));
  }, []);

  const [formData, setFormData] = useState({
    businessLocation: defaultLocation,
    expenseCategory: '',
    subCategory: '',
    referenceNo: '',
    date: new Date().toISOString().split('T')[0],
    expenseFor: '',
    expenseForContact: '',
    applicableTax: '',
    totalAmount: '',
    attachDocument: null,
    expenseNote: '',
    isRecurring: false,
    recurringInterval: '',
    noOfRepetitions: '',
    amount: '',
    paidOn: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    paymentAccount: '',
    paymentNote: ''
  });

  const handleInputChange = (e) => {
    const { name, value, type, files, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'file' ? files[0] : type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
      toast.error('Please enter a valid total amount');
      return;
    }

    // Create expense object
    const newExpense = {
      id: Date.now().toString(),
      businessLocation: formData.businessLocation,
      expenseCategory: formData.expenseCategory,
      subCategory: formData.subCategory,
      referenceNo: formData.referenceNo || `${getSettings().expensePrefix || 'EXP-'}${Date.now()}`,
      date: formData.date,
      expenseFor: formData.expenseFor,
      expenseForContact: formData.expenseForContact,
      applicableTax: formData.applicableTax,
      totalAmount: formData.totalAmount,
      expenseNote: formData.expenseNote,
      isRecurring: formData.isRecurring,
      recurringInterval: formData.recurringInterval,
      noOfRepetitions: formData.noOfRepetitions,
      amount: formData.amount,
      paidOn: formData.paidOn,
      paymentMethod: formData.paymentMethod,
      paymentAccount: formData.paymentAccount,
      paymentNote: formData.paymentNote,
      createdAt: new Date().toISOString(),
      status: 'Active'
    };

    // Get existing expenses
    const existingExpenses = safeParse('bms_expenses');
    
    // Add new expense
    existingExpenses.push(newExpense);
    
    // Save to localStorage
    localStorage.setItem('bms_expenses', JSON.stringify(existingExpenses));
    
    toast.success('Expense saved successfully!');
    navigate('/expenses/list');
  };

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <h4 className="page-title">Add Expense</h4>
          </div>
        </Col>
      </Row>

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col xs={12}>
            <Card>
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Business Location: <span className="text-danger">*</span></Form.Label>
                      <Form.Select 
                        name="businessLocation" 
                        value={formData.businessLocation} 
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Location</option>
                        {locations.map((loc) => (
                          <option key={loc.id} value={loc.name}>{loc.name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Expense Category:</Form.Label>
                      <Form.Select 
                        name="expenseCategory" 
                        value={formData.expenseCategory} 
                        onChange={handleInputChange}
                      >
                        <option value="">Please Select</option>
                        <option value="category1">Category 1</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Sub-category:</Form.Label>
                      <Form.Select 
                        name="subCategory" 
                        value={formData.subCategory} 
                        onChange={handleInputChange}
                      >
                        <option value="">Please Select</option>
                        <option value="sub1">Sub 1</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Reference No.:</Form.Label>
                      <Form.Control
                        type="text"
                        name="referenceNo"
                        placeholder="Leave empty to autogenerate"
                        value={formData.referenceNo}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
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
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Expense for: <i className="mdi mdi-information-outline"></i></Form.Label>
                      <Form.Select 
                        name="expenseFor" 
                        value={formData.expenseFor} 
                        onChange={handleInputChange}
                      >
                        <option value="">None</option>
                        <option value="user">User</option>
                        <option value="customer">Customer</option>
                        <option value="supplier">Supplier</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Expense for contact:</Form.Label>
                      <Form.Select 
                        name="expenseForContact" 
                        value={formData.expenseForContact} 
                        onChange={handleInputChange}
                      >
                        <option value="">Please Select</option>
                        <optgroup label="Customers">
                          {customers.map((c) => (
                            <option key={`cust-${c.id}`} value={`${c.name} (${c.mobile || 'no phone'})`}>
                              {c.name}{c.mobile ? ` - ${c.mobile}` : ''}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Suppliers">
                          {suppliers.map((s) => (
                            <option key={`supp-${s.id}`} value={`${s.name} (${s.mobile || 'no phone'})`}>
                              {s.name}{s.mobile ? ` - ${s.mobile}` : ''}
                            </option>
                          ))}
                        </optgroup>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Applicable tax:</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="mdi mdi-information-outline"></i></span>
                        <Form.Select
                          name="applicableTax"
                          value={formData.applicableTax}
                          onChange={handleInputChange}
                        >
                          <option value="">None</option>
                          {taxRates.filter(t => t.rate > 0).map(tax => (
                            <option key={tax.id} value={tax.name}>
                              {tax.name} ({tax.rate}%)
                            </option>
                          ))}
                        </Form.Select>
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Total amount: <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="number"
                        name="totalAmount"
                        placeholder="Total amount"
                        value={formData.totalAmount}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Attach Document:</Form.Label>
                      <div>
                        <Button variant="primary" size="sm">
                          <i className="mdi mdi-upload me-1"></i> Browse
                        </Button>
                        <Form.Control
                          type="file"
                          name="attachDocument"
                          onChange={handleInputChange}
                          className="d-none"
                        />
                        <Form.Text className="text-muted d-block">
                          Max File size: 5MB<br />
                          Allowed File: .pdf, .csv, .zip, .doc, .docx, .jpeg, .jpg, .png, .gif
                        </Form.Text>
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Expense note:</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="expenseNote"
                        value={formData.expenseNote}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Is Recurring? "
                        name="isRecurring"
                        checked={formData.isRecurring}
                        onChange={handleInputChange}
                      />
                      <i className="mdi mdi-information-outline"></i>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Recurring interval:</Form.Label>
                      <Form.Select 
                        name="recurringInterval" 
                        value={formData.recurringInterval} 
                        onChange={handleInputChange}
                        disabled={!formData.isRecurring}
                      >
                        <option value="">Days</option>
                        <option value="weeks">Weeks</option>
                        <option value="months">Months</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>No. of Repetitions:</Form.Label>
                      <Form.Control
                        type="number"
                        name="noOfRepetitions"
                        value={formData.noOfRepetitions}
                        onChange={handleInputChange}
                        disabled={!formData.isRecurring}
                      />
                      <Form.Text className="text-muted">
                        If blank expense will be generated infinite times
                      </Form.Text>
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
                <h5 className="mb-3">Add payment</h5>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Amount: <span className="text-danger">*</span></Form.Label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="mdi mdi-currency-usd"></i></span>
                        <Form.Control
                          type="number"
                          name="amount"
                          placeholder="0.00"
                          value={formData.amount}
                          onChange={handleInputChange}
                        />
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Paid on: <span className="text-danger">*</span></Form.Label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="mdi mdi-calendar"></i></span>
                        <Form.Control
                          type="date"
                          name="paidOn"
                          value={formData.paidOn}
                          onChange={handleInputChange}
                        />
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Payment Method: <span className="text-danger">*</span></Form.Label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="mdi mdi-cash"></i></span>
                        <Form.Select 
                          name="paymentMethod" 
                          value={formData.paymentMethod} 
                          onChange={handleInputChange}
                        >
                          <option value="">Cash</option>
                          <option value="card">Card</option>
                          <option value="bank">Bank Transfer</option>
                        </Form.Select>
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Payment Account:</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="mdi mdi-cash"></i></span>
                        <Form.Select
                          name="paymentAccount"
                          value={formData.paymentAccount}
                          onChange={handleInputChange}
                        >
                          <option value="">None</option>
                          {paymentAccounts.map(acct => (
                            <option key={acct.id} value={acct.name}>
                              {acct.name}{acct.accountNumber ? ` (${acct.accountNumber})` : ''}
                            </option>
                          ))}
                        </Form.Select>
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Payment note:</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="paymentNote"
                        value={formData.paymentNote}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <div className="text-end">
                      <p className="mb-0"><strong>Payment due: 0.00</strong></p>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col xs={12}>
            <div className="text-center mb-3">
              <Button variant="primary" size="lg" type="submit">
                Save
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default AddExpensePage;
