import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Spinner } from 'react-bootstrap';

// One-time: renumbers every product SKU in bms_products to S11, S12, ...
const SkuSeedPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Updating SKUs...');

  useEffect(() => {
    const products = JSON.parse(localStorage.getItem('bms_products') || '[]');
    products.forEach((p, i) => { p.sku = 'S1' + (i + 1); });
    localStorage.setItem('bms_products', JSON.stringify(products));
    setStatus(`Set ${products.length} SKUs (S11 .. S1${products.length}). Redirecting...`);
    setTimeout(() => navigate('/products/list'), 1200);
  }, [navigate]);

  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
      <Spinner animation="border" className="mb-3" />
      <Alert variant="info">{status}</Alert>
    </div>
  );
};

export default SkuSeedPage;
