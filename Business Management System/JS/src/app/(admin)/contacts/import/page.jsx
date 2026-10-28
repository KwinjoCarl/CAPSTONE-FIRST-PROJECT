import { Card, Col, Row, Button } from 'react-bootstrap';

const ImportContactsPage = () => {
  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <h4 className="page-title">Import Contacts</h4>
          </div>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body>
              <h4 className="header-title mb-3">Import Contacts</h4>
              <p className="text-muted">Import contacts from CSV or Excel file.</p>
              <div className="mt-3">
                <Button variant="primary">Choose File</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ImportContactsPage;
