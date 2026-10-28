import { Card, Col, Row, Button } from 'react-bootstrap';

const PlaceholderPage = ({ title, description, showAddButton = true, addButtonText = 'Add New' }) => {
  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            {showAddButton && (
              <div className="page-title-right">
                <Button variant="primary">
                  <i className="mdi mdi-plus-circle me-1"></i> {addButtonText}
                </Button>
              </div>
            )}
            <h4 className="page-title">{title}</h4>
          </div>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body>
              <h4 className="header-title mb-3">{title}</h4>
              <p className="text-muted">{description}</p>
              <div className="alert alert-info">
                <strong>Coming Soon!</strong> This module is under development.
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default PlaceholderPage;
