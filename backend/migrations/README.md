# Database Migrations

Migrations are applied in filename order. Each file captures a versioned schema/data change.

| File | Description |
|---|---|
| `001_capture_live_schema.sql` | Full current schema of `bms3_db` (all 12 tables incl. roles + user role columns) |
| `002_seed_default_roles.sql` | Default roles (Admin, Manager, Cashier, Stock Keeper, Salesperson) with their permission sets |
| `run-migrations.js` | Hashes any plain-text user passwords with bcrypt (idempotent, safe to re-run) |

## Applying migrations to a fresh database

```bash
# 1. Create the database
mysql -u root -p -e "CREATE DATABASE bms3_db;"

# 2. Apply migrations in order
mysql -u root -p bms3_db < migrations/001_capture_live_schema.sql
mysql -u root -p bms3_db < migrations/002_seed_default_roles.sql

# 3. Seed sample data (products/customers/suppliers) if desired
mysql -u root -p bms3_db < database.sql

# 4. Create an admin user, then hash all passwords
node migrations/run-migrations.js
```

> NOTE: older copies of `database.sql` at the repo root predate the roles system.
> The `migrations/` folder is the authoritative schema source — use it for new setups.
