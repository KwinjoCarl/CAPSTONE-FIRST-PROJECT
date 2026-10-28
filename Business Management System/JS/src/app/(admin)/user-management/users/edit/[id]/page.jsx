import { Card, Col, Row, Button, Form, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getUser, updateUser, getRoles } from '@/services/api';

const EditUserPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    pin: '',
    role_id: '',
    status: 'Active'
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [rolesRes, userRes] = await Promise.all([getRoles(), getUser(id)]);
        setRoles(rolesRes.data);
        const user = userRes.data;
        setFormData({
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          email: user.email || '',
          username: user.username || '',
          password: '',
          confirmPassword: '',
          pin: user.pin || '',
          role_id: user.role_id || '',
          status: user.status || 'Active'
        });
      } catch (err) {
        setError('Failed to load user. Make sure the backend server is running.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.role_id) {
      toast.error('Please select a role');
      return;
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.pin && (formData.pin.length < 4 || formData.pin.length > 6)) {
      toast.error('PIN must be 4-6 digits');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await updateUser(id, {
        username: formData.username,
        email: formData.email,
        password: formData.password || undefined,
        first_name: formData.firstName,
        last_name: formData.lastName,
        role_id: formData.role_id,
        pin: formData.pin || null,
        status: formData.status
      });
      toast.success('User updated successfully');
      navigate('/user-management/users');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update user.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading user...</p>
      </div>
    );
  }

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <div className="page-title-right">
              <Button variant="secondary" onClick={() => navigate('/user-management/users')}>
                <i className="mdi mdi-arrow-left me-1"></i> Back to Users
              </Button>
            </div>
            <h4 className="page-title">Edit/View User</h4>
          </div>
        </Col>
      </Row>

      {error && (
        <Row>
          <Col xs={12}>
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col xs={12}>
            <Card>
              <Card.Body>
                <h5 className="mb-3 text-uppercase bg-light p-2">
                  <i className="mdi mdi-account-circle me-1"></i> User Information
                </h5>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>First Name <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="Email (used to log in)"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>PIN</Form.Label>
                      <Form.Control
                        type="text"
                        name="pin"
                        placeholder="4-6 digit PIN (optional)"
                        value={formData.pin}
                        onChange={handleInputChange}
                        maxLength={6}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col xs={12}>
            <Card>
              <Card.Body>
                <h5 className="mb-3 text-uppercase bg-light p-2">
                  <i className="mdi mdi-lock me-1"></i> Login &amp; Role Assignment
                </h5>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        placeholder="Leave blank to keep current"
                        value={formData.password}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Confirm Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm new password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Role <span className="text-danger">*</span></Form.Label>
                      <Form.Select name="role_id" value={formData.role_id} onChange={handleInputChange} required>
                        <option value="">Select Role</option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name} — {role.permissions?.length || 0} permissions
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Text className="text-muted">
                        The user's access will be limited by this role's permissions.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Status</Form.Label>
                      <Form.Select name="status" value={formData.status} onChange={handleInputChange}>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </Form.Select>
                      <Form.Text className="text-muted">
                        Inactive users cannot log in.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col xs={12}>
            <div className="text-end mb-3">
              <Button variant="secondary" className="me-2" onClick={() => navigate('/user-management/users')}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1"></span> Saving...
                  </>
                ) : (
                  <>
                    <i className="mdi mdi-content-save me-1"></i> Update User
                  </>
                )}
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default EditUserPage;
