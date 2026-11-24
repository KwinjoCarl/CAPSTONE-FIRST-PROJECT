import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Spinner } from 'react-bootstrap';

// One-time seed: merges public/imported-products.json into bms_products
// (the store used by the Products list page), then redirects to the list.
const ImportSeedPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Importing products...');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/imported-products.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const imported = await res.json();

        const existing = JSON.parse(localStorage.getItem('bms_products') || '[]');
        const existingSkus = new Set(existing.map((p) => p.sku));
        const fresh = imported.filter((p) => !existingSkus.has(p.sku));
        localStorage.setItem('bms_products', JSON.stringify([...existing, ...fresh]));

        setStatus(`Imported ${fresh.length} new products (${existing.length} already existed). Redirecting...`);
        setTimeout(() => navigate('/products/list'), 1200);
      } catch (e) {
        setStatus(`Import failed: ${e.message}`);
      }
    })();
  }, [navigate]);

  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
      <Spinner animation="border" className="mb-3" />
      <Alert variant="info">{status}</Alert>
    </div>
  );
};

export default ImportSeedPage;
