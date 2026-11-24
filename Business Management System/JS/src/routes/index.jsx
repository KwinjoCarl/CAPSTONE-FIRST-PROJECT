import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// Home
const HomePage = lazy(() => import('@/app/(admin)/home/page'));

// User Management
const UsersPage = lazy(() => import('@/app/(admin)/user-management/users/page'));
const AddUserPage = lazy(() => import('@/app/(admin)/user-management/users/add/page'));
const EditUserPage = lazy(() => import('@/app/(admin)/user-management/users/edit/[id]/page'));
const RolesPage = lazy(() => import('@/app/(admin)/user-management/roles/page'));
const AddRolePage = lazy(() => import('@/app/(admin)/user-management/roles/add/page'));
const EditRolePage = lazy(() => import('@/app/(admin)/user-management/roles/edit/[id]/page'));
const SalesCommissionAgentsPage = lazy(() => import('@/app/(admin)/user-management/sales-commission-agents/page'));

// Contacts
const SuppliersPage = lazy(() => import('@/app/(admin)/contacts/suppliers/page'));
const CustomersPage = lazy(() => import('@/app/(admin)/contacts/customers/page'));
const CustomerGroupsPage = lazy(() => import('@/app/(admin)/contacts/customer-groups/page'));
const ImportContactsPage = lazy(() => import('@/app/(admin)/contacts/import/page'));

// Products
const ListProductsPage = lazy(() => import('@/app/(admin)/products/list/page'));
const AddProductPage = lazy(() => import('@/app/(admin)/products/add/page'));
const EditProductPage = lazy(() => import('@/app/(admin)/products/edit/[id]/page'));
const VariationsPage = lazy(() => import('@/app/(admin)/products/variations/page'));
const ImportProductsPage = lazy(() => import('@/app/(admin)/products/import/page'));
const ImportSeedPage = lazy(() => import('@/app/(admin)/products/import-seed/page'));
const StockSeedPage = lazy(() => import('@/app/(admin)/products/stock-seed/page'));
const SkuSeedPage = lazy(() => import('@/app/(admin)/products/sku-seed/page'));
const ImportOpeningStockPage = lazy(() => import('@/app/(admin)/products/import-opening-stock/page'));
const SellingPriceGroupPage = lazy(() => import('@/app/(admin)/products/selling-price-group/page'));
const UnitsPage = lazy(() => import('@/app/(admin)/products/units/page'));
const CategoriesPage = lazy(() => import('@/app/(admin)/products/categories/page'));
const BrandsPage = lazy(() => import('@/app/(admin)/products/brands/page'));
const WarrantiesPage = lazy(() => import('@/app/(admin)/products/warranties/page'));

// Purchases
const ListPurchasesPage = lazy(() => import('@/app/(admin)/purchases/list/page'));
const AddPurchasePage = lazy(() => import('@/app/(admin)/purchases/add/page'));
const EditPurchasePage = lazy(() => import('@/app/(admin)/purchases/edit/[id]/page'));
const ImportPurchasesPage = lazy(() => import('@/app/(admin)/purchases/import/page'));

// Sales
const AllSalesPage = lazy(() => import('@/app/(admin)/sales/all/page'));
const AddSalePage = lazy(() => import('@/app/(admin)/sales/add/page'));
const EditSalePage = lazy(() => import('@/app/(admin)/sales/edit/[id]/page'));
const ListPOSPage = lazy(() => import('@/app/(admin)/sales/pos/page'));
const POSScreenPage = lazy(() => import('@/app/(admin)/sales/pos-screen/page'));
const DraftsPage = lazy(() => import('@/app/(admin)/sales/drafts/page'));
const QuotationsPage = lazy(() => import('@/app/(admin)/sales/quotations/page'));
const AddQuotationPage = lazy(() => import('@/app/(admin)/sales/quotations/add/page'));
const SellReturnPage = lazy(() => import('@/app/(admin)/sales/sell-return/page'));
const ShipmentsPage = lazy(() => import('@/app/(admin)/sales/shipments/page'));
const DiscountPage = lazy(() => import('@/app/(admin)/sales/discount/page'));
const ImportSalesPage = lazy(() => import('@/app/(admin)/sales/import/page'));

// Stock Adjustment
const ListStockAdjustmentPage = lazy(() => import('@/app/(admin)/stock-adjustment/list/page'));
const AddStockAdjustmentPage = lazy(() => import('@/app/(admin)/stock-adjustment/add/page'));

// Expenses
const ListExpensesPage = lazy(() => import('@/app/(admin)/expenses/list/page'));
const AddExpensePage = lazy(() => import('@/app/(admin)/expenses/add/page'));
const ExpenseCategoriesPage = lazy(() => import('@/app/(admin)/expenses/categories/page'));

// Reports
const ProfitLossReportPage = lazy(() => import('@/app/(admin)/reports/profit-loss/page'));
const PurchaseSellReportPage = lazy(() => import('@/app/(admin)/reports/purchase-sell/page'));
const TaxReportPage = lazy(() => import('@/app/(admin)/reports/tax/page'));
const CustomerSupplierReportPage = lazy(() => import('@/app/(admin)/reports/customer-supplier/page'));
const SuppliersReportPage = lazy(() => import('@/app/(admin)/reports/suppliers/page'));
const CustomersReportPage = lazy(() => import('@/app/(admin)/reports/customers/page'));
const ProductReportPage = lazy(() => import('@/app/(admin)/reports/product/page'));
const ProductsReportPage = lazy(() => import('@/app/(admin)/reports/products/page'));
const PurchasesReportPage = lazy(() => import('@/app/(admin)/reports/purchases/page'));
const SalesReportPage = lazy(() => import('@/app/(admin)/reports/sales/page'));
const StockReportPage = lazy(() => import('@/app/(admin)/reports/stock/page'));
const ProductStockReportPage = lazy(() => import('@/app/(admin)/reports/product-stock/page'));
const StockAdjustmentReportPage = lazy(() => import('@/app/(admin)/reports/stock-adjustment/page'));
const TrendingProductsPage = lazy(() => import('@/app/(admin)/reports/trending-products/page'));
const ExpenseReportPage = lazy(() => import('@/app/(admin)/reports/expense/page'));
const StockExpiryReportPage = lazy(() => import('@/app/(admin)/reports/stock-expiry/page'));
const LotReportPage = lazy(() => import('@/app/(admin)/reports/lot/page'));
const RegisterReportPage = lazy(() => import('@/app/(admin)/reports/register/page'));
const SalesRepresentativeReportPage = lazy(() => import('@/app/(admin)/reports/sales-representative/page'));
const ActivityLogPage = lazy(() => import('@/app/(admin)/reports/activity-log/page'));

// Settings
const BusinessSettingsPage = lazy(() => import('@/app/(admin)/settings/business/page'));
const BusinessLocationsPage = lazy(() => import('@/app/(admin)/settings/locations/page'));
const InvoiceSettingsPage = lazy(() => import('@/app/(admin)/settings/invoice/page'));
const ReceiptPrintersPage = lazy(() => import('@/app/(admin)/settings/receipt-printers/page'));
const TaxRatesPage = lazy(() => import('@/app/(admin)/settings/tax-rates/page'));
const PaymentAccountsPage = lazy(() => import('@/app/(admin)/settings/payment-accounts/page'));

// API Test
const APITestPage = lazy(() => import('@/app/(admin)/api-test/page'));

// Auth Routes
const AuthSignIn = lazy(() => import('@/app/(other)/auth/sign-in/page'));
const AuthSignUp = lazy(() => import('@/app/(other)/auth/sign-up/page'));
const ResetPassword = lazy(() => import('@/app/(other)/auth/reset-password/page'));
const LockScreen = lazy(() => import('@/app/(other)/auth/lock-screen/page'));
const Error404 = lazy(() => import('@/app/(other)/error-pages/pages-404/page'));
const initialRoutes = [{
  path: '/',
  name: 'root',
  element: <Navigate to="/home" />
}];

export const authRoutes = [{
  name: 'Sign In',
  path: '/auth/sign-in',
  element: <AuthSignIn />
}, {
  name: 'Account Request',
  path: '/auth/sign-up',
  element: <AuthSignUp />
}, {
  name: 'Reset Password',
  path: '/auth/reset-password',
  element: <ResetPassword />
}, {
  name: 'Lock Screen',
  path: '/auth/lock-screen',
  element: <LockScreen />
}, {
  name: 'API Test (Public)',
  path: '/api-test-public',
  element: <APITestPage />
}, {
  name: '404 Error',
  path: '/error-pages/pages-404',
  element: <Error404 />
}];

const homeRoutes = [{
  path: '/home',
  name: 'Home',
  element: <HomePage />
}];

const userManagementRoutes = [{
  path: '/user-management/users',
  name: 'Users',
  element: <UsersPage />
}, {
  path: '/user-management/users/add',
  name: 'Add User',
  element: <AddUserPage />
}, {
  path: '/user-management/users/edit/:id',
  name: 'Edit User',
  element: <EditUserPage />
}, {
  path: '/user-management/roles',
  name: 'Roles',
  element: <RolesPage />
}, {
  path: '/user-management/roles/add',
  name: 'Add Role',
  element: <AddRolePage />
}, {
  path: '/user-management/roles/edit/:id',
  name: 'Edit Role',
  element: <EditRolePage />
}, {
  path: '/user-management/sales-commission-agents',
  name: 'Sales Commission Agents',
  element: <SalesCommissionAgentsPage />
}];

const contactsRoutes = [{
  path: '/contacts/suppliers',
  name: 'Suppliers',
  element: <SuppliersPage />
}, {
  path: '/contacts/customers',
  name: 'Customers',
  element: <CustomersPage />
}, {
  path: '/contacts/customer-groups',
  name: 'Customer Groups',
  element: <CustomerGroupsPage />
}, {
  path: '/contacts/import',
  name: 'Import Contacts',
  element: <ImportContactsPage />
}];

const productsRoutes = [{
  path: '/products/list',
  name: 'List Products',
  element: <ListProductsPage />
}, {
  path: '/products/add',
  name: 'Add Product',
  element: <AddProductPage />
}, {
  path: '/products/edit/:id',
  name: 'Edit Product',
  element: <EditProductPage />
}, {
  path: '/products/variations',
  name: 'Variations',
  element: <VariationsPage />
}, {
  path: '/products/import',
  name: 'Import Products',
  element: <ImportProductsPage />
}, {
  path: '/products/import-seed',
  name: 'Import Seed',
  element: <ImportSeedPage />
}, {
  path: '/products/stock-seed',
  name: 'Stock Seed',
  element: <StockSeedPage />
}, {
  path: '/products/sku-seed',
  name: 'SKU Seed',
  element: <SkuSeedPage />
}, {
  path: '/products/import-opening-stock',
  name: 'Import Opening Stock',
  element: <ImportOpeningStockPage />
}, {
  path: '/products/selling-price-group',
  name: 'Selling Price Group',
  element: <SellingPriceGroupPage />
}, {
  path: '/products/units',
  name: 'Units',
  element: <UnitsPage />
}, {
  path: '/products/categories',
  name: 'Categories',
  element: <CategoriesPage />
}, {
  path: '/products/brands',
  name: 'Brands',
  element: <BrandsPage />
}, {
  path: '/products/warranties',
  name: 'Warranties',
  element: <WarrantiesPage />
}];

const purchasesRoutes = [{
  path: '/purchases/list',
  name: 'List Purchases',
  element: <ListPurchasesPage />
}, {
  path: '/purchases/add',
  name: 'Add Purchase',
  element: <AddPurchasePage />
}, {
  path: '/purchases/edit/:id',
  name: 'Edit Purchase',
  element: <EditPurchasePage />
}, {
  path: '/purchases/import',
  name: 'Import Purchases',
  element: <ImportPurchasesPage />
}];

const salesRoutes = [{
  path: '/sales/all',
  name: 'All Sales',
  element: <AllSalesPage />
}, {
  path: '/sales/add',
  name: 'Add Sale',
  element: <AddSalePage />
}, {
  path: '/sales/edit/:id',
  name: 'Edit Sale',
  element: <EditSalePage />
}, {
  path: '/sales/pos',
  name: 'List POS',
  element: <ListPOSPage />
}, {
  path: '/sales/pos-screen',
  name: 'POS',
  element: <POSScreenPage />
}, {
  path: '/sales/drafts',
  name: 'Drafts',
  element: <DraftsPage />
}, {
  path: '/sales/quotations',
  name: 'Quotations',
  element: <QuotationsPage />
}, {
  path: '/sales/quotations/add',
  name: 'Add Quotation',
  element: <AddQuotationPage />
}, {
  path: '/sales/sell-return',
  name: 'Sell Return',
  element: <SellReturnPage />
}, {
  path: '/sales/shipments',
  name: 'Shipments',
  element: <ShipmentsPage />
}, {
  path: '/sales/discount',
  name: 'Discount',
  element: <DiscountPage />
}, {
  path: '/sales/import',
  name: 'Import Sales',
  element: <ImportSalesPage />
}];

const stockAdjustmentRoutes = [{
  path: '/stock-adjustment/list',
  name: 'List Stock Adjustment',
  element: <ListStockAdjustmentPage />
}, {
  path: '/stock-adjustment/add',
  name: 'Add Stock Adjustment',
  element: <AddStockAdjustmentPage />
}];

const expensesRoutes = [{
  path: '/expenses/list',
  name: 'List Expenses',
  element: <ListExpensesPage />
}, {
  path: '/expenses/add',
  name: 'Add Expense',
  element: <AddExpensePage />
}, {
  path: '/expenses/categories',
  name: 'Expense Categories',
  element: <ExpenseCategoriesPage />
}];

const reportsRoutes = [{
  path: '/reports/profit-loss',
  name: 'Profit Loss Report',
  element: <ProfitLossReportPage />
}, {
  path: '/reports/purchase-sell',
  name: 'Purchase Sell Report',
  element: <PurchaseSellReportPage />
}, {
  path: '/reports/tax',
  name: 'Tax Report',
  element: <TaxReportPage />
}, {
  path: '/reports/customer-supplier',
  name: 'Customer Supplier Report',
  element: <CustomerSupplierReportPage />
}, {
  path: '/reports/suppliers',
  name: 'Suppliers Report',
  element: <SuppliersReportPage />
}, {
  path: '/reports/customers',
  name: 'Customers Report',
  element: <CustomersReportPage />
}, {
  path: '/reports/product',
  name: 'Product Report',
  element: <ProductReportPage />
}, {
  path: '/reports/products',
  name: 'Products Report',
  element: <ProductsReportPage />
}, {
  path: '/reports/purchases',
  name: 'Purchases Report',
  element: <PurchasesReportPage />
}, {
  path: '/reports/sales',
  name: 'Sales Report',
  element: <SalesReportPage />
}, {
  path: '/reports/stock',
  name: 'Stock Report',
  element: <StockReportPage />
}, {
  path: '/reports/product-stock',
  name: 'Product Stock Report',
  element: <ProductStockReportPage />
}, {
  path: '/reports/stock-adjustment',
  name: 'Stock Adjustment Report',
  element: <StockAdjustmentReportPage />
}, {
  path: '/reports/trending-products',
  name: 'Trending Products',
  element: <TrendingProductsPage />
}, {
  path: '/reports/expense',
  name: 'Expense Report',
  element: <ExpenseReportPage />
}, {
  path: '/reports/stock-expiry',
  name: 'Stock Expiry Report',
  element: <StockExpiryReportPage />
}, {
  path: '/reports/lot',
  name: 'Lot Report',
  element: <LotReportPage />
}, {
  path: '/reports/register',
  name: 'Register Report',
  element: <RegisterReportPage />
}, {
  path: '/reports/sales-representative',
  name: 'Sales Representative Report',
  element: <SalesRepresentativeReportPage />
}, {
  path: '/reports/activity-log',
  name: 'Activity Log',
  element: <ActivityLogPage />
}];

const settingsRoutes = [{
  path: '/settings/business',
  name: 'Business Settings',
  element: <BusinessSettingsPage />
}, {
  path: '/settings/locations',
  name: 'Business Locations',
  element: <BusinessLocationsPage />
}, {
  path: '/settings/invoice',
  name: 'Invoice Settings',
  element: <InvoiceSettingsPage />
}, {
  path: '/settings/receipt-printers',
  name: 'Receipt Printers',
  element: <ReceiptPrintersPage />
}, {
  path: '/settings/tax-rates',
  name: 'Tax Rates',
  element: <TaxRatesPage />
}, {
  path: '/settings/payment-accounts',
  name: 'Payment Accounts',
  element: <PaymentAccountsPage />
}];

const apiTestRoutes = [{
  path: '/api-test',
  name: 'API Test',
  element: <APITestPage />
}];

export const appRoutes = [
  ...initialRoutes,
  ...homeRoutes,
  ...userManagementRoutes,
  ...contactsRoutes,
  ...productsRoutes,
  ...purchasesRoutes,
  ...salesRoutes,
  ...stockAdjustmentRoutes,
  ...expensesRoutes,
  ...reportsRoutes,
  ...settingsRoutes,
  ...apiTestRoutes
];