import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Spinner } from 'react-bootstrap';

// One-time: sets currentStock = 30 on every product in bms_products,
// then redirects to the products list.
const StockSeedPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Updating stock levels...');

  useEffect(() => {
    const products = JSON.parse(localStorage.getItem('bms_products') || '[]');
    products.forEach((p) => { p.currentStock = 30; });
    localStorage.setItem('bms_products', JSON.stringify(products));
    setStatus(`Set stock to 30 for ${products.length} products. Redirecting...`);
    setTimeout(() => navigate('/products/list'), 1200);
  }, [navigate]);

  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
      <Spinner animation="border" className="mb-3" />
      <Alert variant="info">{status}</Alert>
    </div>
  );
};

export default StockSeedPage;
