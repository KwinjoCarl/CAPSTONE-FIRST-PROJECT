import { Card, Col, Row, Button, Table, Badge, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ActionsDropdown from '@/components/ActionsDropdown';
import * as XLSX from 'xlsx';

const ListStockAdjustmentPage = () => {
  const navigate = useNavigate();
  const [adjustments, setAdjustments] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState(null);

  useEffect(() => {
    loadAdjustments();
  }, []);

  const loadAdjustments = () => {
    const storedAdjustments = JSON.parse(localStorage.getItem('bms_stock_adjustments') || '[]');
    setAdjustments(storedAdjustments);
  };

  const handleView = (adjustment) => {
    setSelectedAdjustment(adjustment);
    setShowViewModal(true);
  };

  const handleDelete = (adjustmentId) => {
    if (window.confirm('Are you sure you want to delete this stock adjustment?')) {
      const updatedAdjustments = adjustments.filter(adj => adj.id !== adjustmentId);
      localStorage.setItem('bms_stock_adjustments', JSON.stringify(updatedAdjustments));
      setAdjustments(updatedAdjustments);
      toast.success('Stock adjustment deleted successfully');
    }
  };

  const calculateTotals = () => {
    const totalCost = adjustments.reduce((sum, adj) => sum + (adj.totalCost || 0), 0);
    return { totalCost };
  };

  const totals = calculateTotals();

  const handleDownloadExcel = () => {
    const headers = ['Date', 'Reference No.', 'Location', 'Adjustment Type', 'Total Items', 'Total Cost Impact', 'Status', 'Added By'];
    const rows = adjustments.map((a) => [
      a.date ? new Date(a.date).toLocaleDateString() : '',
      a.referenceNo || '',
      a.businessLocation || '',
      a.adjustmentType || '',
      a.totalItems ?? '',
      a.totalCost ?? 0,
      a.status || '',
      a.createdBy || ''
    ]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stock Adjustments');
    XLSX.writeFile(wb, 'stock-adjustments.xlsx');
  };

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <div className="page-title-right">
              <Button variant="primary" onClick={() => navigate('/stock-adjustment/add')}>
                <i className="mdi mdi-plus me-1"></i> Add
              </Button>
            </div>
            <h4 className="page-title">Stock Adjustments</h4>
          </div>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body>
              <div className="mb-3">
                <Button variant="outline-primary" size="sm" className="me-2">
                  All stock adjustments
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

                <Button variant="success" size="sm" onClick={handleDownloadExcel}>
                  <i className="mdi mdi-download me-1"></i> Download Excel
                </Button>
              </div>

              <div className="table-responsive">
                <Table className="table-centered table-nowrap mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Reference No.</th>
                      <th>Location</th>
                      <th>Adjustment Type</th>
                      <th>Total Items</th>
                      <th>Total Cost Impact</th>
                      <th>Status</th>
                      <th>Added By</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adjustments.length > 0 ? (
                      adjustments.map((adjustment) => (
                        <tr key={adjustment.id}>
                          <td>{new Date(adjustment.date).toLocaleDateString()}</td>
                          <td>{adjustment.referenceNo}</td>
                          <td>{adjustment.businessLocation}</td>
                          <td>
                            <Badge bg={adjustment.adjustmentType === 'normal' ? 'info' : 'warning'}>
                              {adjustment.adjustmentType}
                            </Badge>
                          </td>
                          <td>{adjustment.totalItems}</td>
                          <td className={adjustment.totalCost >= 0 ? 'text-success' : 'text-danger'}>
                            {adjustment.totalCost >= 0 ? '+' : '-'}${Math.abs(adjustment.totalCost).toFixed(2)}
                          </td>
                          <td>
                            <Badge bg="success">{adjustment.status}</Badge>
                          </td>
                          <td>{adjustment.createdBy}</td>
                          <td>
                            <ActionsDropdown
                              onEdit={() => handleView(adjustment)}
                              onDelete={() => handleDelete(adjustment.id)}
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="text-center text-muted py-4">
                          No stock adjustments found. Click "Add" to create one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-light">
                      <td colSpan="5"><strong>Total:</strong></td>
                      <td className={totals.totalCost >= 0 ? 'text-success' : 'text-danger'}>
                        <strong>
                          {totals.totalCost >= 0 ? '+' : '-'}${Math.abs(totals.totalCost).toFixed(2)}
                        </strong>
                      </td>
                      <td colSpan="3"></td>
                    </tr>
                  </tfoot>
                </Table>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="text-muted">
                  Showing {adjustments.length} of {adjustments.length} entries
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* View Stock Adjustment Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Stock Adjustment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAdjustment && (
            <Table bordered size="sm">
              <tbody>
                <tr>
                  <th style={{ width: '40%' }}>Date</th>
                  <td>{new Date(selectedAdjustment.date).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <th>Reference No.</th>
                  <td>{selectedAdjustment.referenceNo}</td>
                </tr>
                <tr>
                  <th>Location</th>
                  <td>{selectedAdjustment.businessLocation || '-'}</td>
                </tr>
                <tr>
                  <th>Adjustment Type</th>
                  <td>{selectedAdjustment.adjustmentType}</td>
                </tr>
                <tr>
                  <th>Total Items</th>
                  <td>{selectedAdjustment.totalItems}</td>
                </tr>
                <tr>
                  <th>Total Cost Impact</th>
                  <td className={selectedAdjustment.totalCost >= 0 ? 'text-success' : 'text-danger'}>
                    {selectedAdjustment.totalCost >= 0 ? '+' : '-'}${Math.abs(selectedAdjustment.totalCost || 0).toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <th>Status</th>
                  <td>{selectedAdjustment.status}</td>
                </tr>
                <tr>
                  <th>Added By</th>
                  <td>{selectedAdjustment.createdBy || '-'}</td>
                </tr>
                {selectedAdjustment.notes && (
                  <tr>
                    <th>Notes</th>
                    <td>{selectedAdjustment.notes}</td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
          {selectedAdjustment?.items && selectedAdjustment.items.length > 0 && (
            <>
              <h6 className="mt-3">Items</h6>
              <Table bordered size="sm">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit Cost</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedAdjustment.items.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td>{idx + 1}</td>
                      <td>{item.productName}</td>
                      <td>{item.quantity}</td>
                      <td>${(item.unitCost || 0).toFixed(2)}</td>
                      <td>${(item.subtotal || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
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

export default ListStockAdjustmentPage;
