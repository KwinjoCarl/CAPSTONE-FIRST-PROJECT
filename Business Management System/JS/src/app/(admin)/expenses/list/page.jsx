import { Card, Col, Row, Button, Table, Badge, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ActionsDropdown from '@/components/ActionsDropdown';

const ListExpensesPage = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = () => {
    const storedExpenses = JSON.parse(localStorage.getItem('bms_expenses') || '[]');
    setExpenses(storedExpenses);
  };

  const handleView = (expense) => {
    setSelectedExpense(expense);
    setShowViewModal(true);
  };

  const handleDelete = (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      const updatedExpenses = expenses.filter(expense => expense.id !== expenseId);
      localStorage.setItem('bms_expenses', JSON.stringify(updatedExpenses));
      setExpenses(updatedExpenses);
      toast.success('Expense deleted successfully');
    }
  };

  const calculateTotals = () => {
    const totalAmount = expenses.reduce((sum, expense) => sum + (parseFloat(expense.totalAmount) || 0), 0);
    return { totalAmount };
  };

  const totals = calculateTotals();

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <div className="page-title-right">
              <Button variant="primary" onClick={() => navigate('/expenses/add')}>
                <i className="mdi mdi-plus me-1"></i> Add
              </Button>
            </div>
            <h4 className="page-title">Expenses</h4>
          </div>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body>
              <div className="mb-3">
                <Button variant="link" className="text-decoration-none">
                  <i className="mdi mdi-filter-variant me-1"></i> Filters
                </Button>
              </div>

              <div className="mb-3">
                <Button variant="outline-primary" size="sm" className="me-2">
                  All expenses
                </Button>
              </div>

              <div className="mb-3">
                <span className="me-2">Show:</span>
                <select className="form-select form-select-sm d-inline-block" style={{ width: 'auto' }}>
                  <option>25</option>
                  <option>50</option>
                  <option>100</option>
                </select>
                <span className="ms-2 me-3">entries</span>
              </div>

              <div className="table-responsive">
                <Table className="table-centered table-nowrap mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Reference No.</th>
                      <th>Expense Category</th>
                      <th>Sub-category</th>
                      <th>Location</th>
                      <th>Tax</th>
                      <th>Total Amount</th>
                      <th>Payment Method</th>
                      <th>Expense Note</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.length > 0 ? (
                      expenses.map((expense) => (
                        <tr key={expense.id}>
                          <td>{new Date(expense.date).toLocaleDateString()}</td>
                          <td>{expense.referenceNo}</td>
                          <td>{expense.expenseCategory || '-'}</td>
                          <td>{expense.subCategory || '-'}</td>
                          <td>{expense.businessLocation || '-'}</td>
                          <td>{expense.applicableTax || 'None'}</td>
                          <td>${parseFloat(expense.totalAmount).toFixed(2)}</td>
                          <td>
                            <Badge bg="secondary">
                              {expense.paymentMethod || 'N/A'}
                            </Badge>
                          </td>
                          <td>{expense.expenseNote || '-'}</td>
                          <td>
                            <ActionsDropdown
                              onEdit={() => handleView(expense)}
                              onDelete={() => handleDelete(expense.id)}
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="10" className="text-center text-muted py-4">
                          No expenses found. Click "Add" to create a new expense.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-light">
                      <td colSpan="6"><strong>Total:</strong></td>
                      <td><strong>$ {totals.totalAmount.toFixed(2)}</strong></td>
                      <td colSpan="3"></td>
                    </tr>
                  </tfoot>
                </Table>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="text-muted">
                  Showing {expenses.length} of {expenses.length} entries
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* View Expense Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Expense Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedExpense && (
            <Table bordered size="sm">
              <tbody>
                <tr>
                  <th style={{ width: '40%' }}>Date</th>
                  <td>{new Date(selectedExpense.date).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <th>Reference No.</th>
                  <td>{selectedExpense.referenceNo}</td>
                </tr>
                <tr>
                  <th>Category</th>
                  <td>{selectedExpense.expenseCategory || '-'}</td>
                </tr>
                <tr>
                  <th>Sub-category</th>
                  <td>{selectedExpense.subCategory || '-'}</td>
                </tr>
                <tr>
                  <th>Location</th>
                  <td>{selectedExpense.businessLocation || '-'}</td>
                </tr>
                <tr>
                  <th>Tax</th>
                  <td>{selectedExpense.applicableTax || 'None'}</td>
                </tr>
                <tr>
                  <th>Total Amount</th>
                  <td className="fw-bold">${parseFloat(selectedExpense.totalAmount || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <th>Paid Amount</th>
                  <td>${parseFloat(selectedExpense.amount || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <th>Payment Method</th>
                  <td>{selectedExpense.paymentMethod || '-'}</td>
                </tr>
                {selectedExpense.expenseNote && (
                  <tr>
                    <th>Note</th>
                    <td>{selectedExpense.expenseNote}</td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ListExpensesPage;
