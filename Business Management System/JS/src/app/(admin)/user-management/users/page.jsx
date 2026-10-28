import { Card, Col, Row, Button, Badge, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getUsers, deleteUser } from '@/services/api';
import ActionsDropdown from '@/components/ActionsDropdown';

const UsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUsers();
      setUsers(response.data);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user) => {
    if (window.confirm(`Are you sure you want to delete user "${user.first_name} ${user.last_name}" (${user.email})?`)) {
      try {
        await deleteUser(user.id);
        toast.success('User deleted successfully');
        loadUsers();
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to delete user');
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading users...</p>
      </div>
    );
  }

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <div className="page-title-right">
              <Button variant="primary" onClick={() => navigate('/user-management/users/add')}>
                <i className="mdi mdi-plus-circle me-1"></i> Add User
              </Button>
            </div>
            <h4 className="page-title">Users</h4>
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

      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body>
              <h4 className="header-title mb-3">All Users</h4>
              <p className="text-muted">Manage system users and their role assignments.</p>
              <div className="table-responsive">
                <table className="table table-centered table-nowrap mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Username</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 ? (
                      users.map((user) => (
                        <tr key={user.id}>
                          <td>
                            {user.first_name} {user.last_name}
                          </td>
                          <td>{user.email}</td>
                          <td>
                            <code>{user.username}</code>
                          </td>
                          <td>
                            <Badge bg="primary">
                              {user.role_name || user.role || 'No Role'}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg={(user.status || 'Active') === 'Active' ? 'success' : 'danger'}>
                              {user.status || 'Active'}
                            </Badge>
                          </td>
                          <td>
                            <ActionsDropdown
                              onEdit={() => navigate(`/user-management/users/edit/${user.id}`)}
                              onDelete={() => handleDelete(user)}
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-4">
                          No users found. Click "Add User" to create one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default UsersPage;
