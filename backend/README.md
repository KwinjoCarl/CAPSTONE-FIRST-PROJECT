# BMS3 Backend API

Node.js + Express + MySQL backend for the Business Management System.

## Setup Instructions

### 1. Configure Database

Edit the `.env` file and update your MySQL credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_mysql_password
DB_NAME=bms3_db
PORT=5000
```

### 2. Create Database and Tables

Open MySQL Command Line Client or MySQL Workbench and run:

```bash
# Using MySQL Command Line Client
mysql -u root -p < database.sql
```

Or manually:
1. Open `database.sql` file
2. Copy the SQL commands
3. Paste and execute in MySQL Command Line Client or MySQL Workbench

### 3. Start the Server

```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get single customer
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `GET /api/suppliers/:id` - Get single supplier
- `POST /api/suppliers` - Create supplier
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier

### Sales
- `GET /api/sales` - Get all sales
- `GET /api/sales/:id` - Get single sale
- `POST /api/sales` - Create sale (with items)
- `DELETE /api/sales/:id` - Delete sale

### Purchases
- `GET /api/purchases` - Get all purchases
- `GET /api/purchases/:id` - Get single purchase
- `POST /api/purchases` - Create purchase (with items)
- `PATCH /api/purchases/:id/status` - Update purchase status
- `DELETE /api/purchases/:id` - Delete purchase

### Expenses
- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/:id` - Get single expense
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Stock Adjustments
- `GET /api/stock-adjustments` - Get all stock adjustments
- `GET /api/stock-adjustments/:id` - Get single adjustment
- `POST /api/stock-adjustments` - Create adjustment
- `DELETE /api/stock-adjustments/:id` - Delete adjustment

### Reports
- `GET /api/reports/profit-loss?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` - Profit/Loss report
- `GET /api/reports/sales?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` - Sales report
- `GET /api/reports/purchases?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` - Purchases report
- `GET /api/reports/product-stock?category=&brand=&stock_status=` - Product stock report
- `GET /api/reports/customers?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` - Customers report
- `GET /api/reports/suppliers?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` - Suppliers report

## Testing the API

You can test the API using:
- Browser: `http://localhost:5000`
- Postman
- Thunder Client (VS Code extension)
- cURL commands

Example:
```bash
# Get all products
curl http://localhost:5000/api/products

# Create a product
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","sku":"TEST001","purchase_price":100,"selling_price":150}'
```

## Troubleshooting

### Database Connection Error
- Check if MySQL service is running: `Get-Service MySQL80`
- Verify credentials in `.env` file
- Make sure `bms3_db` database exists

### Port Already in Use
- Change the PORT in `.env` file
- Or kill the process using port 5000

### CORS Issues
- The backend is configured to allow all origins
- If you need specific origins, edit `server.js`
