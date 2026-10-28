import { Card, Col, Row, Button, Form, Table } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getSettings, formatMoney } from '@/helpers/settings';

const PrintLabelsPage = () => {
  const [products, setProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [copies, setCopies] = useState(1);

  useEffect(() => {
    const storedProducts = JSON.parse(localStorage.getItem('bms_products') || '[]');
    setProducts(storedProducts);
  }, []);

  const settings = getSettings();

  const toggleProduct = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map(p => p.id)));
    }
  };

  const selectedProducts = products.filter(p => selectedIds.has(p.id));

  const generateLabels = () => {
    if (selectedProducts.length === 0) {
      toast.error('Select at least one product to print labels');
      return null;
    }

    const labels = [];
    selectedProducts.forEach(product => {
      for (let i = 0; i < copies; i++) {
        labels.push({
          name: product.name,
          sku: product.sku,
          price: product.sellingPrice
        });
      }
    });

    const barcodeFormat = settings.barcodeType || 'CODE128';
    const labelHTML = labels.map((label, idx) => `
      <div class="label-item">
        ${settings.barcodeShowName ? `<div class="product-name">${label.name}</div>` : ''}
        <svg id="barcode-${idx}"></svg>
        ${settings.barcodeShowPrice ? `<div class="product-price">${formatMoney(label.price)}</div>` : ''}
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Product Labels</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 10px; }
          .labels-grid { display: flex; flex-wrap: wrap; gap: 8px; }
          .label-item {
            border: 1px dashed #999;
            padding: 8px;
            text-align: center;
            width: 220px;
            page-break-inside: avoid;
          }
          .product-name {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 4px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .product-price { font-size: 14px; font-weight: bold; margin-top: 4px; }
          svg { max-width: 100%; }
          @media print {
            body { margin: 0; }
            .label-item { border: 1px dashed #ccc; }
          }
        </style>
      </head>
      <body>
        <div class="labels-grid">${labelHTML}</div>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
        <script>
          const format = ${JSON.stringify(barcodeFormat)};
          ${labels.map((label, idx) => `
            try {
              JsBarcode("#barcode-${idx}", ${JSON.stringify(label.sku)}, {
                format: format,
                width: 1.6,
                height: 50,
                displayValue: true,
                fontSize: 13,
                margin: 4
              });
            } catch (e) {
              JsBarcode("#barcode-${idx}", ${JSON.stringify(label.sku)}, {
                format: "CODE128",
                width: 1.6,
                height: 50,
                displayValue: true,
                fontSize: 13,
                margin: 4
              });
            }
          `).join('')}
        <\/script>
      </body>
      </html>
    `;
  };

  const handlePrint = () => {
    const html = generateLabels();
    if (!html) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 800);
  };

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <div className="page-title-right">
              <Button variant="primary" onClick={handlePrint} disabled={selectedIds.size === 0}>
                <i className="mdi mdi-printer me-1"></i> Print Labels ({selectedIds.size} selected)
              </Button>
            </div>
            <h4 className="page-title">Print Labels</h4>
          </div>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body>
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Labels per product</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      max="50"
                      value={copies}
                      onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                  </Form.Group>
                </Col>
                <Col md={8} className="d-flex align-items-end">
                  <div className="text-muted">
                    <i className="mdi mdi-information-outline me-1"></i>
                    Barcode type: <strong>{settings.barcodeType}</strong>
                    {settings.barcodeShowName && ' · name shown'}
                    {settings.barcodeShowPrice && ' · price shown'}
                    {' '}(configure in Settings → Barcode Settings)
                  </div>
                </Col>
              </Row>

              <div className="table-responsive">
                <Table className="table-centered table-nowrap mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '40px' }}>
                        <Form.Check
                          type="checkbox"
                          checked={products.length > 0 && selectedIds.size === products.length}
                          onChange={toggleAll}
                        />
                      </th>
                      <th>Product Name</th>
                      <th>SKU</th>
                      <th>Selling Price</th>
                      <th>Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length > 0 ? (
                      products.map((product) => (
                        <tr key={product.id} className={selectedIds.has(product.id) ? 'table-primary' : ''}>
                          <td>
                            <Form.Check
                              type="checkbox"
                              checked={selectedIds.has(product.id)}
                              onChange={() => toggleProduct(product.id)}
                            />
                          </td>
                          <td>{product.name}</td>
                          <td><code>{product.sku}</code></td>
                          <td>${parseFloat(product.sellingPrice || 0).toFixed(2)}</td>
                          <td>{product.currentStock || 0} {product.unit}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-4">
                          No products found. Add products first.
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
    </>
  );
};

export default PrintLabelsPage;
