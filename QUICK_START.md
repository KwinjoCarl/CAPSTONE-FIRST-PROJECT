# 🚀 Quick Start Guide

## Get Your BMS3 App Connected to MySQL in 5 Minutes!

### ⚡ Prerequisites
- ✅ MySQL 8.0 installed and running (already done!)
- ✅ Node.js installed
- ✅ Backend folder created with all files

---

## 📝 Step 1: Configure Password (30 seconds)

1. Open: `backend\.env`
2. Find line: `DB_PASSWORD=your_mysql_password_here`
3. Replace with your actual MySQL root password
4. Save file

```env
DB_PASSWORD=YourActualPassword123
```

---

## 🗄️ Step 2: Create Database (1 minute)

**Double-click this file:**
```
backend\setup-database.bat
```

Enter your MySQL password when prompted.

**OR use command line:**
```powershell
cd C:\DEV\Websites\BMS3\backend
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < database.sql
```

---

## 🧪 Step 3: Test Connection (30 seconds)

```powershell
cd C:\DEV\Websites\BMS3\backend
node test-connection.js
```

**Expected output:**
```
✅ Connected to MySQL successfully!
✅ Found 2 products in database
✅ Connection closed
```

---

## 🚀 Step 4: Start Backend Server (30 seconds)

```powershell
cd C:\DEV\Websites\BMS3\backend
npm start
```

**Expected output:**
```
✅ Database connected successfully
🚀 Server running on http://localhost:5000
```

**Keep this terminal open!**

---

## 🌐 Step 5: Test API (30 seconds)

Open browser and visit:
- http://localhost:5000
- http://localhost:5000/api/products
- http://localhost:5000/api/customers

You should see JSON data!

---

## ✅ Success!

Your backend is now running and connected to MySQL!

### What's Working:
- ✅ MySQL database with all tables
- ✅ REST API server on port 5000
- ✅ All CRUD operations for products, sales, purchases, etc.
- ✅ Reports API with calculations
- ✅ Automatic stock management

---

## 🔄 Next: Connect React Frontend

### Install Axios
```powershell
cd "C:\DEV\Websites\BMS3\Business Management System\JS"
npm install axios
```

### Create API Service
Create file: `src/services/api.js`

Copy the code from `MYSQL_SETUP_GUIDE.md` (Step 2 under Frontend Integration)

### Update Your Components
Replace localStorage calls with API calls.

**Example:**
```javascript
// OLD
const products = JSON.parse(localStorage.getItem('bms_products') || '[]');

// NEW
import { getProducts } from '@/services/api';

const loadProducts = async () => {
  const response = await getProducts();
  setProducts(response.data);
};
```

---

## 📚 Full Documentation

- **Backend API Docs:** `backend/README.md`
- **Complete Setup Guide:** `MYSQL_SETUP_GUIDE.md`
- **Setup Summary:** `BACKEND_SETUP_COMPLETE.md`

---

## 🆘 Troubleshooting

### Can't connect to database?
- Check MySQL service is running: `Get-Service MySQL80`
- Verify password in `.env` is correct
- Make sure database exists: Run `setup-database.bat` again

### Port 5000 already in use?
- Change PORT in `.env` to 5001
- Restart backend server

### API returns 404?
- Make sure backend server is running
- Check the URL: `http://localhost:5000/api/products`

---

## 🎯 Running Both Servers

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

## 🎉 That's It!

You now have a fully functional backend API connected to MySQL!

Need help? Check the other documentation files or the error messages in the terminal.
