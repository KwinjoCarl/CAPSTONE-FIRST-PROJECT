// Migration: add roles table, extend users, seed default roles
require('dotenv').config();
const mysql = require('mysql2/promise');

// Full permission catalog matching the app's actual modules & functions.
// Format: "<module>.<action>"
const ALL_PERMISSIONS = [
  // Dashboard
  'dashboard.view',
  // Users & Roles
  'users.view', 'users.create', 'users.update', 'users.delete',
  'roles.view', 'roles.create', 'roles.update', 'roles.delete',
  // Contacts
  'suppliers.view', 'suppliers.create', 'suppliers.update', 'suppliers.delete',
  'customers.view', 'customers.create', 'customers.update', 'customers.delete',
  // Products
  'products.view', 'products.create', 'products.update', 'products.delete',
  // Purchases
  'purchases.view', 'purchases.create', 'purchases.update', 'purchases.delete',
  'purchase_return.view', 'purchase_return.create',
  // Sales & POS
  'sales.view', 'sales.create', 'sales.update', 'sales.delete',
  'pos.access', 'quotations.view', 'quotations.create',
  // Stock Adjustment
  'stock_adjustments.view', 'stock_adjustments.create', 'stock_adjustments.delete',
  // Expenses
  'expenses.view', 'expenses.create', 'expenses.update', 'expenses.delete',
  // Reports
  'reports.profit_loss', 'reports.suppliers', 'reports.customers',
  'reports.products', 'reports.purchases', 'reports.sales',
  'reports.product_stock', 'reports.stock_adjustment',
  // Settings
  'settings.business', 'settings.locations', 'settings.tax_rates',
  'settings.payment_accounts', 'settings.invoice', 'settings.barcode'
];

const without = (perms, excluded) => perms.filter(p => !excluded.includes(p));

const DEFAULT_ROLES = [
  {
    name: 'Admin',
    description: 'Full access to every module and function',
    is_system: 1,
    permissions: ALL_PERMISSIONS
  },
  {
    name: 'Manager',
    description: 'Manages day-to-day operations. Full access except user/role management and system settings',
    is_system: 0,
    permissions: without(ALL_PERMISSIONS, [
      'users.view', 'users.create', 'users.update', 'users.delete',
      'roles.view', 'roles.create', 'roles.update', 'roles.delete',
      'settings.business', 'settings.locations', 'settings.tax_rates',
      'settings.payment_accounts', 'settings.invoice', 'settings.barcode'
    ])
  },
  {
    name: 'Cashier',
    description: 'Front counter staff: POS, sales, quotations, and customers',
    is_system: 0,
    permissions: [
      'dashboard.view',
      'customers.view', 'customers.create', 'customers.update',
      'products.view',
      'sales.view', 'sales.create',
      'pos.access',
      'quotations.view', 'quotations.create',
      'reports.sales'
    ]
  },
  {
    name: 'Stock Keeper',
    description: 'Warehouse staff: products, purchases, purchase returns, and stock adjustments',
    is_system: 0,
    permissions: [
      'dashboard.view',
      'suppliers.view', 'suppliers.create', 'suppliers.update',
      'products.view', 'products.create', 'products.update',
      'purchases.view', 'purchases.create', 'purchases.update',
      'purchase_return.view', 'purchase_return.create',
      'stock_adjustments.view', 'stock_adjustments.create',
      'reports.products', 'reports.purchases', 'reports.product_stock', 'reports.stock_adjustment'
    ]
  },
  {
    name: 'Salesperson',
    description: 'Sales team: sales entry, POS, quotations, customers - no deletes',
    is_system: 0,
    permissions: [
      'dashboard.view',
      'customers.view', 'customers.create', 'customers.update',
      'products.view',
      'sales.view', 'sales.create', 'sales.update',
      'pos.access',
      'quotations.view', 'quotations.create',
      'reports.sales', 'reports.customers'
    ]
  }
];

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('Running roles migration...');

    // 1. Roles table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        permissions JSON NOT NULL,
        is_system TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('  ✓ roles table ready');

    // 2. Extend users table
    const [cols] = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'`,
      [process.env.DB_NAME]
    );
    const existing = cols.map(c => c.COLUMN_NAME);

    if (!existing.includes('role_id')) {
      await connection.query('ALTER TABLE users ADD COLUMN role_id INT NULL, ADD CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL');
      console.log('  ✓ users.role_id added');
    } else {
      console.log('  - users.role_id exists');
    }

    if (!existing.includes('status')) {
      await connection.query("ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'Active'");
      console.log('  ✓ users.status added');
    } else {
      console.log('  - users.status exists');
    }

    if (!existing.includes('pin')) {
      await connection.query('ALTER TABLE users ADD COLUMN pin VARCHAR(10) NULL');
      console.log('  ✓ users.pin added');
    } else {
      console.log('  - users.pin exists');
    }

    // 3. Seed default roles (upsert by name)
    for (const role of DEFAULT_ROLES) {
      await connection.query(
        `INSERT INTO roles (name, description, permissions, is_system)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE description = VALUES(description), permissions = VALUES(permissions), is_system = VALUES(is_system)`,
        [role.name, role.description, JSON.stringify(role.permissions), role.is_system]
      );
    }
    console.log(`  ✓ seeded ${DEFAULT_ROLES.length} default roles`);

    // 4. Link existing users to Admin role if they don't have one
    const [adminRole] = await connection.query("SELECT id FROM roles WHERE name = 'Admin'");
    if (adminRole.length > 0) {
      await connection.query('UPDATE users SET role_id = ? WHERE role_id IS NULL', [adminRole[0].id]);
      console.log('  ✓ existing users linked to Admin role');
    }

    // Summary
    const [roleCount] = await connection.query('SELECT COUNT(*) as c FROM roles');
    const [userCount] = await connection.query('SELECT COUNT(*) as c FROM users');
    console.log(`\nMigration complete. Roles: ${roleCount[0].c}, Users: ${userCount[0].c}`);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exitCode = 1;
  } finally {
    await connection.end();
  }
}

migrate();
