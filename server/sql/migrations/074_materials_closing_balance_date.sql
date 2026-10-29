-- Migration 074: Add closing balance date tracking to materials table
-- =============================================================================
-- Purpose: Track when opening stock values were last updated from monthly batch
-- This allows filtering materials by their closing balance date
-- =============================================================================

SET @db := DATABASE();

-- Check if materials table exists
SET @c := (SELECT COUNT(*) FROM information_schema.TABLES 
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='materials');

-- Only proceed if materials table exists
SET @sql := IF(@c>0, 'SELECT 1', "SELECT 'materials table does not exist' AS warning");
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Add closing_balance_date column to track when opening stock was last updated
SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='materials' AND COLUMN_NAME='closing_balance_date');
SET @sql := IF(@c=0,
  'ALTER TABLE materials ADD COLUMN closing_balance_date DATE NULL DEFAULT NULL AFTER rate',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Add index for closing_balance_date
SET @c := (SELECT COUNT(*) FROM information_schema.STATISTICS 
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='materials' AND INDEX_NAME='idx_closing_date');
SET @sql := IF(@c=0,
  'CREATE INDEX idx_closing_date ON materials (closing_balance_date)',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Add closing_balance_financial_year for filtering by financial year
SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='materials' AND COLUMN_NAME='closing_balance_financial_year');
SET @sql := IF(@c=0,
  'ALTER TABLE materials ADD COLUMN closing_balance_financial_year VARCHAR(50) NULL DEFAULT NULL AFTER closing_balance_date',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Add index for financial year
SET @c := (SELECT COUNT(*) FROM information_schema.STATISTICS 
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='materials' AND INDEX_NAME='idx_closing_fy');
SET @sql := IF(@c=0,
  'CREATE INDEX idx_closing_fy ON materials (closing_balance_financial_year)',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Add last_updated_by to track who updated the closing balance
SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='materials' AND COLUMN_NAME='closing_balance_updated_by');
SET @sql := IF(@c=0,
  'ALTER TABLE materials ADD COLUMN closing_balance_updated_by INT NULL DEFAULT NULL AFTER closing_balance_financial_year',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Update existing materials with default values
UPDATE materials 
SET closing_balance_date = CURDATE(),
    closing_balance_financial_year = NULL,
    closing_balance_updated_by = NULL
WHERE closing_balance_date IS NULL;

-- Note: The materials table already has:
-- - opening_stock DECIMAL(14,3) - from migration 030
-- - opening_stock_value DECIMAL(18,2) - from migration 030
-- - rate DECIMAL(18,6) - from migration 030
-- These columns will be updated by the monthly batch process with values from stock_ledger
