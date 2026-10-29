-- Migration 070: Create tables for monthly batch process
-- =============================================================================
-- Creates stock_ledger_archive and stock_closing_balance tables for monthly
-- batch process functionality.
-- =============================================================================

SET @db := DATABASE();

-- stock_ledger_archive table for archiving historical transactions
SET @c := (SELECT COUNT(*) FROM information_schema.TABLES 
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='stock_ledger_archive');
SET @sql := IF(@c=0,
  'CREATE TABLE stock_ledger_archive LIKE stock_ledger',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Add archived_at column if it doesn't exist
SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='stock_ledger_archive' AND COLUMN_NAME='archived_at');
SET @sql := IF(@c=0,
  "ALTER TABLE stock_ledger_archive ADD COLUMN archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER updated_at",
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Add archived column to stock_ledger if it doesn't exist
SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='stock_ledger' AND COLUMN_NAME='archived');
SET @sql := IF(@c=0,
  "ALTER TABLE stock_ledger ADD COLUMN archived TINYINT(1) DEFAULT 0 AFTER updated_at",
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- stock_closing_balance table for storing monthly closing balances
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

-- Add foreign key constraints (optional, comment out if tables don't exist yet)
-- SET @sql2 := IF(@c=0,
--   'ALTER TABLE stock_closing_balance 
--    ADD CONSTRAINT fk_closing_balance_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
--    ADD CONSTRAINT fk_closing_balance_material FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE',
--   'SELECT 1');
-- PREPARE s2 FROM @sql2; EXECUTE s2; DEALLOCATE PREPARE s2;
