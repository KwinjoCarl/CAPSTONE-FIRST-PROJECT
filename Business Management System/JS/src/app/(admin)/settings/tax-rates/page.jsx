import { Card, Col, Row, Button, Modal, Form, Table, Badge } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getTaxRates, saveTaxRates } from '@/helpers/settings';
import ActionsDropdown from '@/components/ActionsDropdown';

const TaxRatesPage = () => {
  const [taxRates, setTaxRates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({ name: '', rate: '' });

  useEffect(() => {
    setTaxRates(getTaxRates());
  }, []);

  const persist = (list) => {
    saveTaxRates(list);
    setTaxRates([...list]);
  };

  const handleShow = () => {
    setEditMode(false);
    setSelected(null);
    setFormData({ name: '', rate: '' });
    setShowModal(true);
  };

  const handleEdit = (tax) => {
    setEditMode(true);
    setSelected(tax);
    setFormData({ name: tax.name, rate: tax.rate });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const rateValue = parseFloat(formData.rate);
    if (!formData.name.trim()) {
      toast.error('Tax name is required');
      return;
    }
    if (isNaN(rateValue) || rateValue < 0 || rateValue > 100) {
      toast.error('Tax rate must be between 0 and 100');
      return;
    }

    if (editMode && selected) {
      persist(taxRates.map(t =>
        t.id === selected.id ? { ...t, name: formData.name.trim(), rate: rateValue } : t
      ));
      toast.success('Tax rate updated successfully');
    } else {
      const duplicate = taxRates.some(t => t.name.toLowerCase() === formData.name.trim().toLowerCase());
      if (duplicate) {
        toast.error('A tax rate with this name already exists');
        return;
      }
      persist([...taxRates, {
        id: `tax-${Date.now()}`,
        name: formData.name.trim(),
        rate: rateValue
      }]);
      toast.success('Tax rate added successfully');
    }
    setShowModal(false);
  };

  const handleDelete = (tax) => {
    if (window.confirm(`Delete tax rate "${tax.name}"?`)) {
      persist(taxRates.filter(t => t.id !== tax.id));
      toast.success('Tax rate deleted');
    }
  };

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <div className="page-title-right">
              <Button variant="primary" onClick={handleShow}>
                <i className="mdi mdi-plus-circle me-1"></i> Add Tax Rate
              </Button>
            </div>
            <h4 className="page-title">Tax Rates</h4>
          </div>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body>
              <h4 className="header-title mb-3">All Tax Rates</h4>
              <p className="text-muted">Tax rates configured here appear in the Sales and Purchases tax dropdowns.</p>
              <div className="table-responsive">
                <Table className="table-centered table-nowrap mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Tax Name</th>
                      <th>Rate</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taxRates.length > 0 ? (
                      taxRates.map((tax) => (
                        <tr key={tax.id}>
                          <td><strong>{tax.name}</strong></td>
                          <td>{tax.rate}%</td>
                          <td><Badge bg="success">Active</Badge></td>
                          <td>
                            <ActionsDropdown
                              onEdit={() => handleEdit(tax)}
                              onDelete={() => handleDelete(tax)}
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center text-muted py-4">
                          No tax rates found. Click "Add Tax Rate" to create one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Edit/View Tax Rate' : 'Add Tax Rate'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Tax Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. VAT, GST"
                required
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tax Rate (%) <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                placeholder="e.g. 15"
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">
              <i className="mdi mdi-content-save me-1"></i> Save
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default TaxRatesPage;
