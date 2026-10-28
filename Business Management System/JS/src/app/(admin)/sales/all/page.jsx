import { Card, Col, Row, Button, Table, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ActionsDropdown from '@/components/ActionsDropdown';

const AllSalesPage = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = () => {
    const storedSales = JSON.parse(localStorage.getItem('bms_sales') || '[]');
    setSales(storedSales);
  };

  const calculateTotals = () => {
    const totalAmount = sales.reduce((sum, sale) => sum + (sale.grandTotal || 0), 0);
    const totalItems = sales.reduce((sum, sale) => sum + (sale.totalItems || 0), 0);
    return { totalAmount, totalItems };
  };

  const totals = calculateTotals();

  const handleEdit = (saleId) => {
    navigate(`/sales/edit/${saleId}`);
  };

  const handleDelete = (saleId) => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      const updatedSales = sales.filter(sale => sale.id !== saleId);
      localStorage.setItem('bms_sales', JSON.stringify(updatedSales));
      setSales(updatedSales);
      toast.success('SUCCESSFUL');
    }
  };

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <div className="page-title-right">
              <Button variant="primary" onClick={() => navigate('/sales/add')}>
                <i className="mdi mdi-plus me-1"></i> Add
              </Button>
            </div>
            <h4 className="page-title">Sales</h4>
          </div>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body>
              <div className="mb-3">
                <Button variant="link" className="text-decoration-none">
                  <i className="mdi mdi-filter-variant me-1"></i> Filters
                </Button>
              </div>

              <div className="mb-3">
                <Button variant="outline-primary" size="sm" className="me-2">
                  All sales
                </Button>
              </div>

              <div className="mb-3">
                <span className="me-2">Show:</span>
                <select className="form-select form-select-sm d-inline-block" style={{ width: 'auto' }}>
                  <option>25</option>
                  <option>50</option>
                  <option>100</option>
                </select>
                <span className="ms-2 me-3">entries</span>

                <Button variant="outline-secondary" size="sm" className="me-2">
                  <i className="mdi mdi-export me-1"></i> Export CSV
                </Button>
                <Button variant="outline-secondary" size="sm" className="me-2">
                  <i className="mdi mdi-export me-1"></i> Export Excel
                </Button>
                <Button variant="outline-secondary" size="sm" className="me-2">
                  <i className="mdi mdi-printer me-1"></i> Print
                </Button>
              </div>

              <div className="table-responsive">
                <Table className="table-centered table-nowrap mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Invoice No.</th>
                      <th>Customer Name</th>
                      <th>Contact Number</th>
                      <th>Status</th>
                      <th>Payment Method</th>
                      <th>Total Items</th>
                      <th>Total Amount</th>
                      <th>Sell Note</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.length > 0 ? (
                      sales.map((sale) => (
                        <tr key={sale.id}>
                          <td>{new Date(sale.saleDate).toLocaleDateString()}</td>
                          <td>{sale.invoiceNo}</td>
                          <td>{sale.customerName}</td>
                          <td>{sale.customerMobile || 'N/A'}</td>
                          <td>
                            <Badge bg={
                              sale.status === 'final' ? 'success' :
                              sale.status === 'draft' ? 'warning' :
                              'info'
                            }>
                              {sale.status}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg="secondary">
                              {sale.paymentMethod}
                            </Badge>
                          </td>
                          <td>{sale.totalItems}</td>
                          <td>${sale.grandTotal.toFixed(2)}</td>
                          <td>{sale.sellNote || '-'}</td>
                          <td>
                            <ActionsDropdown
                              onEdit={() => handleEdit(sale.id)}
                              onDelete={() => handleDelete(sale.id)}
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="10" className="text-center text-muted py-4">
                          No sales found. Click "Add" to create a new sale.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-light">
                      <td colSpan="6"><strong>Total:</strong></td>
                      <td><strong>{totals.totalItems}</strong></td>
                      <td><strong>$ {totals.totalAmount.toFixed(2)}</strong></td>
                      <td colSpan="2"></td>
                    </tr>
                  </tfoot>
                </Table>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="text-muted">
                  Showing {sales.length} of {sales.length} entries
                </div>
                <div>
                  <span className="me-2">Total Sales: <strong>$ {totals.totalAmount.toFixed(2)}</strong></span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default AllSalesPage;
