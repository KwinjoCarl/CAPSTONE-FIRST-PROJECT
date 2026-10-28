import { Card, Col, Row, Button, Form, Nav, Alert } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getSettings, saveSettings } from '@/helpers/settings';

const BusinessSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('business');
  const [formData, setFormData] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFormData(getSettings());
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setSaved(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveSettings(formData);
    setSaved(true);
    toast.success('Business settings saved successfully');
  };

  const tabs = [
    { key: 'business', label: 'Business', icon: 'mdi-domain' },
    { key: 'currency', label: 'Currency', icon: 'mdi-cash' },
    { key: 'product', label: 'Product', icon: 'mdi-package-variant' },
    { key: 'invoice', label: 'Invoice', icon: 'mdi-receipt' },
    { key: 'sales', label: 'Sales', icon: 'mdi-cart' }
  ];

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <h4 className="page-title">Business Settings</h4>
          </div>
        </Col>
      </Row>

      {saved && (
        <Row>
          <Col xs={12}>
            <Alert variant="success" dismissible onClose={() => setSaved(false)}>
              <i className="mdi mdi-check-circle me-2"></i>
              Settings saved. Changes take effect immediately across the system.
            </Alert>
          </Col>
        </Row>
      )}

      <Row>
        <Col lg={3}>
          <Card>
            <Card.Body className="p-0">
              <Nav className="flex-column">
                {tabs.map(tab => (
                  <Nav.Link
                    key={tab.key}
                    className={activeTab === tab.key ? 'active bg-primary text-white' : ''}
                    onClick={() => setActiveTab(tab.key)}
                    style={{ cursor: 'pointer', borderRadius: 0 }}
                  >
                    <i className={`mdi ${tab.icon} me-2`}></i>
                    {tab.label}
                  </Nav.Link>
                ))}
              </Nav>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={9}>
          <Card>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {activeTab === 'business' && (
                  <>
                    <h5 className="mb-3 text-uppercase bg-light p-2">
                      <i className="mdi mdi-domain me-1"></i> Business Information
                    </h5>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Business Name <span className="text-danger">*</span></Form.Label>
                          <Form.Control name="businessName" value={formData.businessName || ''} onChange={handleChange} required />
                          <Form.Text className="text-muted">Shown on invoices and receipts.</Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Owner Name</Form.Label>
                          <Form.Control name="ownerName" value={formData.ownerName || ''} onChange={handleChange} />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Tax Number / BP Number</Form.Label>
                          <Form.Control name="taxNumber" value={formData.taxNumber || ''} onChange={handleChange} />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Phone</Form.Label>
                          <Form.Control name="phone" value={formData.phone || ''} onChange={handleChange} />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Email</Form.Label>
                          <Form.Control type="email" name="email" value={formData.email || ''} onChange={handleChange} />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Address</Form.Label>
                          <Form.Control as="textarea" rows={2} name="address" value={formData.address || ''} onChange={handleChange} />
                        </Form.Group>
                      </Col>
                    </Row>
                  </>
                )}

                {activeTab === 'currency' && (
                  <>
                    <h5 className="mb-3 text-uppercase bg-light p-2">
                      <i className="mdi mdi-cash me-1"></i> Currency &amp; Number Format
                    </h5>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Currency Symbol</Form.Label>
                          <Form.Control name="currencySymbol" value={formData.currencySymbol || '$'} onChange={handleChange} maxLength={3} />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Currency Symbol Position</Form.Label>
                          <Form.Select name="currencyPosition" value={formData.currencyPosition || 'before'} onChange={handleChange}>
                            <option value="before">Before amount ($ 100.00)</option>
                            <option value="after">After amount (100.00$)</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Decimals</Form.Label>
                          <Form.Select name="decimals" value={formData.decimals ?? 2} onChange={handleChange}>
                            <option value={0}>0</option>
                            <option value={2}>2</option>
                            <option value={4}>4</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Decimal Separator</Form.Label>
                          <Form.Select name="decimalSeparator" value={formData.decimalSeparator || '.'} onChange={handleChange}>
                            <option value=".">Dot ( . )</option>
                            <option value=",">Comma ( , )</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Thousand Separator</Form.Label>
                          <Form.Select name="thousandSeparator" value={formData.thousandSeparator || ','} onChange={handleChange}>
                            <option value=",">Comma ( , )</option>
                            <option value=".">Dot ( . )</option>
                            <option value=" ">Space ( )</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                  </>
                )}

                {activeTab === 'product' && (
                  <>
                    <h5 className="mb-3 text-uppercase bg-light p-2">
                      <i className="mdi mdi-package-variant me-1"></i> Product Defaults
                    </h5>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Default Alert Quantity</Form.Label>
                          <Form.Control type="number" name="defaultAlertQuantity" value={formData.defaultAlertQuantity ?? 10} onChange={handleChange} min={0} />
                          <Form.Text className="text-muted">Used as low-stock threshold for new products.</Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Default Profit Margin (%)</Form.Label>
                          <Form.Control type="number" name="defaultProfitMargin" value={formData.defaultProfitMargin ?? 25} onChange={handleChange} min={0} />
                          <Form.Text className="text-muted">Pre-filled margin on the Add Product form.</Form.Text>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>SKU Prefix</Form.Label>
                          <Form.Control name="skuPrefix" value={formData.skuPrefix || 'SKU-'} onChange={handleChange} />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3 mt-4">
                          <Form.Check
                            type="checkbox"
                            label="Enable low stock alerts"
                            name="enableLowStockAlert"
                            checked={!!formData.enableLowStockAlert}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </>
                )}

                {activeTab === 'invoice' && (
                  <>
                    <h5 className="mb-3 text-uppercase bg-light p-2">
                      <i className="mdi mdi-receipt me-1"></i> Invoice Settings
                    </h5>
                    <Row>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>Invoice Prefix</Form.Label>
                          <Form.Control name="invoicePrefix" value={formData.invoicePrefix || 'INV-'} onChange={handleChange} />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>Next Invoice Number</Form.Label>
                          <Form.Control type="number" name="invoiceNextNumber" value={formData.invoiceNextNumber ?? 1} onChange={handleChange} min={1} />
                          <Form.Text className="text-muted">Next sale uses this number, then increments.</Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>Purchase Prefix</Form.Label>
                          <Form.Control name="purchasePrefix" value={formData.purchasePrefix || 'PUR-'} onChange={handleChange} />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>Expense Prefix</Form.Label>
                          <Form.Control name="expensePrefix" value={formData.expensePrefix || 'EXP-'} onChange={handleChange} />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>Invoice Footer Text</Form.Label>
                          <Form.Control as="textarea" rows={2} name="invoiceFooterText" value={formData.invoiceFooterText || ''} onChange={handleChange} />
                          <Form.Text className="text-muted">Printed at the bottom of every invoice/receipt.</Form.Text>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Check
                            type="checkbox"
                            label="Show customer address on invoice"
                            name="showCustomerAddress"
                            checked={!!formData.showCustomerAddress}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Check
                            type="checkbox"
                            label="Show SKU column on invoice"
                            name="showItemSku"
                            checked={!!formData.showItemSku}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </>
                )}

                {activeTab === 'sales' && (
                  <>
                    <h5 className="mb-3 text-uppercase bg-light p-2">
                      <i className="mdi mdi-cart me-1"></i> Sales Settings
                    </h5>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Default Sale Discount ($)</Form.Label>
                          <Form.Control type="number" step="0.01" name="defaultSaleDiscount" value={formData.defaultSaleDiscount ?? 0} onChange={handleChange} min={0} />
                          <Form.Text className="text-muted">Pre-filled discount on the Add Sale form.</Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3 mt-4">
                          <Form.Check
                            type="checkbox"
                            label="Allow overselling (sell without stock)"
                            name="allowOverselling"
                            checked={!!formData.allowOverselling}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </>
                )}

                <div className="text-center mt-4">
                  <Button variant="primary" size="lg" type="submit">
                    <i className="mdi mdi-content-save me-1"></i> Update Settings
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default BusinessSettingsPage;
