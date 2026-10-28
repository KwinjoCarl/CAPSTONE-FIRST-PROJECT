// Maps an API module + HTTP method to a permission key like "products.create"
// and enforces it server-side. Mirrors the frontend permission catalog.

const METHOD_ACTION = {
  GET: 'view',
  POST: 'create',
  PUT: 'update',
  PATCH: 'update',
  DELETE: 'delete'
};

// Modules whose permission names differ from HTTP-action defaults
// (e.g. stock_adjustments has no update route/permission)
const protectModule = (moduleName) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Admin role always passes
  if (req.user.role === 'Admin') return next();

  const action = METHOD_ACTION[req.method] || 'view';
  const permission = `${moduleName}.${action}`;

  if (req.user.permissions.includes(permission)) return next();

  return res.status(403).json({ error: 'You do not have permission to perform this action' });
};

// Route-specific report permissions (reports use named permissions, not .view)
const REPORT_PERMISSIONS = {
  '/profit-loss': 'reports.profit_loss',
  '/sales': 'reports.sales',
  '/purchases': 'reports.purchases',
  '/product-stock': 'reports.product_stock',
  '/customers': 'reports.customers',
  '/suppliers': 'reports.suppliers'
};

const protectReport = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  if (req.user.role === 'Admin') return next();

  const reportPath = '/' + req.path.replace(/^\//, '').split('/')[0];
  const permission = REPORT_PERMISSIONS[reportPath];
  if (permission && req.user.permissions.includes(permission)) return next();
  if (!permission) return next(); // unknown report path: allow authenticated users

  return res.status(403).json({ error: 'You do not have permission to view this report' });
};

module.exports = { protectModule, protectReport, METHOD_ACTION, REPORT_PERMISSIONS };
