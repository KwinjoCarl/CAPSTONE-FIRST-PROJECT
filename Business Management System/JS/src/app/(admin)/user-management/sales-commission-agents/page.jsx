import { Card, Col, Row, Button } from 'react-bootstrap';

const SalesCommissionAgentsPage = () => {
  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <div className="page-title-right">
              <Button variant="primary">
                <i className="mdi mdi-plus-circle me-1"></i> Add Agent
              </Button>
            </div>
            <h4 className="page-title">Sales Commission Agents</h4>
          </div>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body>
              <h4 className="header-title mb-3">All Sales Commission Agents</h4>
              <p className="text-muted">Manage sales commission agents.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default SalesCommissionAgentsPage;
