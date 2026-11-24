// Central permission catalog matching the app's real modules & functions.
// Permission format: "<module>.<action>"

export const ALL_PERMISSIONS = [
  'dashboard.view',
  'users.view', 'users.create', 'users.update', 'users.delete',
  'roles.view', 'roles.create', 'roles.update', 'roles.delete',
  'suppliers.view', 'suppliers.create', 'suppliers.update', 'suppliers.delete',
  'customers.view', 'customers.create', 'customers.update', 'customers.delete',
  'products.view', 'products.create', 'products.update', 'products.delete',
  'purchases.view', 'purchases.create', 'purchases.update', 'purchases.delete',
  'sales.view', 'sales.create', 'sales.update', 'sales.delete',
  'pos.access', 'quotations.view', 'quotations.create',
  'stock_adjustments.view', 'stock_adjustments.create', 'stock_adjustments.delete',
  'expenses.view', 'expenses.create', 'expenses.update', 'expenses.delete',
  'reports.profit_loss', 'reports.suppliers', 'reports.customers',
  'reports.products', 'reports.purchases', 'reports.sales',
  'reports.product_stock', 'reports.stock_adjustment',
  'settings.business', 'settings.locations', 'settings.tax_rates',
  'settings.payment_accounts', 'settings.invoice'
];

// Grouped for the role create/edit checkbox matrix
export const PERMISSION_GROUPS = [
  {
    title: 'Dashboard',
    permissions: [
      { name: 'dashboard.view', label: 'View home / dashboard' }
    ]
  },
  {
    title: 'Users',
    permissions: [
      { name: 'users.view', label: 'View users' },
      { name: 'users.create', label: 'Add user' },
      { name: 'users.update', label: 'Edit user' },
      { name: 'users.delete', label: 'Delete user' }
    ]
  },
  {
    title: 'Roles',
    permissions: [
      { name: 'roles.view', label: 'View roles' },
      { name: 'roles.create', label: 'Add role' },
      { name: 'roles.update', label: 'Edit role' },
      { name: 'roles.delete', label: 'Delete role' }
    ]
  },
  {
    title: 'Suppliers',
    permissions: [
      { name: 'suppliers.view', label: 'View suppliers' },
      { name: 'suppliers.create', label: 'Add supplier' },
      { name: 'suppliers.update', label: 'Edit supplier' },
      { name: 'suppliers.delete', label: 'Delete supplier' }
    ]
  },
  {
    title: 'Customers',
    permissions: [
      { name: 'customers.view', label: 'View customers' },
      { name: 'customers.create', label: 'Add customer' },
      { name: 'customers.update', label: 'Edit customer' },
      { name: 'customers.delete', label: 'Delete customer' }
    ]
  },
  {
    title: 'Products',
    permissions: [
      { name: 'products.view', label: 'View products' },
      { name: 'products.create', label: 'Add product' },
      { name: 'products.update', label: 'Edit product' },
      { name: 'products.delete', label: 'Delete product' }
    ]
  },
  {
    title: 'Purchases',
    permissions: [
      { name: 'purchases.view', label: 'View purchases' },
      { name: 'purchases.create', label: 'Add purchase' },
      { name: 'purchases.update', label: 'Edit purchase' },
      { name: 'purchases.delete', label: 'Delete purchase' }
    ]
  },
  {
    title: 'Sales & POS',
    permissions: [
      { name: 'sales.view', label: 'View sales' },
      { name: 'sales.create', label: 'Add sale' },
      { name: 'sales.update', label: 'Edit sale' },
      { name: 'sales.delete', label: 'Delete sale' },
      { name: 'pos.access', label: 'Access POS terminal' },
      { name: 'quotations.view', label: 'View quotations' },
      { name: 'quotations.create', label: 'Add quotation' }
    ]
  },
  {
    title: 'Stock Adjustments',
    permissions: [
      { name: 'stock_adjustments.view', label: 'View stock adjustments' },
      { name: 'stock_adjustments.create', label: 'Add stock adjustment' },
      { name: 'stock_adjustments.delete', label: 'Delete stock adjustment' }
    ]
  },
  {
    title: 'Expenses',
    permissions: [
      { name: 'expenses.view', label: 'View expenses' },
      { name: 'expenses.create', label: 'Add expense' },
      { name: 'expenses.update', label: 'Edit expense' },
      { name: 'expenses.delete', label: 'Delete expense' }
    ]
  },
  {
    title: 'Reports',
    permissions: [
      { name: 'reports.profit_loss', label: 'Profit / Loss report' },
      { name: 'reports.suppliers', label: 'Suppliers report' },
      { name: 'reports.customers', label: 'Customers report' },
      { name: 'reports.products', label: 'Products report' },
      { name: 'reports.purchases', label: 'Purchases report' },
      { name: 'reports.sales', label: 'Sales report' },
      { name: 'reports.product_stock', label: 'Product stock report' },
      { name: 'reports.stock_adjustment', label: 'Stock adjustment report' }
    ]
  },
  {
    title: 'Settings',
    permissions: [
      { name: 'settings.business', label: 'Business settings' },
      { name: 'settings.locations', label: 'Business locations' },
      { name: 'settings.tax_rates', label: 'Tax rates' },
      { name: 'settings.payment_accounts', label: 'Payment accounts' },
      { name: 'settings.invoice', label: 'Invoice settings' }
    ]
  }
];

// Menu key -> required permission (for sidebar filtering)
export const MENU_PERMISSIONS = {
  'home': 'dashboard.view',
  'users': 'users.view',
  'roles': 'roles.view',
  'suppliers': 'suppliers.view',
  'customers': 'customers.view',
  'list-products': 'products.view',
  'add-product': 'products.create',
  'list-purchases': 'purchases.view',
  'add-purchase': 'purchases.create',
  'all-sales': 'sales.view',
  'add-sale': 'sales.create',
  'pos': 'pos.access',
  'list-quotations': 'quotations.view',
  'list-stock-adjustment': 'stock_adjustments.view',
  'add-stock-adjustment': 'stock_adjustments.create',
  'list-expenses': 'expenses.view',
  'add-expense': 'expenses.create',
  'profit-loss-report': 'reports.profit_loss',
  'suppliers-report': 'reports.suppliers',
  'customers-report': 'reports.customers',
  'products-report': 'reports.products',
  'purchases-report': 'reports.purchases',
  'sales-report': 'reports.sales',
  'product-stock-report': 'reports.product_stock',
  'stock-adjustment-report': 'reports.stock_adjustment',
  'business-settings': 'settings.business',
  'business-locations': 'settings.locations',
  'tax-rates': 'settings.tax_rates',
  'payment-accounts': 'settings.payment_accounts',
  'invoice-settings': 'settings.invoice'
};

// Ordered route patterns -> required permission (specific paths first)
export const ROUTE_PERMISSIONS = [
  // Users & roles
  { match: /^\/user-management\/users\/add/, permission: 'users.create' },
  { match: /^\/user-management\/users\/edit/, permission: 'users.update' },
  { match: /^\/user-management\/users/, permission: 'users.view' },
  { match: /^\/user-management\/roles\/add/, permission: 'roles.create' },
  { match: /^\/user-management\/roles\/edit/, permission: 'roles.update' },
  { match: /^\/user-management\/roles/, permission: 'roles.view' },
  { match: /^\/user-management/, permission: 'users.view' },
  // Contacts
  { match: /^\/contacts\/suppliers/, permission: 'suppliers.view' },
  { match: /^\/contacts\/customers/, permission: 'customers.view' },
  { match: /^\/contacts\/customer-groups/, permission: 'customers.view' },
  { match: /^\/contacts\/import/, permission: 'customers.create' },
  // Products
  { match: /^\/products\/add/, permission: 'products.create' },
  { match: /^\/products\/edit/, permission: 'products.update' },
  { match: /^\/products\/import/, permission: 'products.create' },
  { match: /^\/products\/import-opening-stock/, permission: 'stock_adjustments.create' },
  { match: /^\/products\/selling-price-group/, permission: 'products.update' },
  { match: /^\/products\/(variations|units|categories|brands|warranties)/, permission: 'products.create' },
  { match: /^\/products/, permission: 'products.view' },
  // Purchases
  { match: /^\/purchases\/add/, permission: 'purchases.create' },
  { match: /^\/purchases\/edit/, permission: 'purchases.update' },
  { match: /^\/purchases\/import/, permission: 'purchases.create' },
  { match: /^\/purchases/, permission: 'purchases.view' },
  // Sales
  { match: /^\/sales\/add/, permission: 'sales.create' },
  { match: /^\/sales\/edit/, permission: 'sales.update' },
  { match: /^\/sales\/pos-screen/, permission: 'pos.access' },
  { match: /^\/sales\/pos/, permission: 'pos.access' },
  { match: /^\/sales\/quotations\/add/, permission: 'quotations.create' },
  { match: /^\/sales\/quotations/, permission: 'quotations.view' },
  { match: /^\/sales\/(all|drafts|sell-return|shipments)/, permission: 'sales.view' },
  { match: /^\/sales\/discount/, permission: 'sales.update' },
  { match: /^\/sales\/import/, permission: 'sales.create' },
  { match: /^\/sales/, permission: 'sales.view' },
  // Stock adjustments
  { match: /^\/stock-adjustment\/add/, permission: 'stock_adjustments.create' },
  { match: /^\/stock-adjustment/, permission: 'stock_adjustments.view' },
  // Expenses
  { match: /^\/expenses\/add/, permission: 'expenses.create' },
  { match: /^\/expenses\/categories/, permission: 'expenses.create' },
  { match: /^\/expenses/, permission: 'expenses.view' },
  // Reports
  { match: /^\/reports\/profit-loss/, permission: 'reports.profit_loss' },
  { match: /^\/reports\/suppliers/, permission: 'reports.suppliers' },
  { match: /^\/reports\/customer-supplier/, permission: 'reports.customers' },
  { match: /^\/reports\/customers/, permission: 'reports.customers' },
  { match: /^\/reports\/products/, permission: 'reports.products' },
  { match: /^\/reports\/product($|\/)/, permission: 'reports.products' },
  { match: /^\/reports\/trending-products/, permission: 'reports.products' },
  { match: /^\/reports\/purchases/, permission: 'reports.purchases' },
  { match: /^\/reports\/purchase-sell/, permission: 'reports.purchases' },
  { match: /^\/reports\/sales/, permission: 'reports.sales' },
  { match: /^\/reports\/sales-representative/, permission: 'reports.sales' },
  { match: /^\/reports\/product-stock/, permission: 'reports.product_stock' },
  { match: /^\/reports\/stock-adjustment/, permission: 'reports.stock_adjustment' },
  { match: /^\/reports\/(stock|stock-expiry|lot)/, permission: 'reports.product_stock' },
  { match: /^\/reports\/expense/, permission: 'expenses.view' },
  { match: /^\/reports\/register/, permission: 'sales.view' },
  { match: /^\/reports\/tax/, permission: 'reports.sales' },
  { match: /^\/reports\/activity-log/, permission: 'users.view' },
  { match: /^\/reports/, permission: 'reports.sales' },
  // Settings
  { match: /^\/settings\/business/, permission: 'settings.business' },
  { match: /^\/settings\/locations/, permission: 'settings.locations' },
  { match: /^\/settings\/tax-rates/, permission: 'settings.tax_rates' },
  { match: /^\/settings\/payment-accounts/, permission: 'settings.payment_accounts' },
  { match: /^\/settings\/invoice/, permission: 'settings.invoice' },
  { match: /^\/settings\/receipt-printers/, permission: 'settings.business' },
  { match: /^\/settings/, permission: 'settings.business' },
  // Home (loose default)
  { match: /^\/home/, permission: 'dashboard.view' }
];

export const getRoutePermission = (path) => {
  for (const rule of ROUTE_PERMISSIONS) {
    if (rule.match.test(path)) return rule.permission;
  }
  return null;
};
