import { Card, Col, Row, Button, Modal, Form, Table, Badge } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getPaymentAccounts, savePaymentAccounts } from '@/helpers/settings';
import ActionsDropdown from '@/components/ActionsDropdown';

const ACCOUNT_TYPES = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank' },
  { value: 'mobile', label: 'Mobile Money' },
  { value: 'card', label: 'Card' }
];

const PaymentAccountsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({ name: '', accountNumber: '', type: 'cash', isDefault: false });

  useEffect(() => {
    setAccounts(getPaymentAccounts());
  }, []);

  const persist = (list) => {
    savePaymentAccounts(list);
    setAccounts([...list]);
  };

  const handleShow = () => {
    setEditMode(false);
    setSelected(null);
    setFormData({ name: '', accountNumber: '', type: 'cash', isDefault: false });
    setShowModal(true);
  };

  const handleEdit = (account) => {
    setEditMode(true);
    setSelected(account);
    setFormData({
      name: account.name,
      accountNumber: account.accountNumber || '',
      type: account.type || 'cash',
      isDefault: !!account.isDefault
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Account name is required');
      return;
    }

    if (editMode && selected) {
      let updated = accounts.map(a =>
        a.id === selected.id
          ? { ...a, name: formData.name.trim(), accountNumber: formData.accountNumber, type: formData.type, isDefault: formData.isDefault }
          : a
      );
      if (formData.isDefault) {
        updated = updated.map(a => (a.id === selected.id ? a : { ...a, isDefault: false }));
      }
      persist(updated);
      toast.success('Payment account updated successfully');
    } else {
      const duplicate = accounts.some(a => a.name.toLowerCase() === formData.name.trim().toLowerCase());
      if (duplicate) {
        toast.error('An account with this name already exists');
        return;
      }
      const newAccount = {
        id: `acct-${Date.now()}`,
        name: formData.name.trim(),
        accountNumber: formData.accountNumber,
        type: formData.type,
        isDefault: formData.isDefault
      };
      let updated = [...accounts, newAccount];
      if (formData.isDefault) {
        updated = updated.map(a => (a.id === newAccount.id ? a : { ...a, isDefault: false }));
      }
      persist(updated);
      toast.success('Payment account added successfully');
    }
    setShowModal(false);
  };

  const handleDelete = (account) => {
    if (account.isDefault) {
      toast.error('Cannot delete the default account');
      return;
    }
    if (window.confirm(`Delete payment account "${account.name}"?`)) {
      persist(accounts.filter(a => a.id !== account.id));
      toast.success('Payment account deleted');
    }
  };

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <div className="page-title-right">
              <Button variant="primary" onClick={handleShow}>
                <i className="mdi mdi-plus-circle me-1"></i> Add Payment Account
              </Button>
            </div>
            <h4 className="page-title">Payment Accounts</h4>
          </div>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body>
              <h4 className="header-title mb-3">All Payment Accounts</h4>
              <p className="text-muted">Accounts shown here appear when recording payments for purchases and expenses.</p>
              <div className="table-responsive">
                <Table className="table-centered table-nowrap mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Account Name</th>
                      <th>Type</th>
                      <th>Account Number</th>
                      <th>Default</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.length > 0 ? (
                      accounts.map((account) => (
                        <tr key={account.id}>
                          <td><strong>{account.name}</strong></td>
                          <td>
                            <Badge bg={{ cash: 'success', bank: 'info', mobile: 'warning', card: 'secondary' }[account.type] || 'secondary'}>
                              {ACCOUNT_TYPES.find(t => t.value === account.type)?.label || account.type}
                            </Badge>
                          </td>
                          <td>{account.accountNumber || '-'}</td>
                          <td>
                            {account.isDefault ? (
                              <Badge bg="success">Default</Badge>
                            ) : (
                              <Badge bg="secondary">-</Badge>
                            )}
                          </td>
                          <td>
                            <ActionsDropdown
                              onEdit={() => handleEdit(account)}
                              onDelete={() => handleDelete(account)}
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-4">
                          No payment accounts found. Click "Add Payment Account" to create one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Edit/View Payment Account' : 'Add Payment Account'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Account Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Cash, FNB Current Account"
                required
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Account Type</Form.Label>
              <Form.Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                {ACCOUNT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Account Number</Form.Label>
              <Form.Control
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                placeholder="Optional"
              />
            </Form.Group>
            <Form.Check
              type="checkbox"
              label="Set as default account"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">
              <i className="mdi mdi-content-save me-1"></i> Save
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default PaymentAccountsPage;
