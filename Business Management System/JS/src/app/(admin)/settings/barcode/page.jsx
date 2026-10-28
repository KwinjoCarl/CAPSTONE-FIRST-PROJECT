import { Card, Col, Row, Button, Form, Alert } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getSettings, saveSettings } from '@/helpers/settings';

const BARCODE_TYPES = [
  { value: 'CODE128', label: 'Code 128 (default)' },
  { value: 'CODE39', label: 'Code 39' },
  { value: 'EAN13', label: 'EAN-13' },
  { value: 'EAN8', label: 'EAN-8' },
  { value: 'UPCA', label: 'UPC-A' },
  { value: 'UPCE', label: 'UPC-E' }
];

const BarcodeSettingsPage = () => {
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
    toast.success('Barcode settings saved successfully');
  };

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <h4 className="page-title">Barcode Settings</h4>
          </div>
        </Col>
      </Row>

      {saved && (
        <Row>
          <Col xs={12}>
            <Alert variant="success" dismissible onClose={() => setSaved(false)}>
              <i className="mdi mdi-check-circle me-2"></i>
              Barcode settings saved. The Print Labels page will use these settings.
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
                  <i className="mdi mdi-barcode me-1"></i> Barcode Configuration
                </h5>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Barcode Type</Form.Label>
                      <Form.Select name="barcodeType" value={formData.barcodeType || 'CODE128'} onChange={handleChange}>
                        {BARCODE_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </Form.Select>
                      <Form.Text className="text-muted">
                        Symbology used when printing product labels.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <h5 className="mb-3 mt-4 text-uppercase bg-light p-2">
                  <i className="mdi mdi-printer me-1"></i> Label Content
                </h5>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Show product name on label"
                        name="barcodeShowName"
                        checked={!!formData.barcodeShowName}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Show selling price on label"
                        name="barcodeShowPrice"
                        checked={!!formData.barcodeShowPrice}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Alert variant="info">
                  <i className="mdi mdi-information me-1"></i>
                  Use <strong>Products &rarr; Print Labels</strong> to print labels. These settings control
                  the symbology and what is printed on each label. EAN/UPC types require valid numeric-only SKUs of the correct length.
                </Alert>
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

export default BarcodeSettingsPage;
