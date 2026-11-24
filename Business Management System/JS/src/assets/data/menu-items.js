export const MENU_ITEMS = [{
  key: 'main-menu',
  label: 'MAIN MENU',
  isTitle: true
}, 
// ====================Home/Dashboard===============
{
  key: 'home',
  label: 'Home',
  icon: 'mingcute:home-3-line',
  url: '/home'
},
// ====================User Management===============
{
  key: 'user-management',
  label: 'User Management',
  icon: 'mingcute:user-3-line',
  children: [{
    key: 'users',
    label: 'Users',
    url: '/user-management/users',
    parentKey: 'user-management'
  }, {
    key: 'roles',
    label: 'Roles',
    url: '/user-management/roles',
    parentKey: 'user-management'
  }]
},
// ====================Contacts===============
{
  key: 'contacts',
  label: 'Contacts',
  icon: 'mingcute:contacts-3-line',
  children: [{
    key: 'suppliers',
    label: 'Suppliers',
    url: '/contacts/suppliers',
    parentKey: 'contacts'
  }, {
    key: 'customers',
    label: 'Customers',
    url: '/contacts/customers',
    parentKey: 'contacts'
  }]
},
// ====================Products===============
{
  key: 'products',
  label: 'Products',
  icon: 'mingcute:box-3-line',
  children: [{
    key: 'list-products',
    label: 'List Products',
    url: '/products/list',
    parentKey: 'products'
  }, {
    key: 'add-product',
    label: 'Add Product',
    url: '/products/add',
    parentKey: 'products'
  }]
},
// ====================Purchases===============
{
  key: 'purchases',
  label: 'Purchases',
  icon: 'mingcute:shopping-cart-2-line',
  children: [{
    key: 'list-purchases',
    label: 'List Purchases',
    url: '/purchases/list',
    parentKey: 'purchases'
  }, {
    key: 'add-purchase',
    label: 'Add Purchase',
    url: '/purchases/add',
    parentKey: 'purchases'
  }]
},
// ====================Sales===============
{
  key: 'sales',
  label: 'Sales',
  icon: 'mingcute:bill-line',
  children: [{
    key: 'all-sales',
    label: 'All Sales',
    url: '/sales/all',
    parentKey: 'sales'
  }, {
    key: 'add-sale',
    label: 'Add Sale',
    url: '/sales/add',
    parentKey: 'sales'
  }, {
    key: 'pos',
    label: 'POS',
    url: '/sales/pos-screen',
    parentKey: 'sales'
  }, {
    key: 'list-quotations',
    label: 'List Quotations',
    url: '/sales/quotations',
    parentKey: 'sales'
  }]
},
// ====================Stock Adjustment===============
{
  key: 'stock-adjustment',
  label: 'Stock Adjustment',
  icon: 'mingcute:transfer-3-line',
  children: [{
    key: 'list-stock-adjustment',
    label: 'List Stock Adjustment',
    url: '/stock-adjustment/list',
    parentKey: 'stock-adjustment'
  }, {
    key: 'add-stock-adjustment',
    label: 'Add Stock Adjustment',
    url: '/stock-adjustment/add',
    parentKey: 'stock-adjustment'
  }]
},
// ====================Expenses===============
{
  key: 'expenses',
  label: 'Expenses',
  icon: 'mingcute:wallet-3-line',
  children: [{
    key: 'list-expenses',
    label: 'List Expenses',
    url: '/expenses/list',
    parentKey: 'expenses'
  }, {
    key: 'add-expense',
    label: 'Add Expense',
    url: '/expenses/add',
    parentKey: 'expenses'
  }]
},
// ====================Reports===============
{
  key: 'reports',
  label: 'Reports',
  icon: 'mingcute:chart-bar-line',
  children: [{
    key: 'profit-loss-report',
    label: 'Profit / Loss Report',
    url: '/reports/profit-loss',
    parentKey: 'reports'
  }, {
    key: 'suppliers-report',
    label: 'Suppliers',
    url: '/reports/suppliers',
    parentKey: 'reports'
  }, {
    key: 'customers-report',
    label: 'Customers',
    url: '/reports/customers',
    parentKey: 'reports'
  }, {
    key: 'products-report',
    label: 'Products',
    url: '/reports/products',
    parentKey: 'reports'
  }, {
    key: 'purchases-report',
    label: 'Purchases',
    url: '/reports/purchases',
    parentKey: 'reports'
  }, {
    key: 'sales-report',
    label: 'Sales',
    url: '/reports/sales',
    parentKey: 'reports'
  }, {
    key: 'product-stock-report',
    label: 'Product Stock Report',
    url: '/reports/product-stock',
    parentKey: 'reports'
  }, {
    key: 'stock-adjustment-report',
    label: 'Stock Adjustment',
    url: '/reports/stock-adjustment',
    parentKey: 'reports'
  }]
},
// ====================Settings===============
{
  key: 'settings',
  label: 'Settings',
  icon: 'mingcute:settings-3-line',
  children: [{
    key: 'business-settings',
    label: 'Business Settings',
    url: '/settings/business',
    parentKey: 'settings'
  }, {
    key: 'business-locations',
    label: 'Business Locations',
    url: '/settings/locations',
    parentKey: 'settings'
  }, {
    key: 'tax-rates',
    label: 'Tax Rates',
    url: '/settings/tax-rates',
    parentKey: 'settings'
  }, {
    key: 'payment-accounts',
    label: 'Payment Accounts',
    url: '/settings/payment-accounts',
    parentKey: 'settings'
  }, {
    key: 'invoice-settings',
    label: 'Invoice Settings',
    url: '/settings/invoice',
    parentKey: 'settings'
  }]
}];