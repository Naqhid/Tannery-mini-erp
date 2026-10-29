-- Migration 071: Create comprehensive duplicate archive tables for all transaction tables
-- =============================================================================
-- This migration creates duplicate archive tables for ALL transaction tables:
-- - stock_ledger_archive
-- - material_receipts_archive + material_receipt_items_archive
-- - material_issues_archive + material_issue_items_archive
-- - stock_transfers_archive + stock_transfer_items_archive
-- - outbound_deliveries_archive + outbound_delivery_items_archive
-- - physical_stock_entries_archive + physical_stock_items_archive
-- - stock_closing_balance (new table for closing balances)
--
-- The batch process will MOVE data from current tables to these archive tables
-- =============================================================================

SET @db := DATABASE();

-- Helper to check if table exists
SET @check_table = (SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = @db);

-- 1. stock_ledger_archive
SET @c := (SELECT COUNT(*) FROM information_schema.TABLES 
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='stock_ledger_archive');
SET @sql := IF(@c=0,
  'CREATE TABLE stock_ledger_archive LIKE stock_ledger',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Add archived_at - check if updated_at exists in source table
SET @has_updated_at := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='stock_ledger' AND COLUMN_NAME='updated_at');
SET @sql := IF(@has_updated_at>0,
  'ALTER TABLE stock_ledger_archive ADD COLUMN archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER updated_at',
  'ALTER TABLE stock_ledger_archive ADD COLUMN archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Add financial_year - check if archived_at exists
SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='stock_ledger_archive' AND COLUMN_NAME='financial_year');
SET @sql := IF(@c=0,
  'ALTER TABLE stock_ledger_archive ADD COLUMN financial_year VARCHAR(20) AFTER archived_at',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- 2. material_receipts_archive
SET @c := (SELECT COUNT(*) FROM information_schema.TABLES 
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='material_receipts_archive');
SET @sql := IF(@c=0,
  'CREATE TABLE material_receipts_archive LIKE material_receipts',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Check if updated_at exists in source table
SET @has_updated_at := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='material_receipts' AND COLUMN_NAME='updated_at');
SET @sql := IF(@has_updated_at>0,
  'ALTER TABLE material_receipts_archive ADD COLUMN archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER updated_at',
  'ALTER TABLE material_receipts_archive ADD COLUMN archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='material_receipts_archive' AND COLUMN_NAME='financial_year');
SET @sql := IF(@c=0,
  'ALTER TABLE material_receipts_archive ADD COLUMN financial_year VARCHAR(20) AFTER archived_at',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- 2b. material_receipt_items_archive
SET @c := (SELECT COUNT(*) FROM information_schema.TABLES 
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='material_receipt_items_archive');
SET @sql := IF(@c=0,
  'CREATE TABLE material_receipt_items_archive LIKE material_receipt_items',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Check if updated_at exists in source table
SET @has_updated_at := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='material_receipt_items' AND COLUMN_NAME='updated_at');
SET @sql := IF(@has_updated_at>0,
  'ALTER TABLE material_receipt_items_archive ADD COLUMN archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER updated_at',
  'ALTER TABLE material_receipt_items_archive ADD COLUMN archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='material_receipt_items_archive' AND COLUMN_NAME='original_id');
SET @sql := IF(@c=0,
  'ALTER TABLE material_receipt_items_archive ADD COLUMN original_id INT AFTER archived_at',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- 3. material_issues_archive
SET @c := (SELECT COUNT(*) FROM information_schema.TABLES 
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='material_issues_archive');
SET @sql := IF(@c=0,
  'CREATE TABLE material_issues_archive LIKE material_issues',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Check if updated_at exists in source table
SET @has_updated_at := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='material_issues' AND COLUMN_NAME='updated_at');
SET @sql := IF(@has_updated_at>0,
  'ALTER TABLE material_issues_archive ADD COLUMN archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER updated_at',
  'ALTER TABLE material_issues_archive ADD COLUMN archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='material_issues_archive' AND COLUMN_NAME='financial_year');
SET @sql := IF(@c=0,
  'ALTER TABLE material_issues_archive ADD COLUMN financial_year VARCHAR(20) AFTER archived_at',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- 3b. material_issue_items_archive
SET @c := (SELECT COUNT(*) FROM information_schema.TABLES 
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='material_issue_items_archive');
SET @sql := IF(@c=0,
  'CREATE TABLE material_issue_items_archive LIKE material_issue_items',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Check if updated_at exists in source table
SET @has_updated_at := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='material_issue_items' AND COLUMN_NAME='updated_at');
SET @sql := IF(@has_updated_at>0,
  'ALTER TABLE material_issue_items_archive ADD COLUMN archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER updated_at',
  'ALTER TABLE material_issue_items_archive ADD COLUMN archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='material_issue_items_archive' AND COLUMN_NAME='original_id');
SET @sql := IF(@c=0,
  'ALTER TABLE material_issue_items_archive ADD COLUMN original_id INT AFTER archived_at',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- 4. stock_transfers_archive
SET @c := (SELECT COUNT(*) FROM information_schema.TABLES 
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='stock_transfers_archive');
SET @sql := IF(@c=0,
  'CREATE TABLE stock_transfers_archive LIKE stock_transfers',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Check if updated_at exists in source table
SET @has_updated_at := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='stock_transfers' AND COLUMN_NAME='updated_at');
SET @sql := IF(@has_updated_at>0,
  'ALTER TABLE stock_transfers_archive ADD COLUMN archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER updated_at',
  'ALTER TABLE stock_transfers_archive ADD COLUMN archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='stock_transfers_archive' AND COLUMN_NAME='financial_year');
SET @sql := IF(@c=0,
  'ALTER TABLE stock_transfers_archive ADD COLUMN financial_year VARCHAR(20) AFTER archived_at',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- 4b. stock_transfer_items_archive
SET @c := (SELECT COUNT(*) FROM information_schema.TABLES 
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='stock_transfer_items_archive');
SET @sql := IF(@c=0,
  'CREATE TABLE stock_transfer_items_archive LIKE stock_transfer_items',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Check if updated_at exists in source table
SET @has_updated_at := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='stock_transfer_items' AND COLUMN_NAME='updated_at');
SET @sql := IF(@has_updated_at>0,
  'ALTER TABLE stock_transfer_items_archive ADD COLUMN archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER updated_at',
  'ALTER TABLE stock_transfer_items_archive ADD COLUMN archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='stock_transfer_items_archive' AND COLUMN_NAME='original_id');
SET @sql := IF(@c=0,
  'ALTER TABLE stock_transfer_items_archive ADD COLUMN original_id INT AFTER archived_at',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- 5. outbound_deliveries_archive
SET @c := (SELECT COUNT(*) FROM information_schema.TABLES 
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='outbound_deliveries_archive');
SET @sql := IF(@c=0,
  'CREATE TABLE outbound_deliveries_archive LIKE outbound_deliveries',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Check if updated_at exists in source table
SET @has_updated_at := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='outbound_deliveries' AND COLUMN_NAME='updated_at');
SET @sql := IF(@has_updated_at>0,
  'ALTER TABLE outbound_deliveries_archive ADD COLUMN archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER updated_at',
  'ALTER TABLE outbound_deliveries_archive ADD COLUMN archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='outbound_deliveries_archive' AND COLUMN_NAME='financial_year');
SET @sql := IF(@c=0,
  'ALTER TABLE outbound_deliveries_archive ADD COLUMN financial_year VARCHAR(20) AFTER archived_at',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- 5b. outbound_delivery_items_archive
SET @c := (SELECT COUNT(*) FROM information_schema.TABLES 
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='outbound_delivery_items_archive');
SET @sql := IF(@c=0,
  'CREATE TABLE outbound_delivery_items_archive LIKE outbound_delivery_items',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Check if updated_at exists in source table
SET @has_updated_at := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='outbound_delivery_items' AND COLUMN_NAME='updated_at');
SET @sql := IF(@has_updated_at>0,
  'ALTER TABLE outbound_delivery_items_archive ADD COLUMN archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER updated_at',
  'ALTER TABLE outbound_delivery_items_archive ADD COLUMN archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='outbound_delivery_items_archive' AND COLUMN_NAME='original_id');
SET @sql := IF(@c=0,
  'ALTER TABLE outbound_delivery_items_archive ADD COLUMN original_id INT AFTER archived_at',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- 6. physical_stock_entries_archive
SET @c := (SELECT COUNT(*) FROM information_schema.TABLES 
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='physical_stock_entries_archive');
SET @sql := IF(@c=0,
  'CREATE TABLE physical_stock_entries_archive LIKE physical_stock_entries',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Check if updated_at exists in source table
SET @has_updated_at := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='physical_stock_entries' AND COLUMN_NAME='updated_at');
SET @sql := IF(@has_updated_at>0,
  'ALTER TABLE physical_stock_entries_archive ADD COLUMN archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER updated_at',
  'ALTER TABLE physical_stock_entries_archive ADD COLUMN archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='physical_stock_entries_archive' AND COLUMN_NAME='financial_year');
SET @sql := IF(@c=0,
  'ALTER TABLE physical_stock_entries_archive ADD COLUMN financial_year VARCHAR(20) AFTER archived_at',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- 6b. physical_stock_items_archive (note: actual table is physical_stock_entry_items)
SET @c := (SELECT COUNT(*) FROM information_schema.TABLES 
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='physical_stock_items_archive');
SET @sql := IF(@c=0,
  'CREATE TABLE physical_stock_items_archive LIKE physical_stock_entry_items',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Check if updated_at exists in source table
SET @has_updated_at := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='physical_stock_entry_items' AND COLUMN_NAME='updated_at');
SET @sql := IF(@has_updated_at>0,
  'ALTER TABLE physical_stock_items_archive ADD COLUMN archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER updated_at',
  'ALTER TABLE physical_stock_items_archive ADD COLUMN archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='physical_stock_items_archive' AND COLUMN_NAME='original_id');
SET @sql := IF(@c=0,
  'ALTER TABLE physical_stock_items_archive ADD COLUMN original_id INT AFTER archived_at',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- 7. stock_closing_balance (new table)
SET @c := (SELECT COUNT(*) FROM information_schema.TABLES 
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='stock_closing_balance');
SET @sql := IF(@c=0,
  "CREATE TABLE IF NOT EXISTS stock_closing_balance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    warehouse_id INT NOT NULL,
    material_id INT NOT NULL,
    closing_date DATE NOT NULL,
    financial_year VARCHAR(50),
    closing_qty DECIMAL(14,3) NOT NULL DEFAULT 0,
    closing_value DECIMAL(16,2) NOT NULL DEFAULT 0,
    avg_unit_cost DECIMAL(12,4) NOT NULL DEFAULT 0,
    uom VARCHAR(20),
    reference_type VARCHAR(50) DEFAULT 'monthly_batch',
    reference_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_wm_date (warehouse_id, material_id, closing_date),
    INDEX idx_date (closing_date),
    INDEX idx_reference (reference_type, reference_id)
  )",
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Add foreign key constraints (optional - uncomment if needed)
-- ALTER TABLE stock_closing_balance ADD CONSTRAINT fk_closing_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE;
-- ALTER TABLE stock_closing_balance ADD CONSTRAINT fk_closing_material FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE;
