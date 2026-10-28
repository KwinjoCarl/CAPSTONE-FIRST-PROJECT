# BMS3 MySQL Integration Guide

Complete guide to connect your BMS3 React app to MySQL database.

## ✅ Current Status

- ✅ MySQL 8.0.46 is installed and running
- ✅ Backend folder created with all API routes
- ✅ Database schema ready
- ⏳ Need to configure and test

---

## 📋 Step-by-Step Setup

### Step 1: Configure Database Credentials

1. Open `backend\.env` file
2. Replace `your_mysql_password_here` with your actual MySQL root password
3. Save the file

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_ACTUAL_PASSWORD_HERE
DB_NAME=bms3_db
PORT=5000
```

### Step 2: Create Database

**Option A: Using the batch script (Easiest)**
1. Double-click `backend\setup-database.bat`
2. Enter your MySQL root password when prompted
3. Wait for confirmation

**Option B: Manual setup**
1. Open MySQL 8.0 Command Line Client from Start Menu
2. Enter your root password
3. Copy and paste the contents of `backend\database.sql`
4. Press Enter to execute

**Option C: Using Command Line**
```powershell
cd C:\DEV\Websites\BMS3\backend
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < database.sql
```

### Step 3: Test Database Connection

```powershell
cd C:\DEV\Websites\BMS3\backend
node test-connection.js
```

You should see:
```
✅ Connected to MySQL successfully!
✅ Found X products in database
✅ Connection closed
```

### Step 4: Start Backend Server

```powershell
cd C:\DEV\Websites\BMS3\backend
npm start
```

You should see:
```
✅ Database connected successfully
🚀 Server running on http://localhost:5000
```

### Step 5: Test API Endpoints

Open your browser and visit:
- http://localhost:5000 (should show "BMS3 API Server is running!")
- http://localhost:5000/api/products (should return products array)

---

## 🔧 Frontend Integration

### Step 1: Install Axios in React App

```powershell
cd "C:\DEV\Websites\BMS3\Business Management System\JS"
npm install axios
```

### Step 2: Create API Service

Create `src/services/api.js`:

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products
export const getProducts = () => api.get('/products');
export const getProduct = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Customers
export const getCustomers = () => api.get('/customers');
export const createCustomer = (data) => api.post('/customers', data);

// Suppliers
export const getSuppliers = () => api.get('/suppliers');
export const createSupplier = (data) => api.post('/suppliers', data);

// Sales
export const getSales = () => api.get('/sales');
export const createSale = (data) => api.post('/sales', data);

// Purchases
export const getPurchases = () => api.get('/purchases');
export const createPurchase = (data) => api.post('/purchases', data);

// Expenses
export const getExpenses = () => api.get('/expenses');
export const createExpense = (data) => api.post('/expenses', data);

// Stock Adjustments
export const getStockAdjustments = () => api.get('/stock-adjustments');
export const createStockAdjustment = (data) => api.post('/stock-adjustments', data);

// Reports
export const getProfitLossReport = (params) => api.get('/reports/profit-loss', { params });
export const getSalesReport = (params) => api.get('/reports/sales', { params });
export const getPurchasesReport = (params) => api.get('/reports/purchases', { params });
export const getProductStockReport = (params) => api.get('/reports/product-stock', { params });
export const getCustomersReport = (params) => api.get('/reports/customers', { params });
export const getSuppliersReport = (params) => api.get('/reports/suppliers', { params });

export default api;
```

### Step 3: Update Components to Use API

Example for Products page:

```javascript
// Before (localStorage)
const products = JSON.parse(localStorage.getItem('bms_products') || '[]');

// After (API)
import { getProducts } from '@/services/api';

useEffect(() => {
  const loadProducts = async () => {
    try {
      const response = await getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };
  loadProducts();
}, []);
```

---

## 🗂️ Project Structure

```
BMS3/
├── backend/                          # Backend API
│   ├── config/
│   │   └── db.js                    # Database connection
│   ├── routes/
│   │   ├── products.js              # Products API
│   │   ├── customers.js             # Customers API
│   │   ├── suppliers.js             # Suppliers API
│   │   ├── sales.js                 # Sales API
│   │   ├── purchases.js             # Purchases API
│   │   ├── expenses.js              # Expenses API
│   │   ├── stockAdjustments.js      # Stock Adjustments API
│   │   └── reports.js               # Reports API
│   ├── .env                         # Environment variables
│   ├── server.js                    # Main server file
│   ├── database.sql                 # Database schema
│   ├── setup-database.bat           # Database setup script
│   ├── test-connection.js           # Connection test
│   └── package.json
│
└── Business Management System/
    └── JS/                          # React Frontend
        └── src/
            ├── services/
            │   └── api.js           # API service layer
            └── app/
                └── (admin)/
                    ├── products/
                    ├── sales/
                    ├── purchases/
                    └── reports/
```

---

## 🚀 Running Both Servers

You'll need two terminal windows:

**Terminal 1 - Backend:**
```powershell
cd C:\DEV\Websites\BMS3\backend
npm start
```

**Terminal 2 - Frontend:**
```powershell
cd "C:\DEV\Websites\BMS3\Business Management System\JS"
npm run dev
```

---

## 🔍 Troubleshooting

### MySQL Connection Error
```
❌ Connection failed: Access denied for user 'root'@'localhost'
```
**Solution:** Check your password in `.env` file

### Database Doesn't Exist
```
❌ Unknown database 'bms3_db'
```
**Solution:** Run `setup-database.bat` or create database manually

### Port Already in Use
```
❌ Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Change PORT in `.env` to 5001 or kill the process

### CORS Error in Browser
```
Access to XMLHttpRequest has been blocked by CORS policy
```
**Solution:** Backend already has CORS enabled. Make sure backend is running.

---

## 📊 Database Tables Created

1. **users** - User accounts
2. **products** - Product inventory
3. **customers** - Customer records
4. **suppliers** - Supplier records
5. **sales** - Sales transactions
6. **sale_items** - Individual sale items
7. **purchases** - Purchase orders
8. **purchase_items** - Individual purchase items
9. **expenses** - Business expenses
10. **stock_adjustments** - Inventory adjustments

---

## 🎯 Next Steps

1. ✅ Configure `.env` with your MySQL password
2. ✅ Run `setup-database.bat` to create database
3. ✅ Test connection with `node test-connection.js`
4. ✅ Start backend server with `npm start`
5. ⏳ Install axios in React app
6. ⏳ Create API service layer
7. ⏳ Update components to use API instead of localStorage
8. ⏳ Test the integration

---

## 📞 Need Help?

If you encounter any issues:
1. Check that MySQL80 service is running
2. Verify `.env` credentials are correct
3. Make sure both backend and frontend servers are running
4. Check browser console for errors
5. Check backend terminal for API errors
