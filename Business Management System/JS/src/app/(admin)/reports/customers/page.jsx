import { Card, Col, Row, Table, Form, Button, ButtonGroup } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { exportToCSV, exportToExcel, formatDataForExport } from '@/utils/exportUtils';

const CustomersReportPage = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = () => {
    const sales = JSON.parse(localStorage.getItem('bms_sales') || '[]');
    const salesReturns = JSON.parse(localStorage.getItem('bms_sales_returns') || '[]');
    const payments = JSON.parse(localStorage.getItem('bms_customer_payments') || '[]');
    
    // Aggregate customer data from sales
    const customerMap = {};
    
    sales.forEach(sale => {
      const customerName = sale.customerName || sale.customer || 'Walk-In Customer';
      
      if (!customerMap[customerName]) {
        customerMap[customerName] = {
          name: customerName,
          mobile: sale.customerMobile || '-',
          email: sale.customerEmail || '-',
          totalSales: 0,
          totalAmount: 0,
          totalPaid: 0,
          totalDue: 0,
          salesCount: 0,
          returnAmount: 0,
          advancePayment: 0
        };
      }
      
      customerMap[customerName].totalSales += sale.grandTotal || 0;
      customerMap[customerName].totalAmount += sale.grandTotal || 0;
      customerMap[customerName].totalPaid += sale.amountReceived || 0;
      customerMap[customerName].totalDue += (sale.grandTotal || 0) - (sale.amountReceived || 0);
      customerMap[customerName].salesCount += 1;
    });

    // Subtract sales returns (refunds)
    salesReturns.forEach(returnItem => {
      const customerName = returnItem.customerName || returnItem.customer || 'Walk-In Customer';
      if (customerMap[customerName]) {
        customerMap[customerName].returnAmount += returnItem.grandTotal || 0;
        customerMap[customerName].totalDue -= returnItem.grandTotal || 0;
      }
    });

    // Add advance payments
    payments.forEach(payment => {
      const customerName = payment.customerName || payment.customer;
      if (customerMap[customerName]) {
        customerMap[customerName].advancePayment += payment.amount || 0;
        customerMap[customerName].totalPaid += payment.amount || 0;
        customerMap[customerName].totalDue -= payment.amount || 0;
      }
    });
    
    const customerList = Object.values(customerMap);
    setCustomers(customerList);
    setFilteredCustomers(customerList);
  };

  const handleFilter = () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      setFilteredCustomers(customers);
      return;
    }

    const sales = JSON.parse(localStorage.getItem('bms_sales') || '[]');
    const filtered = sales.filter(sale => {
      const saleDate = new Date(sale.saleDate || sale.createdAt);
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      return saleDate >= start && saleDate <= end;
    });

    // Re-aggregate filtered data
    const customerMap = {};
    filtered.forEach(sale => {
      const customerName = sale.customerName || sale.customer || 'Walk-In Customer';
      if (!customerMap[customerName]) {
        customerMap[customerName] = {
          name: customerName,
          mobile: sale.customerMobile || '-',
          totalSales: 0,
          totalAmount: 0,
          totalPaid: 0,
          totalDue: 0,
          salesCount: 0
        };
      }
      customerMap[customerName].totalSales += sale.grandTotal || 0;
      customerMap[customerName].totalAmount += sale.grandTotal || 0;
      customerMap[customerName].totalPaid += sale.amountReceived || sale.grandTotal || 0;
      customerMap[customerName].totalDue += (sale.grandTotal || 0) - (sale.amountReceived || sale.grandTotal || 0);
      customerMap[customerName].salesCount += 1;
    });

    setFilteredCustomers(Object.values(customerMap));
  };

  const handleReset = () => {
    setDateRange({ startDate: '', endDate: '' });
    setFilteredCustomers(customers);
  };

  const totalSales = filteredCustomers.reduce((sum, c) => sum + c.totalAmount, 0);
  const totalPaid = filteredCustomers.reduce((sum, c) => sum + c.totalPaid, 0);
  const totalDue = filteredCustomers.reduce((sum, c) => sum + c.totalDue, 0);

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
                    const exportData = formatDataForExport(filteredCustomers, {
                      name: 'Customer Name',
                      mobile: 'Mobile',
                      salesCount: 'Total Sales',
                      totalAmount: 'Total Amount',
                      totalPaid: 'Total Paid',
                      totalDue: 'Total Due'
                    });
                    exportToExcel(exportData, 'customers-report.xlsx');
                  }}
                >
                  <i className="mdi mdi-file-excel me-1"></i> Export Excel
                </Button>
                <Button 
                  variant="info" 
                  size="sm"
                  onClick={() => {
                    const exportData = formatDataForExport(filteredCustomers, {
                      name: 'Customer Name',
                      mobile: 'Mobile',
                      salesCount: 'Total Sales',
                      totalAmount: 'Total Amount',
                      totalPaid: 'Total Paid',
                      totalDue: 'Total Due'
                    });
                    exportToCSV(exportData, 'customers-report.csv');
                  }}
                >
                  <i className="mdi mdi-file-delimited me-1"></i> Export CSV
                </Button>
              </ButtonGroup>
            </div>
            <h4 className="page-title">Customers Report</h4>
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
                      <th>Customer Name</th>
                      <th>Mobile</th>
                      <th>Total Sales</th>
                      <th>Total Amount</th>
                      <th>Total Paid</th>
                      <th>Total Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center text-muted py-4">
                          No customer data available
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((customer, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{customer.name}</td>
                          <td>{customer.mobile}</td>
                          <td>{customer.salesCount}</td>
                          <td className="text-end">$ {customer.totalAmount.toFixed(2)}</td>
                          <td className="text-end">$ {customer.totalPaid.toFixed(2)}</td>
                          <td className="text-end">$ {customer.totalDue.toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <th colSpan="4" className="text-end">Total:</th>
                      <th className="text-end">$ {totalSales.toFixed(2)}</th>
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

export default CustomersReportPage;
