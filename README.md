# 🏢 BMS3 - Business Management System

Complete business management solution with React frontend and Node.js + MySQL backend.

## 📊 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     BMS3 Architecture                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │   React      │  HTTP   │   Node.js    │                 │
│  │   Frontend   │ ◄─────► │   Express    │                 │
│  │  (Port 3000) │  REST   │  (Port 5000) │                 │
│  └──────────────┘   API   └──────┬───────┘                 │
│                                   │                          │
│                                   │ SQL                      │
│                                   ▼                          │
│                           ┌──────────────┐                  │
│                           │    MySQL     │                  │
│                           │   Database   │                  │
│                           │  (bms3_db)   │                  │
│                           └──────────────┘                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## ✨ Features

### 📦 Inventory Management
- Product catalog with variations
- Real-time stock tracking
- Low stock alerts
- Stock adjustments (damages, theft, corrections)

### 💰 Sales Management
- POS system
- Sales invoicing
- Multiple payment methods
- Customer tracking
- Sales returns

### 🛒 Purchase Management
- Purchase orders
- Supplier management
- Purchase status tracking (Pending, Ordered, Received)
- Purchase returns

### 💵 Financial Management
- Expense tracking
- Profit/Loss calculations
- Revenue analysis
- Payment tracking (receivables & payables)

### 📊 Comprehensive Reports
1. **Profit/Loss Report** - COGS, Gross Profit, Net Profit
2. **Sales Report** - By date, customer, payment method, location, salesperson
3. **Purchases Report** - By date, supplier, status
4. **Product Stock Report** - Current stock, value, profit margins
5. **Customers Report** - Sales history, dues, payments
6. **Suppliers Report** - Purchase history, payables
7. **Stock Adjustment Report** - Audit trail for inventory changes

## 🚀 Quick Start

### 1. Configure Database
```powershell
# Edit backend\.env with your MySQL password
DB_PASSWORD=your_password_here
```

### 2. Create Database
```powershell
# Double-click or run:
backend\setup-database.bat
```

### 3. Start Backend
```powershell
cd backend
npm start
```

### 4. Start Frontend
```powershell
cd "Business Management System\JS"
npm run dev
```

## 📁 Project Structure

```
BMS3/
├── backend/                              # Node.js + Express API
│   ├── config/
│   │   └── db.js                        # MySQL connection
│   ├── middleware/
│   │   ├── auth.js                      # JWT auth + role loading
│   │   └── permissions.js               # Server-side RBAC enforcement
│   ├── migrations/
│   │   ├── 001_capture_live_schema.sql  # Authoritative DB schema
│   │   ├── 002_seed_default_roles.sql   # Default roles + permissions
│   │   └── run-migrations.js            # Password hashing migration
│   ├── scripts/
│   │   └── backup-db.ps1                # Automated timestamped DB backups
│   ├── backups/                         # DB snapshots (gitignored)
│   ├── tests/
│   │   └── api.test.js                  # Integration test suite (npm test)
│   ├── routes/
│   │   ├── auth.js                      # Login (bcrypt + JWT)
│   │   ├── users.js                     # Users CRUD
│   │   ├── roles.js                     # Roles CRUD
│   │   ├── products.js                  # Products API
│   │   ├── customers.js                 # Customers API
│   │   ├── suppliers.js                 # Suppliers API
│   │   ├── sales.js                     # Sales API
│   │   ├── purchases.js                 # Purchases API
│   │   ├── expenses.js                  # Expenses API
│   │   ├── stockAdjustments.js          # Stock Adjustments API
│   │   ├── dashboard.js                 # Dashboard stats API
│   │   └── reports.js                   # Reports API
│   ├── .env                             # Configuration (gitignored)
│   ├── .env.example                     # Config template (commit this)
│   ├── server.js                        # Main server
│   ├── database.sql                     # Legacy seed (use migrations/ for new setups)
│   └── package.json
│
├── Business Management System/
│   └── JS/                              # React Frontend
│       └── src/
│           ├── app/
│           │   └── (admin)/
│           │       ├── products/        # Product pages
│           │       ├── sales/           # Sales pages
│           │       ├── purchases/       # Purchase pages
│           │       ├── contacts/        # Customers & Suppliers
│           │       ├── expenses/        # Expense pages
│           │       ├── stock-adjustment/# Stock adjustment pages
│           │       └── reports/         # Report pages
│           ├── services/
│           │   └── api.js              # API service layer
│           └── assets/
│
├── QUICK_START.md                       # 5-minute setup guide
├── MYSQL_SETUP_GUIDE.md                 # Complete setup guide
├── BACKEND_SETUP_COMPLETE.md            # What was created
├── SETUP_CHECKLIST.md                   # Verification checklist
└── README.md                            # This file
```

## 🗄️ Database Schema

### Tables Created
- `users` - User accounts (bcrypt passwords, role assignment, active/inactive status)
- `roles` - Named roles with JSON permission sets (Admin, Manager, Cashier, Stock Keeper, Salesperson)
- `products` - Product catalog
- `customers` - Customer records
- `suppliers` - Supplier records
- `sales` - Sales transactions
- `sale_items` - Individual sale line items
- `purchases` - Purchase orders
- `purchase_items` - Individual purchase line items
- `expenses` - Business expenses
- `stock_adjustments` - Inventory adjustments

### Key Features
- ✅ Foreign key relationships
- ✅ Cascade deletes for line items
- ✅ Indexes for performance
- ✅ Timestamps for audit trail
- ✅ `roles` table with JSON permission sets
- ✅ `users.role_id` / `users.status` / `users.pin` columns

## 🔌 API Endpoints

### Products
```
GET    /api/products           # List all products
POST   /api/products           # Create product
PUT    /api/products/:id       # Update product
DELETE /api/products/:id       # Delete product
```

### Sales
```
GET    /api/sales              # List all sales
POST   /api/sales              # Create sale (auto-updates stock)
DELETE /api/sales/:id          # Delete sale (restores stock)
```

### Purchases
```
GET    /api/purchases          # List all purchases
POST   /api/purchases          # Create purchase
PATCH  /api/purchases/:id/status  # Update status (updates stock)
DELETE /api/purchases/:id      # Delete purchase (reverses stock)
```

### Reports
```
GET /api/reports/profit-loss?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
GET /api/reports/sales?customer_id=1&payment_method=cash
GET /api/reports/product-stock?category=Electronics
GET /api/reports/customers
GET /api/reports/suppliers
```

[See full API documentation in `backend/README.md`]

## 🔧 Technology Stack

### Frontend
- **React 18** - UI framework
- **React Router** - Navigation
- **Bootstrap 5** - UI components
- **Axios** - HTTP client
- **SCSS** - Styling

### Backend
- **Node.js** - Runtime
- **Express 5** - Web framework
- **MySQL2** - Database driver
- **dotenv** - Environment configuration
- **CORS** - Cross-origin support

### Database
- **MySQL 8.0** - Relational database

## 🎯 Key Features

### Automatic Stock Management
- Sales automatically decrease stock
- Purchases automatically increase stock (when received)
- Stock adjustments add/subtract inventory
- Deleting transactions reverses stock changes

### Transaction Safety
- Database transactions ensure data integrity
- Rollback on errors
- Atomic operations

### Report Calculations
- Real-time profit/loss calculations
- COGS (Cost of Goods Sold)
- Gross profit and net profit
- Customer/Supplier balances
- Stock valuations

## 📚 Documentation

1. **QUICK_START.md** - Get started in 5 minutes
2. **MYSQL_SETUP_GUIDE.md** - Complete setup instructions
3. **BACKEND_SETUP_COMPLETE.md** - What was created
4. **SETUP_CHECKLIST.md** - Verification checklist
5. **backend/README.md** - API documentation

## 🆘 Troubleshooting

### Backend won't start?
- Check MySQL service is running: `Get-Service MySQL80`
- Verify password in `.env` file
- Check if port 5000 is available

### Can't connect to database?
- Run `node test-connection.js` in backend folder
- Verify database exists: `SHOW DATABASES;`
- Check credentials in `.env`

### Frontend can't reach API?
- Make sure backend is running on port 5000
- Check for CORS errors in browser console
- Verify API URL in frontend code

[See full troubleshooting guide in `MYSQL_SETUP_GUIDE.md`]

## 🔐 Security Notes

- ⚠️ Never commit `.env` file to version control (it is gitignored — use `.env.example` as the template)
- ⚠️ Change default passwords in production
- ⚠️ Use HTTPS in production
- ✅ User passwords hashed with bcrypt
- ✅ JWT authentication on every `/api/*` route except login
- ✅ Server-side role/permission enforcement (RBAC)
- ✅ SQL injection prevented (parameterized queries)
- ✅ CORS restricted to configured origins (`CORS_ORIGINS`)

## � Deployment Runbook

### Environments

| Env | Frontend | Backend | Notes |
|---|---|---|---|
| Dev | `vite` on :5173 (proxies `/api` → :5000) | `node server.js` on :5000 | `.env` on developer machine |
| Prod | `vite build` → serve `dist/` statically | Node via a process manager (PM2/Task Scheduler) | set `VITE_API_BASE_URL` if no reverse proxy |

### Deploy steps
1. Copy `backend/.env.example` → `.env` and fill in production values (DB + a fresh `JWT_SECRET`).
2. `cd backend && npm ci && node migrations/run-migrations.js && npm start`
3. `cd "Business Management System/JS" && npm ci && npm run build`
4. Serve `dist/` behind a web server that proxies `/api` to the backend :5000.

### Database backups
```powershell
cd backend
npm run backup    # timestamped dump into backend/backups/, 30-day retention
```
Schedule with Windows Task Scheduler for automated daily snapshots.

### Rollback procedure
1. **Code:** `git revert <bad-commit>` (or check out the previous tag) and redeploy.
2. **Database:** restore the most recent snapshot before the bad deploy:
   ```powershell
   & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p bms3_db < backend\backups\bms3_db_<timestamp>.sql
   ```
3. **Verify:** run the API smoke suite — `cd backend && npm test` (14 checks: auth, RBAC, stock flow).

### Contributing (peer review required)
- All changes go through a **pull request**; do not push directly to `main`.
- Require at least one approval before merging (enable in GitHub → Settings → Branches).
- Before opening a PR: `cd backend && npm run lint && npm test`, and in the JS folder `npm run lint && npm run build`.

## 📈 Future Enhancements

- [ ] Multi-location support
- [ ] Email notifications
- [ ] PDF invoice generation
- [ ] Data export/import
- [ ] Mobile app

## 📄 License

[Your License Here]

## 👥 Contributors

[Your Name/Team]

## 📞 Support

For issues or questions:
1. Check the documentation files
2. Review error messages in terminal
3. Check browser console for frontend errors
4. Verify MySQL service is running

---

## 🎉 Status

✅ **Backend:** Complete — JWT auth, server-side RBAC, integration tests
✅ **Database:** Versioned migrations + automated backup script
✅ **API:** All endpoints implemented and permission-protected
✅ **Reports:** Comprehensive reports
✅ **Frontend:** API-integrated, token attached to every request
✅ **CI hygiene:** ESLint clean on frontend + backend

**Last Updated:** 2026-10-28
