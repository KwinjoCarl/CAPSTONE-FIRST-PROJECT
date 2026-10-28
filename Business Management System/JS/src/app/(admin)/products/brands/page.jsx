import { Card, Col, Row, Button, Table, Modal, Form } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const BrandsPage = () => {
  const [brands, setBrands] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentBrand, setCurrentBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = () => {
    const storedBrands = JSON.parse(localStorage.getItem('bms_brands') || '[]');
    setBrands(storedBrands);
  };

  const handleShowModal = (brand = null) => {
    if (brand) {
      setEditMode(true);
      setCurrentBrand(brand);
      setFormData({
        name: brand.name,
        description: brand.description || ''
      });
    } else {
      setEditMode(false);
      setCurrentBrand(null);
      setFormData({
        name: '',
        description: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentBrand(null);
    setFormData({
      name: '',
      description: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Brand name is required');
      return;
    }

    const storedBrands = JSON.parse(localStorage.getItem('bms_brands') || '[]');

    if (editMode && currentBrand) {
      const updatedBrands = storedBrands.map(brand =>
        brand.id === currentBrand.id
          ? { ...brand, name: formData.name, description: formData.description, updatedAt: new Date().toISOString() }
          : brand
      );
      localStorage.setItem('bms_brands', JSON.stringify(updatedBrands));
      setBrands(updatedBrands);
      toast.success('SUCCESSFUL');
    } else {
      const newBrand = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        createdAt: new Date().toISOString()
      };
      const updatedBrands = [...storedBrands, newBrand];
      localStorage.setItem('bms_brands', JSON.stringify(updatedBrands));
      setBrands(updatedBrands);
      toast.success('SUCCESSFUL');
    }

    handleCloseModal();
  };

  const handleDelete = (brandId) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      const storedBrands = JSON.parse(localStorage.getItem('bms_brands') || '[]');
      const updatedBrands = storedBrands.filter(brand => brand.id !== brandId);
      localStorage.setItem('bms_brands', JSON.stringify(updatedBrands));
      setBrands(updatedBrands);
      toast.success('SUCCESSFUL');
    }
  };

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <div className="page-title-right">
              <Button variant="primary" onClick={() => handleShowModal()}>
                <i className="mdi mdi-plus-circle me-1"></i> Add Brand
              </Button>
            </div>
            <h4 className="page-title">Brands</h4>
          </div>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body>
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Brand Name</th>
                      <th>Description</th>
                      <th>Created Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brands.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-4">
                          No brands found. Click "Add Brand" to create one.
                        </td>
                      </tr>
                    ) : (
                      brands.map((brand, index) => (
                        <tr key={brand.id}>
                          <td>{index + 1}</td>
                          <td>{brand.name}</td>
                          <td>{brand.description || '-'}</td>
                          <td>{new Date(brand.createdAt).toLocaleDateString()}</td>
                          <td>
                            <Button
                              variant="primary"
                              size="sm"
                              className="me-1"
                              onClick={() => handleShowModal(brand)}
                            >
                              <i className="mdi mdi-pencil"></i>
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(brand.id)}
                            >
                              <i className="mdi mdi-delete"></i>
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add/Edit Brand Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Edit Brand' : 'Add Brand'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Brand Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="Enter brand name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                placeholder="Enter brand description (optional)"
                value={formData.description}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="success" type="submit">
              <i className="mdi mdi-content-save me-1"></i> {editMode ? 'Update' : 'Save'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default BrandsPage;
