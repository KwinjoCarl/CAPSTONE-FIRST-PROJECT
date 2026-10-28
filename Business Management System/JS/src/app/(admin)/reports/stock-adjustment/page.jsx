import { Card, Col, Row, Table, Form, Button, Badge, ButtonGroup } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { exportToCSV, exportToExcel } from '@/utils/exportUtils';

const StockAdjustmentReportPage = () => {
  const [adjustments, setAdjustments] = useState([]);
  const [filteredAdjustments, setFilteredAdjustments] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    loadAdjustments();
  }, []);

  const loadAdjustments = () => {
    // Load stock adjustments from localStorage
    // These are manual inventory changes due to damages, theft, leaks, or bookkeeping corrections
    const storedAdjustments = JSON.parse(localStorage.getItem('bms_stock_adjustments') || '[]');
    
    // Enrich adjustments with product details
    const products = JSON.parse(localStorage.getItem('bms_products') || '[]');
    const enrichedAdjustments = storedAdjustments.map(adj => {
      const product = products.find(p => p.id === adj.productId || p.name === adj.productName);
      return {
        ...adj,
        productSKU: product?.sku || '-',
        unitCost: product?.purchasePrice || 0,
        totalValue: (adj.quantity || 0) * (product?.purchasePrice || 0)
      };
    });
    
    setAdjustments(enrichedAdjustments);
    setFilteredAdjustments(enrichedAdjustments);
  };

  const handleFilter = () => {
    let filtered = [...adjustments];

    if (dateRange.startDate && dateRange.endDate) {
      filtered = filtered.filter(adj => {
        const adjDate = new Date(adj.date || adj.createdAt);
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);
        return adjDate >= start && adjDate <= end;
      });
    }

    if (filterType) {
      filtered = filtered.filter(adj => adj.type === filterType);
    }

    setFilteredAdjustments(filtered);
  };

  const handleReset = () => {
    setDateRange({ startDate: '', endDate: '' });
    setFilterType('');
    setFilteredAdjustments(adjustments);
  };

  const totalAdjustments = filteredAdjustments.length;
  const totalAdded = filteredAdjustments.filter(a => a.type === 'addition').reduce((sum, a) => sum + (a.quantity || 0), 0);
  const totalRemoved = filteredAdjustments.filter(a => a.type === 'subtraction' || a.type === 'damage').reduce((sum, a) => sum + (a.quantity || 0), 0);
  const totalValueLoss = filteredAdjustments.filter(a => a.type === 'subtraction' || a.type === 'damage').reduce((sum, a) => sum + (a.totalValue || 0), 0);

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <div className="page-title-right">
              <ButtonGroup>
                <Button variant="success" size="sm" onClick={() => {
                  const exportData = filteredAdjustments.map(a => ({
                    'Date': new Date(a.date || a.createdAt).toLocaleDateString(),
                    'Reference No': a.referenceNo || '-',
                    'Product': a.productName || a.product,
                    'Type': a.type,
                    'Quantity': a.quantity,
                    'Reason': a.reason || '-',
                    'Adjusted By': a.adjustedBy || 'Admin'
                  }));
                  exportToExcel(exportData, 'stock-adjustment-report.xlsx');
                }}>
                  <i className="mdi mdi-file-excel me-1"></i> Export Excel
                </Button>
                <Button variant="info" size="sm" onClick={() => {
                  const exportData = filteredAdjustments.map(a => ({
                    'Date': new Date(a.date || a.createdAt).toLocaleDateString(),
                    'Reference No': a.referenceNo || '-',
                    'Product': a.productName || a.product,
                    'Type': a.type,
                    'Quantity': a.quantity,
                    'Reason': a.reason || '-',
                    'Adjusted By': a.adjustedBy || 'Admin'
                  }));
                  exportToCSV(exportData, 'stock-adjustment-report.csv');
                }}>
                  <i className="mdi mdi-file-delimited me-1"></i> Export CSV
                </Button>
              </ButtonGroup>
            </div>
            <h4 className="page-title">Stock Adjustment Report</h4>
          </div>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body>
              <Row className="mb-3">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Adjustment Type</Form.Label>
                    <Form.Select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                    >
                      <option value="">All Types</option>
                      <option value="addition">Addition</option>
                      <option value="subtraction">Subtraction</option>
                      <option value="damage">Damage</option>
                      <option value="return">Return</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3} className="d-flex align-items-end">
                  <Button variant="primary" className="me-2" onClick={handleFilter}>
                    <i className="mdi mdi-filter me-1"></i> Filter
                  </Button>
                  <Button variant="secondary" onClick={handleReset}>
                    <i className="mdi mdi-refresh me-1"></i> Reset
                  </Button>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={3}>
                  <Card className="bg-info text-white">
                    <Card.Body className="py-2">
                      <h6 className="text-white mb-0">Total Adjustments</h6>
                      <h4 className="text-white mb-0">{totalAdjustments}</h4>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="bg-success text-white">
                    <Card.Body className="py-2">
                      <h6 className="text-white mb-0">Total Added</h6>
                      <h4 className="text-white mb-0">{totalAdded}</h4>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="bg-danger text-white">
                    <Card.Body className="py-2">
                      <h6 className="text-white mb-0">Total Removed</h6>
                      <h4 className="text-white mb-0">{totalRemoved}</h4>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="bg-warning text-white">
                    <Card.Body className="py-2">
                      <h6 className="text-white mb-0">Value Loss</h6>
                      <h4 className="text-white mb-0">$ {totalValueLoss.toFixed(2)}</h4>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Date</th>
                      <th>Reference No</th>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Type</th>
                      <th>Quantity</th>
                      <th>Unit Cost</th>
                      <th>Total Value</th>
                      <th>Reason</th>
                      <th>Adjusted By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdjustments.length === 0 ? (
                      <tr>
                        <td colSpan="11" className="text-center text-muted py-4">
                          No stock adjustments found
                        </td>
                      </tr>
                    ) : (
                      filteredAdjustments.map((adjustment, index) => (
                        <tr key={adjustment.id || index}>
                          <td>{index + 1}</td>
                          <td>{new Date(adjustment.date || adjustment.createdAt).toLocaleDateString()}</td>
                          <td>{adjustment.referenceNo || '-'}</td>
                          <td>{adjustment.productName || adjustment.product}</td>
                          <td>{adjustment.productSKU}</td>
                          <td>
                            <Badge bg={
                              adjustment.type === 'addition' ? 'success' :
                              adjustment.type === 'subtraction' ? 'danger' :
                              adjustment.type === 'damage' ? 'warning' : 'info'
                            }>
                              {(adjustment.type || 'adjustment').toUpperCase()}
                            </Badge>
                          </td>
                          <td className="text-center">
                            <strong className={adjustment.type === 'addition' ? 'text-success' : 'text-danger'}>
                              {adjustment.type === 'addition' ? '+' : '-'}{adjustment.quantity || 0}
                            </strong>
                          </td>
                          <td className="text-end">$ {(adjustment.unitCost || 0).toFixed(2)}</td>
                          <td className={`text-end ${adjustment.type === 'addition' ? 'text-success' : 'text-danger'}`}>
                            $ {(adjustment.totalValue || 0).toFixed(2)}
                          </td>
                          <td>
                            <div className="text-truncate" style={{maxWidth: '150px'}} title={adjustment.reason || '-'}>
                              {adjustment.reason || '-'}
                            </div>
                          </td>
                          <td>{adjustment.adjustedBy || 'Admin'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>

              <div className="mt-3 alert alert-info">
                <strong><i className="mdi mdi-information me-1"></i> About Stock Adjustments:</strong>
                <p className="mb-0 mt-2">
                  This report audits manual inventory changes made outside of normal buying and selling processes. 
                  Stock adjustments are typically made due to:
                </p>
                <ul className="mb-0 mt-2">
                  <li><strong>Damages:</strong> Products damaged during storage or handling</li>
                  <li><strong>Theft/Loss:</strong> Missing inventory due to theft or misplacement</li>
                  <li><strong>Leaks/Waste:</strong> Product loss due to leakage, expiration, or spoilage</li>
                  <li><strong>Bookkeeping Corrections:</strong> Corrections to fix inventory count discrepancies</li>
                  <li><strong>Returns to Stock:</strong> Items returned to inventory from various sources</li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default StockAdjustmentReportPage;
