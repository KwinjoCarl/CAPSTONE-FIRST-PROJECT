import { Card, Col, Row, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const AccessDenied = ({ permission }) => {
  const navigate = useNavigate();

  return (
    <Row className="justify-content-center mt-5">
      <Col md={6}>
        <Card className="text-center">
          <Card.Body className="py-5">
            <div className="mb-3">
              <i className="mdi mdi-lock text-danger" style={{ fontSize: '64px' }}></i>
            </div>
            <h3 className="mb-2">Access Denied</h3>
            <p className="text-muted mb-1">
              You do not have permission to access this page.
            </p>
            {permission && (
              <p className="text-muted small mb-4">
                Required permission: <code>{permission}</code>
              </p>
            )}
            <Button variant="primary" onClick={() => navigate('/home')}>
              <i className="mdi mdi-home me-1"></i> Back to Home
            </Button>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default AccessDenied;
