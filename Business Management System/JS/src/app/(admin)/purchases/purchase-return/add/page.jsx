import { Card, Col, Row, Button, Form, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';

const AddPurchaseReturnPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    supplier: '',
    referenceNo: '',
    returnDate: new Date().toISOString().split('T')[0],
    businessLocation: '',
    attachDocument: null,
    address: '',
    discountType: 'none',
    discountAmount: '',
    returnTax: 'none',
    additionalNotes: '',
    shippingDetails: '',
    additionalShippingCharges: '',
    advanceBalance: '',
    paymentAccount: '',
    paidOn: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    paymentNote: ''
  });

  const [products, setProducts] = useState([]);
  const [fileName, setFileName] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      if (file) {
        if (file.type !== 'application/pdf') {
          alert('Only PDF files are allowed');
          e.target.value = '';
          return;
        }
        setFileName(file.name);
        setFormData({ ...formData, [name]: file });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <h4 className="page-title">
              Add Purchase Return <i className="mdi mdi-keyboard-backspace ms-2" style={{ cursor: 'pointer' }} onClick={() => navigate('/purchases/purchase-return')}></i>
            </h4>
          </div>
        </Col>
      </Row>

      <Form onSubmit={handleSubmit}>
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
                          <option value="supplier1">Supplier 1</option>
                          <option value="supplier2">Supplier 2</option>
                        </Form.Select>
                        <Button variant="primary" size="sm" type="button" onClick={() => navigate('/contacts/suppliers')} title="Add New Supplier">
                          <i className="mdi mdi-plus"></i>
                        </Button>
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Reference No: <i className="mdi mdi-information-outline"></i></Form.Label>
                      <Form.Control
                        type="text"
                        name="referenceNo"
                        value={formData.referenceNo}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Return Date: <span className="text-danger">*</span></Form.Label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="mdi mdi-calendar"></i></span>
                        <Form.Control
                          type="date"
                          name="returnDate"
                          value={formData.returnDate}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Business Location: <i className="mdi mdi-information-outline"></i></Form.Label>
                      <Form.Select name="businessLocation" value={formData.businessLocation} onChange={handleInputChange}>
                        <option value="">POSPlus BLOG001</option>
                        <option value="location1">Location 1</option>
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
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Attach Document:</Form.Label>
                      <div>
                        <Button variant="primary" size="sm" type="button" onClick={() => fileInputRef.current?.click()}>
                          <i className="mdi mdi-upload me-1"></i> Browse
                        </Button>
                        <Form.Control
                          type="file"
                          name="attachDocument"
                          accept="application/pdf,.pdf"
                          onChange={handleInputChange}
                          ref={fileInputRef}
                          className="d-none"
                        />
                        {fileName && (
                          <div className="mt-2 text-success">
                            <i className="mdi mdi-file-pdf-box me-1"></i>
                            {fileName}
                          </div>
                        )}
                        <Form.Text className="text-muted d-block">
                          Max File size: 5MB<br />
                          Allowed File: .pdf
                        </Form.Text>
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
                <div className="mb-3">
                  <Button variant="primary" size="sm">
                    <i className="mdi mdi-magnify me-1"></i> Search Products
                  </Button>
                  <Button variant="success" size="sm" className="ms-2">
                    <i className="mdi mdi-plus me-1"></i> Add new product
                  </Button>
                </div>

                <div className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Enter Product name / SKU / Scan bar code"
                    className="mb-2"
                  />
                </div>

                <div className="table-responsive">
                  <Table className="table-bordered mb-0">
                    <thead className="table-success">
                      <tr>
                        <th>#</th>
                        <th>Product Name</th>
                        <th>Return Quantity</th>
                        <th>Unit Cost (Before Tax)</th>
                        <th>Discount Percent</th>
                        <th>Unit Cost (Before Tax)</th>
                        <th>Line Total</th>
                        <th>Lot Number</th>
                        <th><i className="mdi mdi-delete"></i></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan="9" className="text-center text-muted py-3">
                          No products added
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </div>

                <Row className="mt-3">
                  <Col md={8}></Col>
                  <Col md={4}>
                    <div className="text-end">
                      <p className="mb-1">Total Items: <strong>0.00</strong></p>
                      <p className="mb-1">Net Total Amount: <strong>0.00</strong></p>
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
                        name="discountAmount"
                        placeholder="0"
                        value={formData.discountAmount}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Discount(-):</Form.Label>
                      <div className="form-control-plaintext">0.00</div>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Return Tax:</Form.Label>
                      <Form.Select name="returnTax" value={formData.returnTax} onChange={handleInputChange}>
                        <option value="none">None</option>
                        <option value="vat">VAT</option>
                        <option value="gst">GST</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Label>Return Tax: 0.00</Form.Label>
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
            <Card>
              <Card.Body>
                <h5 className="mb-3">Shipping Details:</h5>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="shippingDetails"
                        value={formData.shippingDetails}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>(+) Additional Shipping charges:</Form.Label>
                      <Form.Control
                        type="number"
                        name="additionalShippingCharges"
                        placeholder="0"
                        value={formData.additionalShippingCharges}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="text-end mt-3">
                  <h5>Return total: $ 0.00</h5>
                </div>
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
                      <Form.Label>Advance Balance (If Any): <i className="mdi mdi-information-outline"></i> Amount:</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="mdi mdi-currency-usd"></i></span>
                        <Form.Control
                          type="number"
                          name="advanceBalance"
                          placeholder="0.00"
                          value={formData.advanceBalance}
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
                        <Form.Select name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange}>
                          <option value="cash">Cash</option>
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
                        <Form.Select name="paymentAccount" value={formData.paymentAccount} onChange={handleInputChange}>
                          <option value="">None</option>
                          <option value="account1">Account 1</option>
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

                <div className="text-end">
                  <p className="mb-0">Payment due: 0.00</p>
                </div>
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

export default AddPurchaseReturnPage;
