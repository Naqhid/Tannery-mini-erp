# 🚀 Running Migrations - Complete Guide

## Overview

This guide explains how to run all the database migrations required for the **Monthly Batch Process** features locally.

---

## 📋 Required Migrations

You need to run these **4 migrations** in order:

| # | Migration | Purpose | File |
|---|----------|---------|------|
| 1 | 071 | Archive tables for all transaction data | `071_comprehensive_archive_tables.sql` |
| 2 | 072 | Batch process execution tracking | `072_batch_process_config.sql` |
| 3 | 073 | Sales order blocking for shipped orders | `073_sales_order_blocking.sql` |
| 4 | 074 | Materials table date filtering columns | `074_materials_closing_balance_date.sql` |

---

## ✅ Quick Start (3 Methods)

### Method 1: Using Batch File (Easiest)
```cmd
cd /e/Softwares/Tannery-mini-erp-demo
run_migrations.bat
```
Then enter your MySQL credentials when prompted.

### Method 2: Using PowerShell
```powershell
cd /e/Softwares/Tannery-mini-erp-demo
.\RUN_MIGRATIONS.ps1
```
Then enter your MySQL credentials when prompted.

### Method 3: Manual (One by One)
```cmd
cd /e/Softwares/Tannery-mini-erp-demo

mysql -u username -p database_name < server\sql\migrations\071_comprehensive_archive_tables.sql
mysql -u username -p database_name < server\sql\migrations\072_batch_process_config.sql
mysql -u username -p database_name < server\sql\migrations\073_sales_order_blocking.sql
mysql -u username -p database_name < server\sql\migrations\074_materials_closing_balance_date.sql
```

---

## 🔧 Step-by-Step Guide

### Step 1: Locate the Migration Files

All migration files are in:
```
/e/Softwares/Tannery-mini-erp-demo/server/sql/migrations/
```

You should see these files:
- ✅ 071_comprehensive_archive_tables.sql
- ✅ 072_batch_process_config.sql
- ✅ 073_sales_order_blocking.sql
- ✅ 074_materials_closing_balance_date.sql

### Step 2: Prepare Your Database

Make sure:
- MySQL server is running
- Your database exists
- Your user has privileges to create tables and alter columns

```sql
-- Check if database exists
SHOW DATABASES;

-- Create if it doesn't exist
CREATE DATABASE your_database_name;

-- Check user privileges
SHOW GRANTS FOR 'your_username'@'%';
```

### Step 3: Run the Migrations

#### Using the Batch File (Recommended):

1. Open **Command Prompt as Administrator**
2. Run:
   ```cmd
   cd /e/Softwares/Tannery-mini-erp-demo
   run_migrations.bat
   ```
3. Enter when prompted:
   - MySQL username (e.g., `root`)
   - Database name (e.g., `tannery_erp`)
   - MySQL password

#### Using PowerShell:

1. Open **PowerShell as Administrator**
2. Run:
   ```powershell
   cd /e/Softwares/Tannery-mini-erp-demo
   .\RUN_MIGRATIONS.ps1
   ```
3. Enter when prompted:
   - MySQL username
   - Database name
   - MySQL password

### Step 4: Verify Migrations

After running, verify everything is set up correctly:

#### Check Archive Tables:
```sql
SHOW TABLES LIKE '%archive%';
```
**Expected Output:**
```
+----------------------------------+
| Tables_in_your_database (%archive%) |
+----------------------------------+
| material_issue_items_archive     |
| material_issues_archive          |
| material_receipt_items_archive   |
| material_receipts_archive        |
| outbound_delivery_items_archive |
| outbound_deliveries_archive      |
| physical_stock_items_archive     |
| physical_stock_entries_archive   |
| stock_closing_balance             |
| stock_ledger_archive              |
| stock_transfer_items_archive     |
| stock_transfers_archive           |
+----------------------------------+
```

#### Check Materials Table:
```sql
DESCRIBE materials;
```
**Look for these new columns:**
- `closing_balance_date`
- `closing_balance_financial_year`
- `closing_balance_updated_by`

#### Check Sales Orders Table:
```sql
DESCRIBE sales_orders;
```
**Look for these new columns:**
- `is_blocked`
- `blocked_reason`
- `blocked_at`

#### Check Batch Process Config:
```sql
SELECT * FROM batch_process_config;
```
**Expected Output:**
```
+---------------------+--------------+---------------------+------------+
| config_key          | config_value | last_updated        | updated_by |
+---------------------+--------------+---------------------+------------+
| last_execution_date | NULL         | 2024-10-29 10:00:00 | NULL       |
| last_execution_month| NULL         | 2024-10-29 10:00:00 | NULL       |
| lock_execution      | 0            | 2024-10-29 10:00:00 | NULL       |
+---------------------+--------------+---------------------+------------+
```

---

## ⚠️ Important Notes

### Order Matters!
⚠️ **ALWAYS run migrations in this order:**
1. `071_comprehensive_archive_tables.sql`
2. `072_batch_process_config.sql`
3. `073_sales_order_blocking.sql`
4. `074_materials_closing_balance_date.sql`

### Idempotent Design
✅ All migrations are **idempotent** - they check if tables/columns exist before creating them. You can safely run them multiple times.

### No Data Loss
✅ Running migrations **will not delete or modify** your existing data. They only create new tables and add new columns.

### Archive Tables Are Empty Initially
✅ The archive tables are created as empty copies. Data is moved to them when you run the Monthly Batch Process.

---

## 🎯 After Running Migrations

### 1. Restart Your Application
```cmd
# If using nodemon
ctl+c then npm start

# Or just restart
npm restart
```

### 2. Test the Monthly Batch Process

1. Log in to your application
2. Navigate to: **Inventory → Monthly Batch Process**
3. Select a previous month (e.g., September 2024)
4. Click **Execute**
5. Verify all 5 steps complete successfully:
   - ✅ Calculating the average rates
   - ✅ Archiving transactions
   - ✅ Archiving closing balance
   - ✅ Updating material master
   - ✅ Creating opening stocks

### 3. Test Blocking Features

#### Test Sale Order Blocking:
1. Create a sale order
2. Mark it as **Shipped** or **Delivered**
3. Try to create a delivery note for it
4. **Expected**: Should see error "Cannot create transaction... This order has been shipped and is blocked"

#### Test Production Completion Blocking:
1. Create a production plan with planned_qty = 100
2. Create production status orders for all stages
3. Create daily production transactions for Measurement stage with output_qty >= 100
4. Try to create a new material issue or daily production transaction
5. **Expected**: Should see error "This order is completed"

---

## 🛠️ Troubleshooting

### "MySQL client not found"
**Solution**: Install MySQL and add it to your PATH, or use the full path to mysql.exe

### "Access denied for user"
**Solution**: 
- Verify your username and password
- Grant privileges:
  ```sql
  GRANT ALL PRIVILEGES ON database_name.* TO 'username'@'%';
  FLUSH PRIVILEGES;
  ```

### "Database does not exist"
**Solution**: Create the database first:
```sql
CREATE DATABASE your_database_name;
```

### "Table already exists"
**Solution**: This is normal - the migration checks if tables exist. You can safely ignore this.

### Migration hangs or takes too long
**Solution**: The migrations are quick (just creating empty tables). If it hangs, check your MySQL connection.

---

## 📖 Additional Documentation

- **Complete Implementation Summary**: See `IMPLEMENTATION_COMPLETE_SUMMARY.md`
- **Migration Details**: See `MIGRATIONS_README.md`
- **Feature List**: All requested features are implemented and documented

---

## ✨ Success!

Once all migrations run successfully:
- ✅ Archive tables created
- ✅ Batch process tracking enabled
- ✅ Sale order blocking active
- ✅ Production completion blocking active
- ✅ Materials table has date filtering

Your **Monthly Batch Process** is now fully functional! 🎉
