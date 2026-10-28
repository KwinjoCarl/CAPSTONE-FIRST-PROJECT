import { Card, Col, Row, Button, Modal, Form, Table, Badge } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ActionsDropdown from '@/components/ActionsDropdown';

const SuppliersPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    contactType: 'supplier',
    individual: true,
    business: false,
    contactId: '',
    customerGroup: '',
    mobile: '',
    alternateContactNumber: '',
    landline: '',
    email: '',
    assignedTo: ''
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = () => {
    const storedSuppliers = JSON.parse(localStorage.getItem('bms_suppliers') || '[]');
    setSuppliers(storedSuppliers);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditMode(false);
    setSelectedSupplier(null);
    setFormData({
      name: '',
      contactType: 'supplier',
      individual: true,
      business: false,
      contactId: '',
      customerGroup: '',
      mobile: '',
      alternateContactNumber: '',
      landline: '',
      email: '',
      assignedTo: ''
    });
  };

  const handleShow = () => {
    setEditMode(false);
    setSelectedSupplier(null);
    setShowModal(true);
  };

  const handleEdit = (supplier) => {
    setEditMode(true);
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name,
      contactType: supplier.contactType || 'supplier',
      individual: supplier.type === 'Individual',
      business: supplier.type === 'Business',
      contactId: supplier.contactId || '',
      customerGroup: supplier.customerGroup || '',
      mobile: supplier.mobile,
      alternateContactNumber: supplier.alternateContactNumber || '',
      landline: supplier.landline || '',
      email: supplier.email || '',
      assignedTo: supplier.assignedTo || ''
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

    if (editMode && selectedSupplier) {
      // Update existing supplier
      const updatedSuppliers = suppliers.map(supplier =>
        supplier.id === selectedSupplier.id
          ? {
              ...supplier,
              name: formData.name,
              contactType: formData.contactType,
              type: formData.individual ? 'Individual' : 'Business',
              contactId: formData.contactId || supplier.contactId,
              customerGroup: formData.customerGroup,
              mobile: formData.mobile,
              alternateContactNumber: formData.alternateContactNumber,
              landline: formData.landline,
              email: formData.email,
              assignedTo: formData.assignedTo,
              updatedAt: new Date().toISOString()
            }
          : supplier
      );

      localStorage.setItem('bms_suppliers', JSON.stringify(updatedSuppliers));
      setSuppliers(updatedSuppliers);
      toast.success('Supplier updated successfully!');
      handleClose();
      return;
    }

    // Create new supplier object
    const newSupplier = {
      id: Date.now().toString(),
      name: formData.name,
      contactType: formData.contactType,
      type: formData.individual ? 'Individual' : 'Business',
      contactId: formData.contactId || `SUP-${Date.now()}`,
      customerGroup: formData.customerGroup,
      mobile: formData.mobile,
      alternateContactNumber: formData.alternateContactNumber,
      landline: formData.landline,
      email: formData.email,
      assignedTo: formData.assignedTo,
      status: 'Active',
      createdAt: new Date().toISOString()
    };

    // Get existing suppliers
    const existingSuppliers = JSON.parse(localStorage.getItem('bms_suppliers') || '[]');
    
    // Add new supplier
    existingSuppliers.push(newSupplier);
    
    // Save to localStorage
    localStorage.setItem('bms_suppliers', JSON.stringify(existingSuppliers));
    
    // Update state
    setSuppliers(existingSuppliers);
    
    toast.success('Supplier added successfully!');
    handleClose();
  };

  const handleDelete = (supplierId) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      const updatedSuppliers = suppliers.filter(supplier => supplier.id !== supplierId);
      localStorage.setItem('bms_suppliers', JSON.stringify(updatedSuppliers));
      setSuppliers(updatedSuppliers);
      toast.success('Supplier deleted successfully!');
    }
  };

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <div className="page-title-right">
              <Button variant="primary" onClick={handleShow}>
                <i className="mdi mdi-plus-circle me-1"></i> Add Supplier
              </Button>
            </div>
            <h4 className="page-title">Suppliers</h4>
          </div>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body>
              <h4 className="header-title mb-3">All Suppliers</h4>
              <p className="text-muted">Manage your suppliers.</p>
              <div className="table-responsive">
                <Table className="table table-centered table-nowrap mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Contact ID</th>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Mobile</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.length > 0 ? (
                      suppliers.map((supplier) => (
                        <tr key={supplier.id}>
                          <td>{supplier.contactId}</td>
                          <td>{supplier.name}</td>
                          <td>{supplier.type}</td>
                          <td>{supplier.mobile}</td>
                          <td>{supplier.email || '-'}</td>
                          <td>
                            <Badge bg={supplier.status === 'Active' ? 'success' : 'danger'}>
                              {supplier.status}
                            </Badge>
                          </td>
                          <td>
                            <ActionsDropdown
                              onEdit={() => handleEdit(supplier)}
                              onDelete={() => handleDelete(supplier.id)}
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center">No suppliers found</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add Contact Modal */}
      <Modal show={showModal} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Edit/View Supplier' : 'Add a new contact'}</Modal.Title>
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
                    placeholder="Enter supplier name"
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
                  <Form.Label>Contact type: <span className="text-danger">*</span></Form.Label>
                  <Form.Select name="contactType" value={formData.contactType} onChange={handleInputChange}>
                    <option value="supplier">Supplier</option>
                    <option value="customer">Customer</option>
                    <option value="both">Both</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="d-block">&nbsp;</Form.Label>
                  <Form.Check
                    inline
                    type="radio"
                    label="Individual"
                    name="contactTypeRadio"
                    value="individual"
                    checked={formData.individual}
                    onChange={handleInputChange}
                  />
                  <Form.Check
                    inline
                    type="radio"
                    label="Business"
                    name="contactTypeRadio"
                    value="business"
                    checked={formData.business}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Contact ID:</Form.Label>
                  <Form.Control
                    type="text"
                    name="contactId"
                    placeholder="Contact ID"
                    value={formData.contactId}
                    onChange={handleInputChange}
                  />
                  <Form.Text className="text-muted">
                    Leave empty to autogenerate
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Customer Group:</Form.Label>
                  <Form.Select name="customerGroup" value={formData.customerGroup} onChange={handleInputChange}>
                    <option value="">None</option>
                    <option value="group1">Group 1</option>
                    <option value="group2">Group 2</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
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
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Alternate contact number:</Form.Label>
                  <Form.Control
                    type="text"
                    name="alternateContactNumber"
                    placeholder="Alternate contact number"
                    value={formData.alternateContactNumber}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Landline:</Form.Label>
                  <Form.Control
                    type="text"
                    name="landline"
                    placeholder="Landline"
                    value={formData.landline}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
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
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Assigned to:</Form.Label>
                  <Form.Select name="assignedTo" value={formData.assignedTo} onChange={handleInputChange}>
                    <option value="">Select User</option>
                    <option value="user1">User 1</option>
                    <option value="user2">User 2</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <div className="text-primary" style={{ cursor: 'pointer' }}>
              <i className="mdi mdi-plus-circle me-1"></i>
              More Informations
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" type="submit">
              Save
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default SuppliersPage;
