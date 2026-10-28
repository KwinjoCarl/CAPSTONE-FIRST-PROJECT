import { Card, Col, Row, Table, Form, Button, ButtonGroup } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { exportToCSV, exportToExcel, formatDataForExport } from '@/utils/exportUtils';

const SuppliersReportPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = () => {
    const purchases = JSON.parse(localStorage.getItem('bms_purchases') || '[]');
    const purchaseReturns = JSON.parse(localStorage.getItem('bms_purchase_returns') || '[]');
    
    // Aggregate supplier data from purchases
    const supplierMap = {};
    
    purchases.forEach(purchase => {
      const supplierName = purchase.supplier || 'Unknown Supplier';
      
      if (!supplierMap[supplierName]) {
        supplierMap[supplierName] = {
          name: supplierName,
          totalPurchases: 0,
          totalAmount: 0,
          totalPaid: 0,
          totalDue: 0,
          purchaseCount: 0,
          returnAmount: 0
        };
      }
      
      supplierMap[supplierName].totalPurchases += purchase.grandTotal || 0;
      supplierMap[supplierName].totalAmount += purchase.grandTotal || 0;
      supplierMap[supplierName].totalPaid += purchase.amountPaid || 0;
      supplierMap[supplierName].totalDue += (purchase.grandTotal || 0) - (purchase.amountPaid || 0);
      supplierMap[supplierName].purchaseCount += 1;
    });

    // Subtract purchase returns
    purchaseReturns.forEach(returnItem => {
      const supplierName = returnItem.supplier || 'Unknown Supplier';
      if (supplierMap[supplierName]) {
        supplierMap[supplierName].returnAmount += returnItem.grandTotal || 0;
        supplierMap[supplierName].totalDue -= returnItem.grandTotal || 0;
      }
    });
    
    const supplierList = Object.values(supplierMap);
    setSuppliers(supplierList);
    setFilteredSuppliers(supplierList);
  };

  const handleFilter = () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      setFilteredSuppliers(suppliers);
      return;
    }

    const purchases = JSON.parse(localStorage.getItem('bms_purchases') || '[]');
    const filtered = purchases.filter(purchase => {
      const purchaseDate = new Date(purchase.purchaseDate || purchase.createdAt);
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      return purchaseDate >= start && purchaseDate <= end;
    });

    // Re-aggregate filtered data
    const supplierMap = {};
    filtered.forEach(purchase => {
      const supplierName = purchase.supplier || 'Unknown Supplier';
      if (!supplierMap[supplierName]) {
        supplierMap[supplierName] = {
          name: supplierName,
          totalPurchases: 0,
          totalAmount: 0,
          totalPaid: 0,
          totalDue: 0,
          purchaseCount: 0
        };
      }
      supplierMap[supplierName].totalPurchases += purchase.grandTotal || 0;
      supplierMap[supplierName].totalAmount += purchase.grandTotal || 0;
      supplierMap[supplierName].totalPaid += purchase.amountPaid || 0;
      supplierMap[supplierName].totalDue += (purchase.grandTotal || 0) - (purchase.amountPaid || 0);
      supplierMap[supplierName].purchaseCount += 1;
    });

    setFilteredSuppliers(Object.values(supplierMap));
  };

  const handleReset = () => {
    setDateRange({ startDate: '', endDate: '' });
    setFilteredSuppliers(suppliers);
  };

  const totalPurchases = filteredSuppliers.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalPaid = filteredSuppliers.reduce((sum, s) => sum + s.totalPaid, 0);
  const totalDue = filteredSuppliers.reduce((sum, s) => sum + s.totalDue, 0);

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <div className="page-title-right">
              <ButtonGroup>
                <Button 
                  variant="success" 
                  size="sm"
                  onClick={() => {
                    const exportData = formatDataForExport(filteredSuppliers, {
                      name: 'Supplier Name',
                      purchaseCount: 'Total Purchases',
                      totalAmount: 'Total Amount',
                      totalPaid: 'Total Paid',
                      totalDue: 'Total Due'
                    });
                    exportToExcel(exportData, 'suppliers-report.xlsx');
                  }}
                >
                  <i className="mdi mdi-file-excel me-1"></i> Export Excel
                </Button>
                <Button 
                  variant="info" 
                  size="sm"
                  onClick={() => {
                    const exportData = formatDataForExport(filteredSuppliers, {
                      name: 'Supplier Name',
                      purchaseCount: 'Total Purchases',
                      totalAmount: 'Total Amount',
                      totalPaid: 'Total Paid',
                      totalDue: 'Total Due'
                    });
                    exportToCSV(exportData, 'suppliers-report.csv');
                  }}
                >
                  <i className="mdi mdi-file-delimited me-1"></i> Export CSV
                </Button>
              </ButtonGroup>
            </div>
            <h4 className="page-title">Suppliers Report</h4>
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
                      <th>Supplier Name</th>
                      <th>Total Purchases</th>
                      <th>Total Amount</th>
                      <th>Total Paid</th>
                      <th>Total Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSuppliers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-4">
                          No supplier data available
                        </td>
                      </tr>
                    ) : (
                      filteredSuppliers.map((supplier, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{supplier.name}</td>
                          <td>{supplier.purchaseCount}</td>
                          <td className="text-end">$ {supplier.totalAmount.toFixed(2)}</td>
                          <td className="text-end">$ {supplier.totalPaid.toFixed(2)}</td>
                          <td className="text-end">$ {supplier.totalDue.toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <th colSpan="3" className="text-end">Total:</th>
                      <th className="text-end">$ {totalPurchases.toFixed(2)}</th>
                      <th className="text-end">$ {totalPaid.toFixed(2)}</th>
                      <th className="text-end">$ {totalDue.toFixed(2)}</th>
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

export default SuppliersReportPage;
