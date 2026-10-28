import { Card, Col, Row, Button, Form, Modal, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getSettings } from '@/helpers/settings';

const AddProductPage = () => {
  const navigate = useNavigate();
  const [showOpeningStockModal, setShowOpeningStockModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [savedProductId, setSavedProductId] = useState(null);
  const [brands, setBrands] = useState([]);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandDescription, setNewBrandDescription] = useState('');
  const [openingStockData, setOpeningStockData] = useState({
    quantity: '',
    lotNumber: '',
    expiryDate: ''
  });
  const [formData, setFormData] = useState(() => {
    const settings = getSettings();
    return {
      productName: '',
      sku: '',
      unit: '',
      brand: '',
      category: '',
      subCategory: '',
      manageStock: false,
      alertQuantity: settings.defaultAlertQuantity?.toString() || '',
      weight: '',
      notForSelling: false,
      productType: 'single',
      purchasePrice: '',
      margin: settings.defaultProfitMargin?.toString() || '',
      sellingPrice: ''
    };
  });

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = () => {
    const storedBrands = JSON.parse(localStorage.getItem('bms_brands') || '[]');
    setBrands(storedBrands);
  };

  const handleAddBrand = (e) => {
    e.preventDefault();
    if (!newBrandName.trim()) {
      toast.error('Brand name is required');
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
    toast.success('SUCCESSFUL');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: newValue
      };
      
      // Auto-calculate selling price when purchase price or margin changes
      if (name === 'purchasePrice' || name === 'margin') {
        const purchasePrice = parseFloat(name === 'purchasePrice' ? newValue : prev.purchasePrice) || 0;
        const margin = parseFloat(name === 'margin' ? newValue : prev.margin) || 0;
        const marginAmount = (purchasePrice * margin) / 100;
        updated.sellingPrice = (purchasePrice + marginAmount).toFixed(2);
      }
      
      return updated;
    });
  };

  const saveProduct = (initialStock = 0) => {
    // Validate required fields
    if (!formData.productName || !formData.unit) {
      toast.error('Product Name and Unit are required');
      return null;
    }

    const skuPrefix = getSettings().skuPrefix || 'SKU-';

    // Create new product object
    const newProduct = {
      id: Date.now().toString(),
      name: formData.productName,
      sku: formData.sku || `${skuPrefix}${Date.now()}`,
      unit: formData.unit,
      brand: formData.brand,
      category: formData.category,
      subCategory: formData.subCategory,
      manageStock: formData.manageStock,
      alertQuantity: formData.alertQuantity,
      weight: formData.weight,
      notForSelling: formData.notForSelling,
      productType: formData.productType,
      purchasePrice: parseFloat(formData.purchasePrice) || 0,
      margin: parseFloat(formData.margin) || 0,
      sellingPrice: parseFloat(formData.sellingPrice) || 0,
      currentStock: initialStock,
      image: '',
      tax: '',
      status: 'Active',
      createdAt: new Date().toISOString()
    };

    // Get existing products
    const existingProducts = JSON.parse(localStorage.getItem('bms_products') || '[]');
    
    // Add new product
    existingProducts.push(newProduct);
    
    // Save to localStorage
    localStorage.setItem('bms_products', JSON.stringify(existingProducts));
    
    return newProduct.id;
  };

  const handleSaveAndAddOpeningStock = (e) => {
    e.preventDefault();
    const productId = saveProduct(0);
    if (productId) {
      setSavedProductId(productId);
      setShowOpeningStockModal(true);
    }
  };

  const handleOpeningStockSubmit = () => {
    const quantity = parseFloat(openingStockData.quantity) || 0;
    
    if (quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    // Update the product with opening stock
    const products = JSON.parse(localStorage.getItem('bms_products') || '[]');
    const productIndex = products.findIndex(p => p.id === savedProductId);
    
    if (productIndex !== -1) {
      products[productIndex].currentStock = quantity;
      products[productIndex].lotNumber = openingStockData.lotNumber;
      products[productIndex].expiryDate = openingStockData.expiryDate;
      localStorage.setItem('bms_products', JSON.stringify(products));
    }

    toast.success('SUCCESSFUL');
    setShowOpeningStockModal(false);
    navigate('/products/list');
  };

  const handleOpeningStockChange = (e) => {
    const { name, value } = e.target;
    setOpeningStockData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const handleSave = (e) => {
    e.preventDefault();
    const productId = saveProduct(0);
    if (productId) {
      toast.success('SUCCESSFUL');
      navigate('/products/list');
    }
  };

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <h4 className="page-title">Add new product</h4>
          </div>
        </Col>
      </Row>

      <Form>
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
                        placeholder="SKU (Leave blank to auto-generate)"
                        value={formData.sku}
                        onChange={handleInputChange}
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

                {/* Pricing Section */}
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
                  <Button variant="success" className="me-2" onClick={handleSave}>
                    <i className="mdi mdi-content-save me-1"></i> Save
                  </Button>
                  <Button variant="primary" onClick={handleSaveAndAddOpeningStock}>
                    <i className="mdi mdi-package-variant-closed me-1"></i> Save & Add Opening Stock
                  </Button>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>

      {/* Opening Stock Modal */}
      <Modal show={showOpeningStockModal} onHide={() => setShowOpeningStockModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="mdi mdi-package-variant-closed me-2"></i>
            Add Opening Stock
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="alert alert-info">
            <i className="mdi mdi-information me-2"></i>
            Enter the initial inventory quantity for this product. This will update your stock levels immediately.
          </div>

          <Card className="border">
            <Card.Body>
              <h5 className="mb-3">Business Location: <span className="text-primary">Main Location</span></h5>
              
              <Table bordered>
                <thead className="table-light">
                  <tr>
                    <th>Product Name</th>
                    <th>Quantity <span className="text-danger">*</span></th>
                    <th>Lot Number</th>
                    <th>Expiry Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>{formData.productName}</strong>
                      <div className="text-muted small">SKU: {formData.sku || 'Auto-generated'}</div>
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        name="quantity"
                        placeholder="Enter quantity"
                        value={openingStockData.quantity}
                        onChange={handleOpeningStockChange}
                        min="0"
                        step="1"
                        autoFocus
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="text"
                        name="lotNumber"
                        placeholder="Optional"
                        value={openingStockData.lotNumber}
                        onChange={handleOpeningStockChange}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="date"
                        name="expiryDate"
                        value={openingStockData.expiryDate}
                        onChange={handleOpeningStockChange}
                      />
                    </td>
                  </tr>
                </tbody>
              </Table>

              <div className="mt-3 p-3 bg-light rounded">
                <Row>
                  <Col md={6}>
                    <div className="mb-2">
                      <strong>Unit:</strong> <span className="text-muted">{formData.unit}</span>
                    </div>
                    <div className="mb-2">
                      <strong>Purchase Price:</strong> <span className="text-muted">${formData.purchasePrice || '0.00'}</span>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-2">
                      <strong>Selling Price:</strong> <span className="text-muted">${formData.sellingPrice || '0.00'}</span>
                    </div>
                    <div className="mb-2">
                      <strong>Total Value:</strong> <span className="text-primary fw-bold">
                        ${((parseFloat(openingStockData.quantity) || 0) * (parseFloat(formData.purchasePrice) || 0)).toFixed(2)}
                      </span>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card.Body>
          </Card>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowOpeningStockModal(false);
            navigate('/products/list');
          }}>
            Skip & Go to Products
          </Button>
          <Button variant="primary" onClick={handleOpeningStockSubmit}>
            <i className="mdi mdi-check me-1"></i> Save Opening Stock
          </Button>
        </Modal.Footer>
      </Modal>

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

export default AddProductPage;
