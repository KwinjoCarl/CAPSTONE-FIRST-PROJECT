// Integration tests for critical API flows.
// Runs against a live backend on PORT (default 5000) — start the server first
// (`npm start`), then run `npm test`.
const { test, before } = require('node:test');
const assert = require('node:assert');

const BASE = process.env.API_BASE_URL || 'http://localhost:5000';

const api = async (path, { method = 'GET', token, body } = {}) => {
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  let data = null;
  try { data = await res.json(); } catch (e) { /* empty body */ }
  return { status: res.status, data };
};

let adminToken;
let cashierToken;

before(async () => {
  const admin = await api('/auth/login', {
    method: 'POST',
    body: { email: 'carlington@bms.com', password: '123456' }
  });
  assert.strictEqual(admin.status, 200, 'admin login must succeed before other tests');
  adminToken = admin.data.token;

  const cashier = await api('/auth/login', {
    method: 'POST',
    body: { email: 'john.cashier@bms.com', password: 'cashier123' }
  });
  assert.strictEqual(cashier.status, 200, 'cashier login must succeed before other tests');
  cashierToken = cashier.data.token;
});

test('health: server root responds', async () => {
  const res = await fetch(`${BASE}/`);
  assert.strictEqual(res.status, 200);
});

test('auth: valid credentials return token, role and permissions', async () => {
  const { status, data } = await api('/auth/login', {
    method: 'POST',
    body: { email: 'carlington@bms.com', password: '123456' }
  });
  assert.strictEqual(status, 200);
  assert.ok(data.token, 'token present');
  assert.strictEqual(data.role, 'Admin');
  assert.ok(Array.isArray(data.permissions) && data.permissions.length > 0);
});

test('auth: wrong password is rejected with 401', async () => {
  const { status } = await api('/auth/login', {
    method: 'POST',
    body: { email: 'carlington@bms.com', password: 'not-the-password' }
  });
  assert.strictEqual(status, 401);
});

test('auth: unknown email is rejected with 401', async () => {
  const { status } = await api('/auth/login', {
    method: 'POST',
    body: { email: 'nobody@example.com', password: 'whatever' }
  });
  assert.strictEqual(status, 401);
});

test('security: requests without a token are rejected with 401', async () => {
  const { status } = await api('/products');
  assert.strictEqual(status, 401);
});

test('security: garbage token is rejected with 401', async () => {
  const { status } = await api('/products', { token: 'not-a-real-token' });
  assert.strictEqual(status, 401);
});

test('permissions: cashier can view products (has products.view)', async () => {
  const { status, data } = await api('/products', { token: cashierToken });
  assert.strictEqual(status, 200);
  assert.ok(Array.isArray(data));
});

test('permissions: cashier cannot delete a product (lacks products.delete)', async () => {
  const { status } = await api('/products/1', { method: 'DELETE', token: cashierToken });
  assert.strictEqual(status, 403);
});

test('permissions: cashier cannot create a product (lacks products.create)', async () => {
  const { status } = await api('/products', {
    method: 'POST',
    token: cashierToken,
    body: { name: 'X', sku: 'X-1', purchase_price: 1, selling_price: 2, current_stock: 1 }
  });
  assert.strictEqual(status, 403);
});

test('permissions: cashier cannot list users (lacks users.view)', async () => {
  const { status } = await api('/users', { token: cashierToken });
  assert.strictEqual(status, 403);
});

test('permissions: admin can list users', async () => {
  const { status, data } = await api('/users', { token: adminToken });
  assert.strictEqual(status, 200);
  assert.ok(Array.isArray(data));
  assert.ok(!('password' in (data[0] || {})), 'passwords are never exposed');
});

test('stock flow: sale decrements stock and deleting it restores stock', async () => {
  // Create a disposable product with known stock
  const sku = `TEST-${Date.now()}`;
  const created = await api('/products', {
    method: 'POST',
    token: adminToken,
    body: {
      name: 'Stock Test Item', sku, category: 'Test', unit: 'pcs',
      purchase_price: 10, selling_price: 20, current_stock: 10, opening_stock: 10, alert_quantity: 1
    }
  });
  assert.strictEqual(created.status, 201);
  const productId = created.data.id;

  try {
    // Record a sale of 3 units
    const sale = await api('/sales', {
      method: 'POST',
      token: adminToken,
      body: {
        invoice_no: `TST-${Date.now()}`,
        customer_id: 1,
        sale_date: new Date().toISOString().slice(0, 10),
        subtotal: 60, grand_total: 60, amount_received: 60,
        payment_method: 'cash', status: 'final',
        items: [{ product_id: productId, quantity: 3, unit_price: 20, subtotal: 60 }]
      }
    });
    assert.strictEqual(sale.status, 201);

    let product = await api(`/products/${productId}`, { token: adminToken });
    assert.strictEqual(Number(product.data.current_stock), 7, 'stock decremented by sale');

    // Delete the sale — stock must be restored to 10
    const del = await api(`/sales/${sale.data.id}`, { method: 'DELETE', token: adminToken });
    assert.strictEqual(del.status, 200);

    product = await api(`/products/${productId}`, { token: adminToken });
    assert.strictEqual(Number(product.data.current_stock), 10, 'stock restored after sale delete');
  } finally {
    await api(`/products/${productId}`, { method: 'DELETE', token: adminToken });
  }
});

test('dashboard: stats endpoint requires auth and returns numbers', async () => {
  const noAuth = await api('/dashboard/stats');
  assert.strictEqual(noAuth.status, 401);

  const { status, data } = await api('/dashboard/stats', { token: adminToken });
  assert.strictEqual(status, 200);
  assert.ok('total_sales' in data && 'net_profit' in data);
});

test('dashboard: date filter is accepted', async () => {
  const { status } = await api('/dashboard/stats?start_date=2026-01-01&end_date=2026-12-31', { token: adminToken });
  assert.strictEqual(status, 200);
});
