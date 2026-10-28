import { Card, Col, Row, Button, Form, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const AddQuotationPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    location: '',
    typeOfService: '',
    customer: '',
    payTerm: '',
    quotationDate: new Date().toISOString().split('T')[0],
    billingAddress: '',
    invoiceScheme: '',
    referenceNo: '',
    attachDocument: null,
    selectTable: '',
    selectWaiter: '',
    discountType: 'percentage',
    discountAmount: '',
    orderTax: 'none',
    sellNote: '',
    shippingDetails: '',
    shippingAddress: '',
    shippingCharges: '',
    shippingStatus: '',
    deliveredTo: '',
    deliveryPerson: '',
    shippingDocuments: null
  });

  const [products, setProducts] = useState([]);

  const handleInputChange = (e) => {
    const { name, value, type, files, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'file' ? files[0] : type === 'checkbox' ? checked : value
    });
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
            <h4 className="page-title">Add Quotation</h4>
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
                      <Form.Label>
                        <i className="mdi mdi-home me-1"></i>
                        <Form.Select name="location" value={formData.location} onChange={handleInputChange} className="d-inline-block" style={{ width: 'auto' }}>
                          <option value="">POSPlus (BLOG1)</option>
                          <option value="location1">Location 1</option>
                        </Form.Select>
                        <i className="mdi mdi-information-outline ms-2"></i>
                      </Form.Label>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Select types of service"
                        name="typeOfService"
                        onChange={handleInputChange}
                      />
                      <Form.Select name="typeOfService" value={formData.typeOfService} onChange={handleInputChange} className="mt-2">
                        <option value="">Please Select</option>
                        <option value="dineIn">Dine In</option>
                        <option value="takeaway">Takeaway</option>
                        <option value="delivery">Delivery</option>
                      </Form.Select>
                      <i className="mdi mdi-information-outline"></i>
                    </Form.Group>
                  </Col>
                  <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Label>Subscribe?</Form.Label>
                      <i className="mdi mdi-information-outline ms-2"></i>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Customer: <span className="text-danger">*</span></Form.Label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="mdi mdi-account"></i></span>
                        <Form.Select name="customer" value={formData.customer} onChange={handleInputChange} required>
                          <option value="">Walk-In Customer</option>
                          <option value="customer1">Customer 1</option>
                        </Form.Select>
                        <Button variant="primary" size="sm">
                          <i className="mdi mdi-information-outline"></i>
                        </Button>
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Pay term:</Form.Label>
                      <Form.Select name="payTerm" value={formData.payTerm} onChange={handleInputChange}>
                        <option value="">Please Select</option>
                        <option value="cod">Cash on Delivery</option>
                        <option value="net30">Net 30</option>
                      </Form.Select>
                      <i className="mdi mdi-information-outline"></i>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Quotation Date: <span className="text-danger">*</span></Form.Label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="mdi mdi-calendar"></i></span>
                        <Form.Control
                          type="date"
                          name="quotationDate"
                          value={formData.quotationDate}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
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
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Invoice scheme:</Form.Label>
                      <Form.Select name="invoiceScheme" value={formData.invoiceScheme} onChange={handleInputChange}>
                        <option value="">Default</option>
                        <option value="custom">Custom</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Reference No.:</Form.Label>
                      <Form.Control
                        type="text"
                        name="referenceNo"
                        placeholder="Keep blank to auto generate"
                        value={formData.referenceNo}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
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
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <i className="mdi mdi-table-chair me-1"></i> Select table:
                      </Form.Label>
                      <Form.Select name="selectTable" value={formData.selectTable} onChange={handleInputChange}>
                        <option value="">Select table or seat</option>
                        <option value="table1">Table 1</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <i className="mdi mdi-account me-1"></i> Select waiter:
                      </Form.Label>
                      <Form.Select name="selectWaiter" value={formData.selectWaiter} onChange={handleInputChange}>
                        <option value="">Select service staff</option>
                        <option value="waiter1">Waiter 1</option>
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
                <div className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Enter Product name / SKU / Scan bar code"
                    className="mb-2"
                  />
                  <Button variant="link" size="sm">
                    <i className="mdi mdi-magnify me-1"></i>
                  </Button>
                </div>

                <div className="table-responsive">
                  <Table className="table-bordered mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Discount</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-3">
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
                      <p className="mb-1">Items: <strong>0.00</strong></p>
                      <p className="mb-1">Total: <strong>0.00</strong></p>
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
                      <Form.Label>Discount Type: <span className="text-danger">*</span></Form.Label>
                      <Form.Select name="discountType" value={formData.discountType} onChange={handleInputChange}>
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed</option>
                        <option value="none">None</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Discount Amount: <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="number"
                        name="discountAmount"
                        placeholder="0.00"
                        value={formData.discountAmount}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Discount Amount: 0.00</Form.Label>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Order Tax:</Form.Label>
                      <Form.Select name="orderTax" value={formData.orderTax} onChange={handleInputChange}>
                        <option value="none">None</option>
                        <option value="vat">VAT</option>
                        <option value="gst">GST</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Label>Order Tax: 0.00</Form.Label>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Sell note:</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
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
            <Card>
              <Card.Body>
                <h5 className="mb-3">Shipping Details</h5>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="shippingDetails"
                        placeholder="Shipping Details"
                        value={formData.shippingDetails}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="shippingAddress"
                        placeholder="Shipping Address"
                        value={formData.shippingAddress}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Control
                        type="number"
                        name="shippingCharges"
                        placeholder="0.00"
                        value={formData.shippingCharges}
                        onChange={handleInputChange}
                      />
                      <Form.Label className="mt-2">Shipping Charges</Form.Label>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Shipping Status:</Form.Label>
                      <Form.Select name="shippingStatus" value={formData.shippingStatus} onChange={handleInputChange}>
                        <option value="">Please Select</option>
                        <option value="ordered">Ordered</option>
                        <option value="packed">Packed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Delivered to:</Form.Label>
                      <Form.Select name="deliveredTo" value={formData.deliveredTo} onChange={handleInputChange}>
                        <option value="">Please Select</option>
                        <option value="customer">Customer</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Delivery Person:</Form.Label>
                      <Form.Select name="deliveryPerson" value={formData.deliveryPerson} onChange={handleInputChange}>
                        <option value="">Please Select</option>
                        <option value="person1">Person 1</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Shipping Documents:</Form.Label>
                      <div>
                        <Button variant="primary" size="sm">
                          <i className="mdi mdi-upload me-1"></i> Browse
                        </Button>
                        <Form.Control
                          type="file"
                          name="shippingDocuments"
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

                <div className="text-end">
                  <Button variant="primary" size="sm">
                    <i className="mdi mdi-plus me-1"></i> Add additional expenses
                  </Button>
                </div>

                <div className="text-end mt-3">
                  <h5>Total Payable: $ 0.00</h5>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col xs={12}>
            <div className="text-center mb-3">
              <Button variant="primary" size="lg" type="submit" className="me-2">
                Save
              </Button>
              <Button variant="success" size="lg" type="submit">
                Save and print
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default AddQuotationPage;
