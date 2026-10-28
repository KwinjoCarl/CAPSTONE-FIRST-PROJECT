import { Card, Col, Row, Button, Form, Alert } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getSettings, saveSettings } from '@/helpers/settings';

const InvoiceSettingsPage = () => {
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
    toast.success('Invoice settings saved successfully');
  };

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <h4 className="page-title">Invoice Settings</h4>
          </div>
        </Col>
      </Row>

      {saved && (
        <Row>
          <Col xs={12}>
            <Alert variant="success" dismissible onClose={() => setSaved(false)}>
              <i className="mdi mdi-check-circle me-2"></i>
              Invoice settings saved. New sales will use the updated numbering and layout.
            </Alert>
          </Col>
        </Row>
      )}

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col lg={8}>
            <Card>
              <Card.Body>
                <h5 className="mb-3 text-uppercase bg-light p-2">
                  <i className="mdi mdi-numeric me-1"></i> Invoice Numbering
                </h5>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Invoice Prefix</Form.Label>
                      <Form.Control name="invoicePrefix" value={formData.invoicePrefix || 'INV-'} onChange={handleChange} />
                      <Form.Text className="text-muted">e.g. INV-, BMS-</Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Next Invoice Number</Form.Label>
                      <Form.Control type="number" name="invoiceNextNumber" min={1} value={formData.invoiceNextNumber ?? 1} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                </Row>
                <Alert variant="info">
                  <strong>Preview:</strong> Next invoice will be numbered{' '}
                  <code>{(formData.invoicePrefix || 'INV-') + String(formData.invoiceNextNumber ?? 1).padStart(5, '0')}</code>
                </Alert>

                <h5 className="mb-3 mt-4 text-uppercase bg-light p-2">
                  <i className="mdi mdi-format-columns me-1"></i> Invoice Layout
                </h5>
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
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Invoice Footer Text</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="invoiceFooterText"
                        value={formData.invoiceFooterText || ''}
                        onChange={handleChange}
                      />
                      <Form.Text className="text-muted">
                        Printed at the bottom of every invoice and receipt.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <h5 className="mb-3 mt-4 text-uppercase bg-light p-2">
                  <i className="mdi mdi-file-document-outline me-1"></i> Other Document Prefixes
                </h5>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Purchase Prefix</Form.Label>
                      <Form.Control name="purchasePrefix" value={formData.purchasePrefix || 'PUR-'} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Expense Prefix</Form.Label>
                      <Form.Control name="expensePrefix" value={formData.expensePrefix || 'EXP-'} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Adjustment Prefix</Form.Label>
                      <Form.Control name="adjustmentPrefix" value={formData.adjustmentPrefix || 'ADJ-'} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col lg={8}>
            <div className="text-center mb-3">
              <Button variant="primary" size="lg" type="submit">
                <i className="mdi mdi-content-save me-1"></i> Update Settings
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default InvoiceSettingsPage;
