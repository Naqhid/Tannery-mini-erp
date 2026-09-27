-- Migration 054: Add total_qty and cost_per_uom to general_cost_items
-- =============================================================================
-- The General Cost form now captures a Total Quantity (user input) and a
-- Cost/UOM (fetched from the Cost Component master). Amount is derived as
-- total_qty * cost_per_uom, and cost/piece = amount / output qty.
-- These two inputs are persisted so an edited/reopened record recomputes
-- exactly the same amounts.
--
-- MySQL 8.0 does not support "ADD COLUMN IF NOT EXISTS", so each column is
-- added only when it does not already exist (checked via information_schema).
-- This keeps the migration safe to re-run.
-- =============================================================================

-- total_qty
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'general_cost_items'
    AND COLUMN_NAME = 'total_qty'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE general_cost_items ADD COLUMN total_qty DECIMAL(14,3) NOT NULL DEFAULT 0 AFTER uom',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- cost_per_uom
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'general_cost_items'
    AND COLUMN_NAME = 'cost_per_uom'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE general_cost_items ADD COLUMN cost_per_uom DECIMAL(14,4) NOT NULL DEFAULT 0 AFTER total_qty',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
