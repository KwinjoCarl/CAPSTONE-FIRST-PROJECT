import { Card, Col, Row, Button, Form, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getRole, updateRole } from '@/services/api';
import { PERMISSION_GROUPS } from '@/helpers/permissions';

const EditRolePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [roleName, setRoleName] = useState('');
  const [description, setDescription] = useState('');
  const [isSystem, setIsSystem] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRole = async () => {
      try {
        setLoading(true);
        const response = await getRole(id);
        const role = response.data;
        setRoleName(role.name);
        setDescription(role.description || '');
        setIsSystem(!!role.is_system);
        setSelected(new Set(role.permissions || []));
      } catch (err) {
        setError('Failed to load role. Make sure the backend server is running.');
      } finally {
        setLoading(false);
      }
    };
    loadRole();
  }, [id]);

  const togglePermission = (perm) => {
    const next = new Set(selected);
    if (next.has(perm)) {
      next.delete(perm);
    } else {
      next.add(perm);
    }
    setSelected(next);
  };

  const toggleGroup = (group) => {
    const names = group.permissions.map(p => p.name);
    const allSelected = names.every(n => selected.has(n));
    const next = new Set(selected);
    names.forEach(n => {
      if (allSelected) {
        next.delete(n);
      } else {
        next.add(n);
      }
    });
    setSelected(next);
  };

  const toggleAll = () => {
    const allPerms = PERMISSION_GROUPS.flatMap(g => g.permissions.map(p => p.name));
    const allSelected = allPerms.every(p => selected.has(p));
    setSelected(allSelected ? new Set() : new Set(allPerms));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!roleName.trim()) {
      toast.error('Role name is required');
      return;
    }
    if (selected.size === 0) {
      toast.error('Please select at least one permission');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await updateRole(id, {
        name: roleName.trim(),
        description: description.trim(),
        permissions: Array.from(selected)
      });
      toast.success(`Role "${roleName.trim()}" updated successfully`);
      navigate('/user-management/roles');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update role.';
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
        <p className="mt-2">Loading role...</p>
      </div>
    );
  }

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <div className="page-title-right">
              <Button variant="secondary" onClick={() => navigate('/user-management/roles')}>
                <i className="mdi mdi-arrow-left me-1"></i> Back to Roles
              </Button>
            </div>
            <h4 className="page-title">Edit/View Role</h4>
          </div>
        </Col>
      </Row>

      {isSystem && (
        <Row>
          <Col xs={12}>
            <Alert variant="info">
              <i className="mdi mdi-information me-2"></i>
              This is a system role. You can edit its permissions but it cannot be deleted.
            </Alert>
          </Col>
        </Row>
      )}

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
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Role Name <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Role Name"
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="What can this role do?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
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
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0 text-uppercase bg-light p-2">
                    <i className="mdi mdi-shield-check me-1"></i> Permissions
                  </h5>
                  <div>
                    <span className="badge bg-info me-2">{selected.size} selected</span>
                    <Button variant="link" size="sm" className="text-decoration-none" onClick={toggleAll}>
                      Select / Deselect All
                    </Button>
                  </div>
                </div>

                {PERMISSION_GROUPS.map((group, index) => {
                  const names = group.permissions.map(p => p.name);
                  const allSelected = names.every(n => selected.has(n));
                  const someSelected = names.some(n => selected.has(n));

                  return (
                    <div key={index} className="mb-4">
                      <Row className="align-items-center mb-2">
                        <Col md={3}>
                          <h6 className="mb-0">{group.title}</h6>
                        </Col>
                        <Col md={9}>
                          <Button
                            variant="link"
                            size="sm"
                            className="text-decoration-none p-0"
                            onClick={() => toggleGroup(group)}
                          >
                            {allSelected ? 'Deselect all' : 'Select all'}
                          </Button>
                          {someSelected && !allSelected && (
                            <span className="badge bg-warning ms-2">partial</span>
                          )}
                        </Col>
                      </Row>
                      <Row>
                        {group.permissions.map((permission, pIndex) => (
                          <Col md={6} lg={4} key={pIndex}>
                            <Form.Check
                              type="checkbox"
                              id={`perm-${permission.name}`}
                              label={permission.label}
                              checked={selected.has(permission.name)}
                              onChange={() => togglePermission(permission.name)}
                              className="mb-2"
                            />
                          </Col>
                        ))}
                      </Row>
                      {index < PERMISSION_GROUPS.length - 1 && <hr />}
                    </div>
                  );
                })}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col xs={12}>
            <div className="text-end mb-3">
              <Button variant="secondary" className="me-2" onClick={() => navigate('/user-management/roles')}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1"></span> Saving...
                  </>
                ) : (
                  <>
                    <i className="mdi mdi-content-save me-1"></i> Update Role
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

export default EditRolePage;
