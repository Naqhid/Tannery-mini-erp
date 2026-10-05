-- Migration 055: Add total_qty and cost_per_uom to machine_cost_items
-- =============================================================================
-- The Machine Cost form now mirrors General Cost: it captures a Total Quantity
-- (user input) and a Cost/UOM (fetched from the Cost Component master, machine
-- groups only). Amount = total_qty * cost_per_uom and machine cost/piece =
-- amount / output qty. These two inputs are persisted for accurate re-open.
--
-- MySQL 8.0 has no "ADD COLUMN IF NOT EXISTS", so each column is added only
-- when missing (checked via information_schema). Safe to re-run.
-- =============================================================================

-- total_qty
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'machine_cost_items'
    AND COLUMN_NAME = 'total_qty'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE machine_cost_items ADD COLUMN total_qty DECIMAL(14,3) NOT NULL DEFAULT 0 AFTER uom',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- cost_per_uom
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'machine_cost_items'
    AND COLUMN_NAME = 'cost_per_uom'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE machine_cost_items ADD COLUMN cost_per_uom DECIMAL(14,4) NOT NULL DEFAULT 0 AFTER total_qty',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
