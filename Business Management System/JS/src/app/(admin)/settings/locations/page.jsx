import { Card, Col, Row, Button, Modal, Form, Table, Badge } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getLocations, saveLocations } from '@/helpers/settings';
import ActionsDropdown from '@/components/ActionsDropdown';

const BusinessLocationsPage = () => {
  const [locations, setLocations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({ name: '', address: '', isDefault: false });

  useEffect(() => {
    setLocations(getLocations());
  }, []);

  const persist = (list) => {
    saveLocations(list);
    setLocations([...list]);
  };

  const handleShow = () => {
    setEditMode(false);
    setSelected(null);
    setFormData({ name: '', address: '', isDefault: false });
    setShowModal(true);
  };

  const handleEdit = (location) => {
    setEditMode(true);
    setSelected(location);
    setFormData({ name: location.name, address: location.address || '', isDefault: !!location.isDefault });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Location name is required');
      return;
    }

    if (editMode && selected) {
      let updated = locations.map(loc =>
        loc.id === selected.id ? { ...loc, name: formData.name.trim(), address: formData.address, isDefault: formData.isDefault } : loc
      );
      if (formData.isDefault) {
        updated = updated.map(loc => (loc.id === selected.id ? loc : { ...loc, isDefault: false }));
      }
      persist(updated);
      toast.success('Location updated successfully');
    } else {
      const newLocation = {
        id: `loc-${Date.now()}`,
        name: formData.name.trim(),
        address: formData.address,
        isDefault: formData.isDefault
      };
      let updated = [...locations, newLocation];
      if (formData.isDefault) {
        updated = updated.map(loc => (loc.id === newLocation.id ? loc : { ...loc, isDefault: false }));
      }
      persist(updated);
      toast.success('Location added successfully');
    }
    setShowModal(false);
  };

  const handleDelete = (location) => {
    if (location.isDefault) {
      toast.error('Cannot delete the default location');
      return;
    }
    if (window.confirm(`Delete location "${location.name}"?`)) {
      persist(locations.filter(loc => loc.id !== location.id));
      toast.success('Location deleted');
    }
  };

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <div className="page-title-right">
              <Button variant="primary" onClick={handleShow}>
                <i className="mdi mdi-plus-circle me-1"></i> Add Location
              </Button>
            </div>
            <h4 className="page-title">Business Locations</h4>
          </div>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body>
              <h4 className="header-title mb-3">All Locations</h4>
              <p className="text-muted">Locations are used for purchases, stock adjustments and expenses.</p>
              <div className="table-responsive">
                <Table className="table-centered table-nowrap mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Location Name</th>
                      <th>Address</th>
                      <th>Default</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locations.length > 0 ? (
                      locations.map((location) => (
                        <tr key={location.id}>
                          <td><strong>{location.name}</strong></td>
                          <td>{location.address || '-'}</td>
                          <td>
                            {location.isDefault ? (
                              <Badge bg="success">Default</Badge>
                            ) : (
                              <Badge bg="secondary">-</Badge>
                            )}
                          </td>
                          <td>
                            <ActionsDropdown
                              onEdit={() => handleEdit(location)}
                              onDelete={() => handleDelete(location)}
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center text-muted py-4">
                          No locations found. Click "Add Location" to create one.
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
          <Modal.Title>{editMode ? 'Edit/View Location' : 'Add Location'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Location Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Main Store, Branch 2"
                required
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </Form.Group>
            <Form.Check
              type="checkbox"
              label="Set as default location"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
            />
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

export default BusinessLocationsPage;
