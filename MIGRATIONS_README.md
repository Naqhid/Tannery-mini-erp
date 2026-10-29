# Running Migrations for Monthly Batch Process

## Quick Start

To run all required migrations for the Monthly Batch Process, follow these steps:

---

## Method 1: Using Batch File (Recommended for Windows)

1. **Open Command Prompt as Administrator**
2. **Navigate to project directory**:
   ```cmd
   cd /e/Softwares/Tannery-mini-erp-demo
   ```
3. **Run the batch file**:
   ```cmd
   run_migrations.bat
   ```
4. **Enter your database credentials** when prompted:
   - MySQL username (default: root)
   - Database name (required)
   - MySQL password

---

## Method 2: Using PowerShell

1. **Open PowerShell as Administrator**
2. **Navigate to project directory**:
   ```powershell
   cd /e/Softwares/Tannery-mini-erp-demo
   ```
3. **Run the PowerShell script**:
   ```powershell
   .\run_migrations.ps1
   ```
4. **Enter your database credentials** when prompted

---

## Method 3: Manual Migration Execution

Run each migration file individually in order:

```cmd
cd /e/Softwares/Tannery-mini-erp-demo

REM Run migration 071 - Archive tables
mysql -u your_username -p your_database < server\sql\migrations\071_comprehensive_archive_tables.sql

REM Run migration 072 - Batch process config
mysql -u your_username -p your_database < server\sql\migrations\072_batch_process_config.sql

REM Run migration 073 - Sales order blocking
mysql -u your_username -p your_database < server\sql\migrations\073_sales_order_blocking.sql

REM Run migration 074 - Materials closing balance date
mysql -u your_username -p your_database < server\sql\migrations\074_materials_closing_balance_date.sql
```

---

## Migration Order (IMPORTANT)

**MUST run migrations in this exact order:**

1. **071_comprehensive_archive_tables.sql** - Creates all archive tables
2. **072_batch_process_config.sql** - Creates execution tracking table
3. **073_sales_order_blocking.sql** - Adds blocking columns to sales_orders
4. **074_materials_closing_balance_date.sql** - Adds date columns to materials

---

## What Each Migration Does

### Migration 071: Comprehensive Archive Tables
- Creates 12 archive tables:
  - stock_ledger_archive
  - material_receipts_archive + material_receipt_items_archive
  - material_issues_archive + material_issue_items_archive
  - stock_transfers_archive + stock_transfer_items_archive
  - outbound_deliveries_archive + outbound_delivery_items_archive
  - physical_stock_entries_archive + physical_stock_items_archive
  - stock_closing_balance (new table)
- Adds tracking columns: `archived_at`, `financial_year`, `original_id`

### Migration 072: Batch Process Config
- Creates `batch_process_config` table
- Tracks last execution date
- Prevents duplicate execution
- Initializes with default values

### Migration 073: Sales Order Blocking
- Adds columns to `sales_orders` table:
  - `is_blocked` - Flag to indicate if order is blocked
  - `blocked_reason` - Reason for blocking
  - `blocked_at` - Timestamp of blocking
- Adds index `idx_so_blocked` for performance
- Creates trigger to auto-block when status = 'Shipped' or 'Delivered'
- Updates existing shipped/delivered orders to be blocked

### Migration 074: Materials Closing Balance Date
- Adds columns to `materials` table:
  - `closing_balance_date` - When opening stock was last updated
  - `closing_balance_financial_year` - Financial year of balance
  - `closing_balance_updated_by` - User who updated
- Adds indexes for performance
- Updates existing materials with default values

---

## Verification After Running Migrations

After running the migrations, verify they were successful:

### 1. Check Archive Tables Exist
```sql
SHOW TABLES LIKE '%archive%';
```

### 2. Check New Columns in Materials Table
```sql
DESCRIBE materials;
-- Should see: closing_balance_date, closing_balance_financial_year, closing_balance_updated_by
```

### 3. Check Sales Orders Table
```sql
DESCRIBE sales_orders;
-- Should see: is_blocked, blocked_reason, blocked_at
```

### 4. Check Batch Process Config Table
```sql
SHOW TABLES LIKE 'batch_process_config';
-- Should return: batch_process_config
```

---

## Troubleshooting

### Error: "MySQL client not found"
**Solution**: Ensure MySQL is installed and added to your system PATH.

### Error: "Access denied"
**Solution**: 
- Verify your MySQL username and password
- Ensure the user has privileges to create tables and alter columns
- Try running as root/admin

### Error: "Database not found"
**Solution**: Create the database first:
```sql
CREATE DATABASE your_database_name;
```

### Error: "Table already exists"
**Solution**: The migrations are idempotent - they check if tables/columns exist before creating. This is safe to ignore, or you can drop the existing tables first.

### Error: Migration file not found
**Solution**: Verify you're in the correct directory (`/e/Softwares/Tannery-mini-erp-demo`) and the migration files exist in `server/sql/migrations/`.

---

## Post-Migration Steps

After running the migrations:

1. **Restart your application server** to ensure all new middleware and routes are loaded
2. **Test the Monthly Batch Process**:
   - Navigate to Inventory > Monthly Batch Process
   - Verify the page loads correctly
   - Test execution with a previous month's data
3. **Test blocking features**:
   - Mark a sale order as 'Shipped' and verify you cannot create new transactions
   - Complete a production plan and verify you cannot create new transactions

---

## Notes

- All migrations are **idempotent** - they can be run multiple times safely
- Migrations check if tables/columns exist before creating them
- Running migrations will **not** delete existing data
- The archive tables are created as empty copies - data is moved during batch process execution

---

## Need Help?

If you encounter any issues:
1. Check the error message carefully
2. Verify your MySQL connection and credentials
3. Check the migration file for syntax errors
4. Review the `MIGRATIONS_README.md` file for troubleshooting tips

For specific errors, please provide:
- The exact error message
- Which migration file failed
- Your MySQL version
- Your operating system
