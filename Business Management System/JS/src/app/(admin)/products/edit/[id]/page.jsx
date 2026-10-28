import { Card, Col, Row, Button, Form, Modal } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const EditProductPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [brands, setBrands] = useState([]);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandDescription, setNewBrandDescription] = useState('');
  const [formData, setFormData] = useState({
    productName: '',
    sku: '',
    unit: '',
    brand: '',
    category: '',
    subCategory: '',
    manageStock: false,
    alertQuantity: '',
    weight: '',
    notForSelling: false,
    productType: 'single',
    purchasePrice: '',
    margin: '',
    sellingPrice: '',
    currentStock: 0
  });

  useEffect(() => {
    loadBrands();
    const products = JSON.parse(localStorage.getItem('bms_products') || '[]');
    const product = products.find(p => p.id === id);
    
    if (product) {
      setFormData({
        productName: product.name || '',
        sku: product.sku || '',
        unit: product.unit || '',
        brand: product.brand || '',
        category: product.category || '',
        subCategory: product.subCategory || '',
        manageStock: product.manageStock || false,
        alertQuantity: product.alertQuantity || '',
        weight: product.weight || '',
        notForSelling: product.notForSelling || false,
        productType: product.productType || 'single',
        purchasePrice: product.purchasePrice || '',
        margin: product.margin || '',
        sellingPrice: product.sellingPrice || '',
        currentStock: product.currentStock || 0
      });
    } else {
      toast.error('Product not found');
      navigate('/products/list');
    }
  }, [id, navigate]);

  const loadBrands = () => {
    const storedBrands = JSON.parse(localStorage.getItem('bms_brands') || '[]');
    setBrands(storedBrands);
  };

  const handleAddBrand = (e) => {
    e.preventDefault();
    if (!newBrandName.trim()) {
      alert('Brand name is required');
      return;
    }

    const newBrand = {
      id: Date.now().toString(),
      name: newBrandName,
      description: newBrandDescription,
      createdAt: new Date().toISOString()
    };

    const storedBrands = JSON.parse(localStorage.getItem('bms_brands') || '[]');
    const updatedBrands = [...storedBrands, newBrand];
    localStorage.setItem('bms_brands', JSON.stringify(updatedBrands));
    setBrands(updatedBrands);
    setFormData({ ...formData, brand: newBrand.name });
    setNewBrandName('');
    setNewBrandDescription('');
    setShowBrandModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: newValue
      };
      
      if (name === 'purchasePrice' || name === 'margin') {
        const purchasePrice = parseFloat(name === 'purchasePrice' ? newValue : prev.purchasePrice) || 0;
        const margin = parseFloat(name === 'margin' ? newValue : prev.margin) || 0;
        const marginAmount = (purchasePrice * margin) / 100;
        updated.sellingPrice = (purchasePrice + marginAmount).toFixed(2);
      }
      
      return updated;
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    if (!formData.productName || !formData.unit) {
      toast.error('Product Name and Unit are required');
      return;
    }

    const products = JSON.parse(localStorage.getItem('bms_products') || '[]');
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
      toast.error('Product not found');
      return;
    }

    const updatedProduct = {
      ...products[productIndex],
      name: formData.productName,
      sku: formData.sku,
      unit: formData.unit,
      brand: formData.brand,
      category: formData.category,
      subCategory: formData.subCategory,
      manageStock: formData.manageStock,
      alertQuantity: formData.alertQuantity,
      currentStock: parseFloat(formData.currentStock) || 0,
      weight: formData.weight,
      notForSelling: formData.notForSelling,
      productType: formData.productType,
      purchasePrice: parseFloat(formData.purchasePrice) || 0,
      margin: parseFloat(formData.margin) || 0,
      sellingPrice: parseFloat(formData.sellingPrice) || 0,
      updatedAt: new Date().toISOString()
    };

    products[productIndex] = updatedProduct;
    localStorage.setItem('bms_products', JSON.stringify(products));

    toast.success('SUCCESSFUL');
    navigate('/products/list');
  };

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <div className="page-title-right">
              <Button variant="secondary" onClick={() => navigate('/products/list')}>
                <i className="mdi mdi-arrow-left me-1"></i> Back to Products
              </Button>
            </div>
            <h4 className="page-title">Edit/View Product</h4>
          </div>
        </Col>
      </Row>

      <Form onSubmit={handleSave}>
        <Row>
          <Col xs={12}>
            <Card>
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Product Name: <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="productName"
                        placeholder="Product Name"
                        value={formData.productName}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>SKU: <i className="mdi mdi-information-outline"></i></Form.Label>
                      <Form.Control
                        type="text"
                        name="sku"
                        placeholder="SKU"
                        value={formData.sku}
                        onChange={handleInputChange}
                        readOnly
                        style={{ backgroundColor: '#e9ecef' }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Unit: <span className="text-danger">*</span></Form.Label>
                      <Form.Select name="unit" value={formData.unit} onChange={handleInputChange} required>
                        <option value="">Please Select</option>
                        <option value="Pieces">Pieces</option>
                        <option value="Kg">Kg</option>
                        <option value="Liters">Liters</option>
                        <option value="Grams">Grams</option>
                        <option value="Meters">Meters</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Brand:</Form.Label>
                      <div className="input-group">
                        <Form.Select name="brand" value={formData.brand} onChange={handleInputChange}>
                          <option value="">Please Select</option>
                          {brands.map((brand) => (
                            <option key={brand.id} value={brand.name}>
                              {brand.name}
                            </option>
                          ))}
                        </Form.Select>
                        <Button variant="primary" onClick={() => setShowBrandModal(true)} title="Add New Brand">
                          <i className="mdi mdi-plus"></i>
                        </Button>
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Category:</Form.Label>
                      <Form.Select name="category" value={formData.category} onChange={handleInputChange}>
                        <option value="">Please Select</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Food & Beverages">Food & Beverages</option>
                        <option value="Clothing">Clothing</option>
                        <option value="Other">Other</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Sub category:</Form.Label>
                      <Form.Select name="subCategory" value={formData.subCategory} onChange={handleInputChange}>
                        <option value="">Please Select</option>
                        <option value="Sub Category 1">Sub Category 1</option>
                        <option value="Sub Category 2">Sub Category 2</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        inline
                        type="checkbox"
                        label="Manage Stock?"
                        name="manageStock"
                        checked={formData.manageStock}
                        onChange={handleInputChange}
                      />
                      <i className="mdi mdi-information-outline"></i>
                      <Form.Text className="text-muted d-block">
                        Enable stock management at product level
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                {formData.manageStock && (
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Alert Quantity:</Form.Label>
                        <Form.Control
                          type="number"
                          name="alertQuantity"
                          placeholder="Alert Quantity"
                          value={formData.alertQuantity}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Current Stock:</Form.Label>
                        <Form.Control
                          type="number"
                          name="currentStock"
                          value={formData.currentStock}
                          onChange={handleInputChange}
                          min="0"
                          step="1"
                        />
                        <Form.Text className="text-muted">
                          You can manually adjust stock quantity here
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>
                )}

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Weight (in kg):</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        name="weight"
                        placeholder="Weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="d-block">&nbsp;</Form.Label>
                      <Form.Check
                        type="checkbox"
                        label="Not for selling"
                        name="notForSelling"
                        checked={formData.notForSelling}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Product Type: <i className="mdi mdi-information-outline"></i></Form.Label>
                      <Form.Select name="productType" value={formData.productType} onChange={handleInputChange}>
                        <option value="single">Single</option>
                        <option value="variable">Variable</option>
                        <option value="combo">Combo</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="bg-success text-white p-2 mb-3 mt-4">
                  <Row>
                    <Col md={4}><strong>Purchase Price</strong></Col>
                    <Col md={4}><strong>Margin (%)</strong></Col>
                    <Col md={4}><strong>Selling Price</strong></Col>
                  </Row>
                </div>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Purchase Price: <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        name="purchasePrice"
                        placeholder="0.00"
                        value={formData.purchasePrice}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Margin (%):</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        name="margin"
                        placeholder="0.00"
                        value={formData.margin}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Selling Price:</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        name="sellingPrice"
                        placeholder="0.00"
                        value={formData.sellingPrice}
                        readOnly
                        style={{ backgroundColor: '#e9ecef' }}
                      />
                      <Form.Text className="text-muted">
                        Auto-calculated based on Purchase Price + Margin
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Row>
              <Col xs={12}>
                <div className="text-end mb-3">
                  <Button variant="secondary" className="me-2" onClick={() => navigate('/products/list')}>
                    <i className="mdi mdi-close me-1"></i> Cancel
                  </Button>
                  <Button variant="success" type="submit">
                    <i className="mdi mdi-content-save me-1"></i> Save
                  </Button>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>

      {/* Add Brand Modal */}
      <Modal show={showBrandModal} onHide={() => setShowBrandModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Brand</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddBrand}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Brand Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter brand name"
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter brand description (optional)"
                value={newBrandDescription}
                onChange={(e) => setNewBrandDescription(e.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowBrandModal(false)}>
              Cancel
            </Button>
            <Button variant="success" type="submit">
              <i className="mdi mdi-content-save me-1"></i> Save Brand
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default EditProductPage;
