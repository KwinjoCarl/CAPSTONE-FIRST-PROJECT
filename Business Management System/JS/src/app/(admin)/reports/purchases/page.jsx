import { Card, Col, Row, Table, Form, Button, Badge, ButtonGroup } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { exportToCSV, exportToExcel } from '@/utils/exportUtils';

const PurchasesReportPage = () => {
  const [purchases, setPurchases] = useState([]);
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [filterSupplier, setFilterSupplier] = useState('');
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = () => {
    const storedPurchases = JSON.parse(localStorage.getItem('bms_purchases') || '[]');
    setPurchases(storedPurchases);
    setFilteredPurchases(storedPurchases);

    // Extract unique suppliers
    const uniqueSuppliers = [...new Set(storedPurchases.map(p => p.supplier).filter(Boolean))];
    setSuppliers(uniqueSuppliers);
  };

  const handleFilter = () => {
    let filtered = [...purchases];

    if (dateRange.startDate && dateRange.endDate) {
      filtered = filtered.filter(purchase => {
        const purchaseDate = new Date(purchase.purchaseDate || purchase.createdAt);
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);
        return purchaseDate >= start && purchaseDate <= end;
      });
    }

    if (filterSupplier) {
      filtered = filtered.filter(p => p.supplier === filterSupplier);
    }

    setFilteredPurchases(filtered);
  };

  const handleReset = () => {
    setDateRange({ startDate: '', endDate: '' });
    setFilterSupplier('');
    setFilteredPurchases(purchases);
  };

  const totalAmount = filteredPurchases.reduce((sum, p) => sum + (p.grandTotal || 0), 0);
  const totalPaid = filteredPurchases.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
  const totalDue = totalAmount - totalPaid;

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <div className="page-title-right">
              <ButtonGroup>
                <Button variant="success" size="sm" onClick={() => {
                  const exportData = filteredPurchases.map(p => ({
                    'Reference No': p.referenceNo,
                    'Date': new Date(p.purchaseDate || p.createdAt).toLocaleDateString(),
                    'Supplier': p.supplier,
                    'Total Items': p.totalItems || p.items?.length || 0,
                    'Grand Total': p.grandTotal,
                    'Amount Paid': p.amountPaid,
                    'Due': (p.grandTotal || 0) - (p.amountPaid || 0),
                    'Status': p.status
                  }));
                  exportToExcel(exportData, 'purchases-report.xlsx');
                }}>
                  <i className="mdi mdi-file-excel me-1"></i> Export Excel
                </Button>
                <Button variant="info" size="sm" onClick={() => {
                  const exportData = filteredPurchases.map(p => ({
                    'Reference No': p.referenceNo,
                    'Date': new Date(p.purchaseDate || p.createdAt).toLocaleDateString(),
                    'Supplier': p.supplier,
                    'Total Items': p.totalItems || p.items?.length || 0,
                    'Grand Total': p.grandTotal,
                    'Amount Paid': p.amountPaid,
                    'Due': (p.grandTotal || 0) - (p.amountPaid || 0),
                    'Status': p.status
                  }));
                  exportToCSV(exportData, 'purchases-report.csv');
                }}>
                  <i className="mdi mdi-file-delimited me-1"></i> Export CSV
                </Button>
              </ButtonGroup>
            </div>
            <h4 className="page-title">Purchases Report</h4>
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
                    <Form.Label>Supplier</Form.Label>
                    <Form.Select
                      value={filterSupplier}
                      onChange={(e) => setFilterSupplier(e.target.value)}
                    >
                      <option value="">All Suppliers</option>
                      {suppliers.map((supplier, idx) => (
                        <option key={idx} value={supplier}>{supplier}</option>
                      ))}
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

              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Reference No</th>
                      <th>Date</th>
                      <th>Supplier</th>
                      <th>Total Items</th>
                      <th>Subtotal</th>
                      <th>Shipping</th>
                      <th>Grand Total</th>
                      <th>Amount Paid</th>
                      <th>Due</th>
                      <th>Payment Status</th>
                      <th>Order Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPurchases.length === 0 ? (
                      <tr>
                        <td colSpan="12" className="text-center text-muted py-4">
                          No purchases found
                        </td>
                      </tr>
                    ) : (
                      filteredPurchases.map((purchase, index) => {
                        const due = (purchase.grandTotal || 0) - (purchase.amountPaid || 0);
                        const paymentStatus = due === 0 ? 'paid' : (purchase.amountPaid || 0) > 0 ? 'partial' : 'unpaid';
                        
                        return (
                          <tr key={purchase.id}>
                            <td>{index + 1}</td>
                            <td>{purchase.referenceNo}</td>
                            <td>{new Date(purchase.purchaseDate || purchase.createdAt).toLocaleDateString()}</td>
                            <td>{purchase.supplier || '-'}</td>
                            <td className="text-center">{purchase.totalItems || purchase.items?.length || 0}</td>
                            <td className="text-end">$ {((purchase.grandTotal || 0) - (purchase.shippingCharge || 0)).toFixed(2)}</td>
                            <td className="text-end">$ {(purchase.shippingCharge || 0).toFixed(2)}</td>
                            <td className="text-end">$ {(purchase.grandTotal || 0).toFixed(2)}</td>
                            <td className="text-end">$ {(purchase.amountPaid || 0).toFixed(2)}</td>
                            <td className="text-end">$ {due.toFixed(2)}</td>
                            <td>
                              <Badge bg={
                                paymentStatus === 'paid' ? 'success' : 
                                paymentStatus === 'partial' ? 'warning' : 'danger'
                              }>
                                {paymentStatus.toUpperCase()}
                              </Badge>
                            </td>
                            <td>
                              <Badge bg={
                                purchase.status === 'received' ? 'success' : 
                                purchase.status === 'ordered' ? 'info' : 'warning'
                              }>
                                {(purchase.status || 'Pending').toUpperCase()}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <th colSpan="5" className="text-end">Total:</th>
                      <th className="text-end">
                        $ {filteredPurchases.reduce((sum, p) => sum + ((p.grandTotal || 0) - (p.shippingCharge || 0)), 0).toFixed(2)}
                      </th>
                      <th className="text-end">
                        $ {filteredPurchases.reduce((sum, p) => sum + (p.shippingCharge || 0), 0).toFixed(2)}
                      </th>
                      <th className="text-end">$ {totalAmount.toFixed(2)}</th>
                      <th className="text-end">$ {totalPaid.toFixed(2)}</th>
                      <th className="text-end">$ {totalDue.toFixed(2)}</th>
                      <th colSpan="2"></th>
                    </tr>
                  </tfoot>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default PurchasesReportPage;
