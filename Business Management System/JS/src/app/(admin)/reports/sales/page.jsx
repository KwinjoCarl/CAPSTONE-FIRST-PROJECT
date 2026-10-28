import { Card, Col, Row, Table, Form, Button, Badge, ButtonGroup } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { exportToCSV, exportToExcel, formatDataForExport } from '@/utils/exportUtils';

const SalesReportPage = () => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterSalesperson, setFilterSalesperson] = useState('');
  const [customers, setCustomers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [salespeople, setSalespeople] = useState([]);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = () => {
    const storedSales = JSON.parse(localStorage.getItem('bms_sales') || '[]');
    setSales(storedSales);
    setFilteredSales(storedSales);

    // Extract unique customers, locations, and salespeople
    const uniqueCustomers = [...new Set(storedSales.map(s => s.customerName || s.customer).filter(Boolean))];
    const uniqueLocations = [...new Set(storedSales.map(s => s.location).filter(Boolean))];
    const uniqueSalespeople = [...new Set(storedSales.map(s => s.salesperson || s.soldBy).filter(Boolean))];
    
    setCustomers(uniqueCustomers);
    setLocations(uniqueLocations);
    setSalespeople(uniqueSalespeople);
  };

  const handleFilter = () => {
    let filtered = [...sales];

    if (dateRange.startDate && dateRange.endDate) {
      filtered = filtered.filter(sale => {
        const saleDate = new Date(sale.saleDate || sale.createdAt);
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);
        return saleDate >= start && saleDate <= end;
      });
    }

    if (filterCustomer) {
      filtered = filtered.filter(s => (s.customerName || s.customer) === filterCustomer);
    }

    if (filterPaymentMethod) {
      filtered = filtered.filter(s => s.paymentMethod === filterPaymentMethod);
    }

    if (filterLocation) {
      filtered = filtered.filter(s => s.location === filterLocation);
    }

    if (filterSalesperson) {
      filtered = filtered.filter(s => (s.salesperson || s.soldBy) === filterSalesperson);
    }

    setFilteredSales(filtered);
  };

  const handleReset = () => {
    setDateRange({ startDate: '', endDate: '' });
    setFilterCustomer('');
    setFilterPaymentMethod('');
    setFilterLocation('');
    setFilterSalesperson('');
    setFilteredSales(sales);
  };

  const totalAmount = filteredSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
  const totalReceived = filteredSales.reduce((sum, s) => sum + (s.amountReceived || s.grandTotal || 0), 0);
  const totalDue = totalAmount - totalReceived;

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <div className="page-title-right">
              <ButtonGroup>
                <Button variant="success" size="sm" onClick={() => {
                  const exportData = filteredSales.map(s => ({
                    'Invoice No': s.invoiceNo,
                    'Date': new Date(s.saleDate || s.createdAt).toLocaleDateString(),
                    'Customer': s.customerName || s.customer,
                    'Total Items': s.totalItems || s.items?.length || 0,
                    'Grand Total': s.grandTotal,
                    'Amount Received': s.amountReceived || s.grandTotal,
                    'Due': (s.grandTotal || 0) - (s.amountReceived || s.grandTotal || 0),
                    'Payment Method': s.paymentMethod,
                    'Status': s.status
                  }));
                  exportToExcel(exportData, 'sales-report.xlsx');
                }}>
                  <i className="mdi mdi-file-excel me-1"></i> Export Excel
                </Button>
                <Button variant="info" size="sm" onClick={() => {
                  const exportData = filteredSales.map(s => ({
                    'Invoice No': s.invoiceNo,
                    'Date': new Date(s.saleDate || s.createdAt).toLocaleDateString(),
                    'Customer': s.customerName || s.customer,
                    'Total Items': s.totalItems || s.items?.length || 0,
                    'Grand Total': s.grandTotal,
                    'Amount Received': s.amountReceived || s.grandTotal,
                    'Due': (s.grandTotal || 0) - (s.amountReceived || s.grandTotal || 0),
                    'Payment Method': s.paymentMethod,
                    'Status': s.status
                  }));
                  exportToCSV(exportData, 'sales-report.csv');
                }}>
                  <i className="mdi mdi-file-delimited me-1"></i> Export CSV
                </Button>
              </ButtonGroup>
            </div>
            <h4 className="page-title">Sales Report</h4>
          </div>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body>
              <Row className="mb-3">
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Customer</Form.Label>
                    <Form.Select
                      value={filterCustomer}
                      onChange={(e) => setFilterCustomer(e.target.value)}
                    >
                      <option value="">All Customers</option>
                      {customers.map((customer, idx) => (
                        <option key={idx} value={customer}>{customer}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Payment Method</Form.Label>
                    <Form.Select
                      value={filterPaymentMethod}
                      onChange={(e) => setFilterPaymentMethod(e.target.value)}
                    >
                      <option value="">All Methods</option>
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="credit">Credit</option>
                      <option value="multiple">Multiple</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Location</Form.Label>
                    <Form.Select
                      value={filterLocation}
                      onChange={(e) => setFilterLocation(e.target.value)}
                    >
                      <option value="">All Locations</option>
                      {locations.map((location, idx) => (
                        <option key={idx} value={location}>{location}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Salesperson</Form.Label>
                    <Form.Select
                      value={filterSalesperson}
                      onChange={(e) => setFilterSalesperson(e.target.value)}
                    >
                      <option value="">All Salespeople</option>
                      {salespeople.map((person, idx) => (
                        <option key={idx} value={person}>{person}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12} className="d-flex">
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
                      <th>Invoice No</th>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Location</th>
                      <th>Salesperson</th>
                      <th>Total Items</th>
                      <th>Grand Total</th>
                      <th>Amount Received</th>
                      <th>Due</th>
                      <th>Payment Method</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.length === 0 ? (
                      <tr>
                        <td colSpan="12" className="text-center text-muted py-4">
                          No sales found
                        </td>
                      </tr>
                    ) : (
                      filteredSales.map((sale, index) => (
                        <tr key={sale.id}>
                          <td>{index + 1}</td>
                          <td>{sale.invoiceNo}</td>
                          <td>{new Date(sale.saleDate || sale.createdAt).toLocaleDateString()}</td>
                          <td>{sale.customerName || sale.customer || 'Walk-In'}</td>
                          <td>{sale.location || '-'}</td>
                          <td>{sale.salesperson || sale.soldBy || '-'}</td>
                          <td className="text-center">{sale.totalItems || sale.items?.length || 0}</td>
                          <td className="text-end">$ {(sale.grandTotal || 0).toFixed(2)}</td>
                          <td className="text-end">$ {(sale.amountReceived || sale.grandTotal || 0).toFixed(2)}</td>
                          <td className="text-end">$ {((sale.grandTotal || 0) - (sale.amountReceived || sale.grandTotal || 0)).toFixed(2)}</td>
                          <td>
                            <Badge bg="info">{(sale.paymentMethod || 'cash').toUpperCase()}</Badge>
                          </td>
                          <td>
                            <Badge bg={sale.status === 'final' ? 'success' : 'warning'}>
                              {(sale.status || 'final').toUpperCase()}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <th colSpan="7" className="text-end">Total:</th>
                      <th className="text-end">$ {totalAmount.toFixed(2)}</th>
                      <th className="text-end">$ {totalReceived.toFixed(2)}</th>
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

export default SalesReportPage;
