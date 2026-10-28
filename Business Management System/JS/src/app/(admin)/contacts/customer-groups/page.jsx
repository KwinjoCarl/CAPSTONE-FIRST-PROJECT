import { Card, Col, Row, Button } from 'react-bootstrap';

const CustomerGroupsPage = () => {
  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <div className="page-title-right">
              <Button variant="primary">
                <i className="mdi mdi-plus-circle me-1"></i> Add Customer Group
              </Button>
            </div>
            <h4 className="page-title">Customer Groups</h4>
          </div>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body>
              <h4 className="header-title mb-3">All Customer Groups</h4>
              <p className="text-muted">Manage customer groups.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default CustomerGroupsPage;
