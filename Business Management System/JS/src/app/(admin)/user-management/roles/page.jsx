import { Card, Col, Row, Button, Badge, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getRoles, deleteRole } from '@/services/api';
import ActionsDropdown from '@/components/ActionsDropdown';

const RolesPage = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getRoles();
      setRoles(response.data);
    } catch (err) {
      console.error('Error loading roles:', err);
      setError('Failed to load roles. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (role) => {
    if (role.is_system) {
      toast.error('System roles cannot be deleted');
      return;
    }
    if (window.confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      try {
        await deleteRole(role.id);
        toast.success('Role deleted successfully');
        loadRoles();
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to delete role');
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading roles...</p>
      </div>
    );
  }

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <div className="page-title-right">
              <Button variant="primary" onClick={() => navigate('/user-management/roles/add')}>
                <i className="mdi mdi-plus-circle me-1"></i> Add Role
              </Button>
            </div>
            <h4 className="page-title">Roles</h4>
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
              <h4 className="header-title mb-3">All Roles</h4>
              <p className="text-muted">Manage user roles and their permissions. Each role defines which modules and functions a user can access.</p>
              <div className="table-responsive">
                <table className="table table-centered table-nowrap mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Role Name</th>
                      <th>Description</th>
                      <th>Permissions</th>
                      <th>Type</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.length > 0 ? (
                      roles.map((role) => (
                        <tr key={role.id}>
                          <td>
                            <strong>{role.name}</strong>
                          </td>
                          <td className="text-muted">{role.description || '-'}</td>
                          <td>
                            <Badge bg="info">
                              {role.permissions?.length || 0} permissions
                            </Badge>
                          </td>
                          <td>
                            {role.is_system ? (
                              <Badge bg="secondary">System</Badge>
                            ) : (
                              <Badge bg="success">Custom</Badge>
                            )}
                          </td>
                          <td>
                            <ActionsDropdown
                              onEdit={() => navigate(`/user-management/roles/edit/${role.id}`)}
                              onDelete={role.is_system ? undefined : () => handleDelete(role)}
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-4">
                          No roles found. Click "Add Role" to create one.
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

export default RolesPage;
