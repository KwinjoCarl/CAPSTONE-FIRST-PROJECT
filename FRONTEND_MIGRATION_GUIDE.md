# 🔄 Frontend Migration Guide
## Converting from localStorage to MySQL API

This guide shows you how to update your React components to use the MySQL backend instead of localStorage.

---

## ✅ What's Already Done

1. ✅ Axios installed
2. ✅ API service layer created (`src/services/api.js`)
3. ✅ Backend server running on port 5000
4. ✅ Database connected and ready

---

## 🔑 Key Changes

### Database Field Names
MySQL uses snake_case, your frontend might use camelCase. Here's the mapping:

| Frontend (camelCase) | Database (snake_case) |
|---------------------|----------------------|
| `currentStock` | `current_stock` |
| `alertQuantity` | `alert_quantity` |
| `purchasePrice` | `purchase_price` |
| `sellingPrice` | `selling_price` |
| `openingStock` | `opening_stock` |
| `customerName` | `customer_name` |
| `invoiceNo` | `invoice_no` |
| `referenceNo` | `reference_no` |
| `saleDate` | `sale_date` |
| `purchaseDate` | `purchase_date` |
| `grandTotal` | `grand_total` |
| `amountReceived` | `amount_received` |
| `amountPaid` | `amount_paid` |
| `shippingCharge` | `shipping_charge` |
| `paymentMethod` | `payment_method` |

---

## 📝 Migration Pattern

### Before (localStorage)
```javascript
// Load data
const products = JSON.parse(localStorage.getItem('bms_products') || '[]');

// Save data
localStorage.setItem('bms_products', JSON.stringify(products));

// Delete data
const updated = products.filter(p => p.id !== productId);
localStorage.setItem('bms_products', JSON.stringify(updated));
```

### After (API)
```javascript
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/services/api';

// Load data
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  loadProducts();
}, []);

// Create data
const handleCreate = async (productData) => {
  try {
    await createProduct(productData);
    // Reload list
    const response = await getProducts();
    setProducts(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Update data
const handleUpdate = async (id, productData) => {
  try {
    await updateProduct(id, productData);
    // Reload list
    const response = await getProducts();
    setProducts(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Delete data
const handleDelete = async (id) => {
  try {
    await deleteProduct(id);
    // Reload list
    const response = await getProducts();
    setProducts(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 🎯 Step-by-Step Migration

### Step 1: Products List Page

**File:** `src/app/(admin)/products/list/page.jsx`

**Changes needed:**
1. Import API functions
2. Replace localStorage with API calls
3. Update field names (camelCase → snake_case)
4. Add loading states
5. Add error handling

**Example file created:** `page-api.jsx` (in same folder)

You can:
- **Option A:** Replace the content of `page.jsx` with `page-api.jsx`
- **Option B:** Gradually migrate by testing `page-api.jsx` first

### Step 2: Products Add Page

**File:** `src/app/(admin)/products/add/page.jsx`

**Key changes:**
```javascript
// OLD
const handleSubmit = (e) => {
  e.preventDefault();
  const products = JSON.parse(localStorage.getItem('bms_products') || '[]');
  const newProduct = {
    id: Date.now(),
    ...formData
  };
  products.push(newProduct);
  localStorage.setItem('bms_products', JSON.stringify(products));
  navigate('/products/list');
};

// NEW
import { createProduct } from '@/services/api';

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    // Convert camelCase to snake_case
    const productData = {
      name: formData.name,
      sku: formData.sku,
      category: formData.category,
      brand: formData.brand,
      unit: formData.unit,
      purchase_price: formData.purchasePrice,
      selling_price: formData.sellingPrice,
      current_stock: formData.currentStock || 0,
      opening_stock: formData.openingStock || 0,
      alert_quantity: formData.alertQuantity || 0
    };
    
    await createProduct(productData);
    navigate('/products/list');
  } catch (error) {
    console.error('Error creating product:', error);
    alert('Failed to create product');
  }
};
```

### Step 3: Products Edit Page

**File:** `src/app/(admin)/products/edit/[id]/page.jsx`

**Key changes:**
```javascript
// OLD
useEffect(() => {
  const products = JSON.parse(localStorage.getItem('bms_products') || '[]');
  const product = products.find(p => p.id === parseInt(id));
  if (product) {
    setFormData(product);
  }
}, [id]);

// NEW
import { getProduct, updateProduct } from '@/services/api';

useEffect(() => {
  const loadProduct = async () => {
    try {
      const response = await getProduct(id);
      const product = response.data;
      
      // Convert snake_case to camelCase for form
      setFormData({
        name: product.name,
        sku: product.sku,
        category: product.category,
        brand: product.brand,
        unit: product.unit,
        purchasePrice: product.purchase_price,
        sellingPrice: product.selling_price,
        currentStock: product.current_stock,
        alertQuantity: product.alert_quantity
      });
    } catch (error) {
      console.error('Error loading product:', error);
    }
  };
  loadProduct();
}, [id]);

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const productData = {
      name: formData.name,
      sku: formData.sku,
      category: formData.category,
      brand: formData.brand,
      unit: formData.unit,
      purchase_price: formData.purchasePrice,
      selling_price: formData.sellingPrice,
      current_stock: formData.currentStock,
      alert_quantity: formData.alertQuantity
    };
    
    await updateProduct(id, productData);
    navigate('/products/list');
  } catch (error) {
    console.error('Error updating product:', error);
    alert('Failed to update product');
  }
};
```

---

## 🛒 Sales & Purchases Migration

### Sales Creation
```javascript
import { createSale } from '@/services/api';

const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const saleData = {
      invoice_no: formData.invoiceNo,
      customer_id: formData.customerId, // Must be a valid customer ID from database
      sale_date: formData.saleDate,
      subtotal: formData.subtotal,
      discount: formData.discount || 0,
      tax: formData.tax || 0,
      shipping_charge: formData.shippingCharge || 0,
      grand_total: formData.grandTotal,
      amount_received: formData.amountReceived,
      payment_method: formData.paymentMethod,
      location: formData.location,
      salesperson: formData.salesperson,
      status: 'final',
      items: formData.items.map(item => ({
        product_id: item.productId, // Must be valid product ID
        quantity: item.quantity,
        unit_price: item.unitPrice,
        subtotal: item.subtotal
      }))
    };
    
    await createSale(saleData);
    navigate('/sales/all');
  } catch (error) {
    console.error('Error creating sale:', error);
    alert('Failed to create sale');
  }
};
```

### Important: Stock Updates
The backend automatically handles stock updates:
- ✅ Creating a sale **decreases** product stock
- ✅ Deleting a sale **restores** product stock
- ✅ Creating a purchase (status='received') **increases** stock
- ✅ Deleting a purchase **reverses** stock changes

You don't need to manually update stock in the frontend!

---

## 📊 Reports Migration

### Before (localStorage calculations)
```javascript
const products = JSON.parse(localStorage.getItem('bms_products') || '[]');
const sales = JSON.parse(localStorage.getItem('bms_sales') || '[]');
// ... complex calculations
```

### After (API with pre-calculated data)
```javascript
import { getProfitLossReport } from '@/services/api';

const [reportData, setReportData] = useState(null);

useEffect(() => {
  const loadReport = async () => {
    try {
      const response = await getProfitLossReport({
        start_date: '2024-01-01',
        end_date: '2024-12-31'
      });
      setReportData(response.data);
    } catch (error) {
      console.error('Error loading report:', error);
    }
  };
  loadReport();
}, []);

// Use reportData.cogs, reportData.gross_profit, reportData.net_profit, etc.
```

---

## 🔍 Testing Checklist

For each migrated page:

- [ ] Page loads without errors
- [ ] Data displays correctly
- [ ] Create operation works
- [ ] Update operation works
- [ ] Delete operation works
- [ ] Loading states show
- [ ] Error messages display
- [ ] Field names are correct (snake_case in API calls)
- [ ] Stock updates work (for sales/purchases)
- [ ] Navigation works after operations

---

## 🚨 Common Issues & Solutions

### Issue 1: "Cannot read property of undefined"
**Problem:** Field name mismatch (camelCase vs snake_case)
**Solution:** Check field names match database schema

```javascript
// WRONG
<td>{product.currentStock}</td>

// CORRECT
<td>{product.current_stock}</td>
```

### Issue 2: "Network Error" or "ERR_CONNECTION_REFUSED"
**Problem:** Backend server not running
**Solution:** Start backend server
```powershell
cd C:\DEV\Websites\BMS3\backend
npm start
```

### Issue 3: "404 Not Found"
**Problem:** Wrong API endpoint
**Solution:** Check API URL matches backend routes
```javascript
// CORRECT
await getProducts(); // calls /api/products

// WRONG
await getProducts('/products'); // calls /api/products/products
```

### Issue 4: Stock not updating
**Problem:** Not reloading data after operations
**Solution:** Reload data after create/update/delete
```javascript
await createSale(saleData);
// Reload products to see updated stock
const response = await getProducts();
setProducts(response.data);
```

### Issue 5: "Foreign key constraint fails"
**Problem:** Trying to use invalid customer_id or product_id
**Solution:** Ensure IDs exist in database
```javascript
// Get valid customer ID first
const customers = await getCustomers();
const customerId = customers.data[0].id;

// Then use it in sale
const saleData = {
  customer_id: customerId, // Valid ID from database
  // ...
};
```

---

## 📋 Migration Priority

Recommended order:

1. **Products** (easiest, no dependencies)
   - List page
   - Add page
   - Edit page

2. **Customers & Suppliers** (simple CRUD)
   - Customers list
   - Suppliers list

3. **Sales** (depends on products & customers)
   - Sales list
   - Create sale

4. **Purchases** (depends on products & suppliers)
   - Purchases list
   - Create purchase

5. **Expenses** (simple, no dependencies)
   - Expenses list
   - Add expense

6. **Stock Adjustments** (depends on products)
   - Adjustments list
   - Create adjustment

7. **Reports** (uses all data)
   - All report pages

---

## 🎯 Quick Reference

### Available API Functions

```javascript
// Products
getProducts(), getProduct(id), createProduct(data), 
updateProduct(id, data), deleteProduct(id)

// Customers
getCustomers(), getCustomer(id), createCustomer(data),
updateCustomer(id, data), deleteCustomer(id)

// Suppliers
getSuppliers(), getSupplier(id), createSupplier(data),
updateSupplier(id, data), deleteSupplier(id)

// Sales
getSales(), getSale(id), createSale(data), deleteSale(id)

// Purchases
getPurchases(), getPurchase(id), createPurchase(data),
updatePurchaseStatus(id, status), deletePurchase(id)

// Expenses
getExpenses(), getExpense(id), createExpense(data),
updateExpense(id, data), deleteExpense(id)

// Stock Adjustments
getStockAdjustments(), getStockAdjustment(id),
createStockAdjustment(data), deleteStockAdjustment(id)

// Reports
getProfitLossReport(params), getSalesReport(params),
getPurchasesReport(params), getProductStockReport(params),
getCustomersReport(params), getSuppliersReport(params)
```

---

## ✨ Benefits After Migration

- ✅ Data persists across browser sessions
- ✅ Multiple users can access same data
- ✅ Automatic stock management
- ✅ Data integrity with transactions
- ✅ Better performance with indexes
- ✅ Scalable for production use
- ✅ Backup and recovery possible
- ✅ Advanced queries and reports

---

## 📞 Need Help?

If you get stuck:
1. Check browser console for errors
2. Check backend terminal for API errors
3. Verify backend is running on port 5000
4. Test API endpoints directly in browser
5. Check field names match database schema

---

**Next Steps:**
1. Start with Products List page
2. Test thoroughly
3. Move to Add/Edit pages
4. Continue with other modules
5. Test end-to-end workflows
