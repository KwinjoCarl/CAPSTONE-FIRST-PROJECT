import { useEffect, useState } from 'react';
import { Card, CardBody, Col, Row, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const SignUp = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    position: ''
  });

  useEffect(() => {
    document.body.classList.add('authentication-bg');
    return () => {
      document.body.classList.remove('authentication-bg');
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast.error('Please fill in Full Name, Phone Number and Company Email');
      return;
    }

    const requests = JSON.parse(localStorage.getItem('bms_account_requests') || '[]');
    requests.push({
      id: Date.now().toString(),
      ...formData,
      status: 'pending',
      requestedAt: new Date().toISOString()
    });
    localStorage.setItem('bms_account_requests', JSON.stringify(requests));

    toast.success('Account request sent to the System Administrator');
    setSubmitted(true);
  };

  return (
    <div className="">
      <div className="account-pages py-5">
        <div className="container">
          <Row className="justify-content-center">
            <Col md={6} lg={5}>
              <Card className="border-0 shadow-lg">
                <CardBody className="p-5">
                  <div className="text-center">
                    <div className="mx-auto mb-4 text-center auth-logo">
                      <h2 className="fw-bold text-primary mb-0">BMS</h2>
                    </div>
                    <h4 className="fw-bold text-dark mb-2">Request Account Access</h4>
                    <p className="text-muted">Submit your details and the System Administrator will review and create your account.</p>
                  </div>

                  {submitted ? (
                    <Alert variant="success" className="mt-4 text-center">
                      <i className="mdi mdi-check-circle-outline fs-4 d-block mb-2"></i>
                      Your request has been sent to the System Administrator for approval.
                      <div className="mt-3">
                        <Link to="/auth/sign-in" className="btn btn-dark btn-sm">
                          Back to Sign In
                        </Link>
                      </div>
                    </Alert>
                  ) : (
                    <Form onSubmit={handleSubmit} className="mt-4">
                      <Form.Group className="mb-3">
                        <Form.Label>Full Name <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder="Enter your full name"
                          required
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Phone Number <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="e.g. +263 77 000 0000"
                          required
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Company Email <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter your company email"
                          required
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Position</Form.Label>
                        <Form.Control
                          name="position"
                          value={formData.position}
                          onChange={handleChange}
                          placeholder="e.g. Sales Manager, Cashier"
                        />
                      </Form.Group>
                      <div className="d-grid">
                        <Button variant="dark" size="lg" type="submit">
                          <i className="mdi mdi-send me-1"></i> Send Request
                        </Button>
                      </div>
                    </Form>
                  )}
                </CardBody>
              </Card>
              <p className="text-center mt-4 text-white text-opacity-50">
                I already have an account&nbsp;
                <Link to="/auth/sign-in" className="text-decoration-none text-white fw-bold">
                  Sign In
                </Link>
              </p>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};
export default SignUp;
