import axios from 'axios';
import { deleteCookie, getCookie } from 'cookies-next';

// Use relative URL since we have a Vite proxy configured (overridable via env)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const AUTH_SESSION_KEY = '_BMS_AUTH_KEY_';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the JWT from the auth session cookie to every request
api.interceptors.request.use((config) => {
  try {
    const session = getCookie(AUTH_SESSION_KEY)?.toString();
    if (session) {
      const { token } = JSON.parse(session);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // malformed session cookie — proceed without a token
  }
  return config;
});

// Error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Expired/invalid token or revoked access: end the session and send to sign-in
    const status = error.response?.status;
    if ((status === 401 || status === 403) && !error.config?.url?.startsWith('/auth/login')) {
      deleteCookie(AUTH_SESSION_KEY);
      if (status === 401 && window.location.pathname !== '/auth/sign-in') {
        window.location.href = '/auth/sign-in';
      }
    }
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ==================== Auth ====================
export const login = (credentials) => api.post('/auth/login', credentials);

// ==================== Users ====================
export const getUsers = () => api.get('/users');
export const getUser = (id) => api.get(`/users/${id}`);
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// ==================== Roles ====================
export const getRoles = () => api.get('/roles');
export const getRole = (id) => api.get(`/roles/${id}`);
export const createRole = (data) => api.post('/roles', data);
export const updateRole = (id, data) => api.put(`/roles/${id}`, data);
export const deleteRole = (id) => api.delete(`/roles/${id}`);

// ==================== Products ====================
export const getProducts = () => api.get('/products');
export const getProduct = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// ==================== Customers ====================
export const getCustomers = () => api.get('/customers');
export const getCustomer = (id) => api.get(`/customers/${id}`);
export const createCustomer = (data) => api.post('/customers', data);
export const updateCustomer = (id, data) => api.put(`/customers/${id}`, data);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`);

// ==================== Suppliers ====================
export const getSuppliers = () => api.get('/suppliers');
export const getSupplier = (id) => api.get(`/suppliers/${id}`);
export const createSupplier = (data) => api.post('/suppliers', data);
export const updateSupplier = (id, data) => api.put(`/suppliers/${id}`, data);
export const deleteSupplier = (id) => api.delete(`/suppliers/${id}`);

// ==================== Sales ====================
export const getSales = () => api.get('/sales');
export const getSale = (id) => api.get(`/sales/${id}`);
export const createSale = (data) => api.post('/sales', data);
export const deleteSale = (id) => api.delete(`/sales/${id}`);

// ==================== Purchases ====================
export const getPurchases = () => api.get('/purchases');
export const getPurchase = (id) => api.get(`/purchases/${id}`);
export const createPurchase = (data) => api.post('/purchases', data);
export const updatePurchaseStatus = (id, status) => api.patch(`/purchases/${id}/status`, { status });
export const deletePurchase = (id) => api.delete(`/purchases/${id}`);

// ==================== Expenses ====================
export const getExpenses = () => api.get('/expenses');
export const getExpense = (id) => api.get(`/expenses/${id}`);
export const createExpense = (data) => api.post('/expenses', data);
export const updateExpense = (id, data) => api.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);

// ==================== Stock Adjustments ====================
export const getStockAdjustments = () => api.get('/stock-adjustments');
export const getStockAdjustment = (id) => api.get(`/stock-adjustments/${id}`);
export const createStockAdjustment = (data) => api.post('/stock-adjustments', data);
export const deleteStockAdjustment = (id) => api.delete(`/stock-adjustments/${id}`);

// ==================== Reports ====================
export const getProfitLossReport = (params) => api.get('/reports/profit-loss', { params });
export const getSalesReport = (params) => api.get('/reports/sales', { params });
export const getPurchasesReport = (params) => api.get('/reports/purchases', { params });
export const getProductStockReport = (params) => api.get('/reports/product-stock', { params });
export const getCustomersReport = (params) => api.get('/reports/customers', { params });
export const getSuppliersReport = (params) => api.get('/reports/suppliers', { params });

// ==================== Dashboard ====================
export const getDashboardStats = (params) => api.get('/dashboard/stats', { params });

export default api;
