import { Card, Col, Row, Button, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const QuotationsPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <div className="page-title-right">
              <Button variant="primary" onClick={() => navigate('/sales/quotations/add')}>
                <i className="mdi mdi-plus me-1"></i> Add
              </Button>
            </div>
            <h4 className="page-title">List Quotations</h4>
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
                      <th>Action</th>
                      <th>Date</th>
                      <th>Reference No.</th>
                      <th>Customer name</th>
                      <th>Contact Number</th>
                      <th>Location</th>
                      <th>Payment Status</th>
                      <th>Total amount</th>
                      <th>Total paid</th>
                      <th>Sell Due</th>
                      <th>Added by</th>
                      <th>Shipping Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan="12" className="text-center text-muted py-4">
                        No data available in table
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="bg-light">
                      <td colSpan="7"><strong>Total:</strong></td>
                      <td><strong>$ 0.00</strong></td>
                      <td><strong>$ 0.00</strong></td>
                      <td><strong>$ 0.00</strong></td>
                      <td colSpan="2"></td>
                    </tr>
                  </tfoot>
                </Table>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="text-muted">
                  Showing 0 to 0 of 0 entries
                </div>
                <div>
                  <Button variant="outline-secondary" size="sm" className="me-2">Previous</Button>
                  <Button variant="outline-secondary" size="sm">Next</Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default QuotationsPage;
