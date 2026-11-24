import { Card, Col, Row, Button, Table, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ActionsDropdown from '@/components/ActionsDropdown';
import * as XLSX from 'xlsx';

const ListPurchasesPage = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = () => {
    const storedPurchases = JSON.parse(localStorage.getItem('bms_purchases') || '[]');
    setPurchases(storedPurchases);
  };

  const calculateTotals = () => {
    const grandTotal = purchases.reduce((sum, purchase) => sum + (purchase.grandTotal || 0), 0);
    return { grandTotal };
  };

  const totals = calculateTotals();

  const handleEdit = (purchaseId) => {
    navigate(`/purchases/edit/${purchaseId}`);
  };

  const handleDelete = (purchaseId) => {
    if (window.confirm('Are you sure you want to delete this purchase?')) {
      const updatedPurchases = purchases.filter(purchase => purchase.id !== purchaseId);
      localStorage.setItem('bms_purchases', JSON.stringify(updatedPurchases));
      setPurchases(updatedPurchases);
      toast.success('SUCCESSFUL');
    }
  };

  const handleDownloadExcel = () => {
    const headers = ['Date', 'Reference No.', 'Supplier', 'Purchase Status', 'Total Items', 'Grand Total'];
    const rows = purchases.map((p) => [
      p.purchaseDate ? new Date(p.purchaseDate).toLocaleDateString() : '',
      p.referenceNo || '',
      p.supplierName || '',
      p.purchaseStatus || '',
      p.totalItems ?? '',
      p.grandTotal ?? 0
    ]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Purchases');
    XLSX.writeFile(wb, 'purchases.xlsx');
  };

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <div className="page-title-right">
              <Button variant="primary" onClick={() => navigate('/purchases/add')}>
                <i className="mdi mdi-plus me-1"></i> Add
              </Button>
            </div>
            <h4 className="page-title">Purchases</h4>
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
                  All Purchases
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
                      <th>Supplier</th>
                      <th>Purchase Status</th>
                      <th>Total Items</th>
                      <th>Grand Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.length > 0 ? (
                      purchases.map((purchase) => (
                        <tr key={purchase.id}>
                          <td>{new Date(purchase.purchaseDate).toLocaleDateString()}</td>
                          <td>{purchase.referenceNo}</td>
                          <td>{purchase.supplierName}</td>
                          <td>
                            <Badge bg={
                              purchase.purchaseStatus === 'received' ? 'success' :
                              purchase.purchaseStatus === 'pending' ? 'warning' :
                              'info'
                            }>
                              {purchase.purchaseStatus}
                            </Badge>
                          </td>
                          <td>{purchase.totalItems}</td>
                          <td>${purchase.grandTotal.toFixed(2)}</td>
                          <td>
                            <ActionsDropdown
                              onEdit={() => handleEdit(purchase.id)}
                              onDelete={() => handleDelete(purchase.id)}
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center text-muted py-4">
                          No purchases found. Click "Add" to create a new purchase.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-light">
                      <td colSpan="5"><strong>Total:</strong></td>
                      <td><strong>$ {totals.grandTotal.toFixed(2)}</strong></td>
                      <td></td>
                    </tr>
                  </tfoot>
                </Table>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="text-muted">
                  Showing {purchases.length} of {purchases.length} entries
                </div>
                <div>
                  <span className="me-2">Total Purchases: <strong>$ {totals.grandTotal.toFixed(2)}</strong></span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ListPurchasesPage;
