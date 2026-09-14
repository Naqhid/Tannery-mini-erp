-- 14 Sep 2026: BOM cost & Variance for the Standard Cost Sheet (BOM).
-- The BOM cost sheet stores, alongside the actual cost, the BOM (standard) cost
-- and the variance (Actual - BOM) both at header and line level.
-- Columns are added only if missing so the migration is safe to re-run.

-- ---------- standard_cost_sheets (header totals) ----------

-- total_actual_cost
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'standard_cost_sheets'
    AND COLUMN_NAME = 'total_actual_cost'
);
SET @ddl := IF(@col_exists = 0,
  'ALTER TABLE standard_cost_sheets ADD COLUMN total_actual_cost DECIMAL(15,2) NOT NULL DEFAULT 0 AFTER total_bom_cost',
  'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- total_variance (total_actual_cost - total_bom_cost)
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'standard_cost_sheets'
    AND COLUMN_NAME = 'total_variance'
);
SET @ddl := IF(@col_exists = 0,
  'ALTER TABLE standard_cost_sheets ADD COLUMN total_variance DECIMAL(15,2) NOT NULL DEFAULT 0 AFTER total_actual_cost',
  'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---------- standard_cost_items (per line) ----------

-- actual_cost
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'standard_cost_items'
    AND COLUMN_NAME = 'actual_cost'
);
SET @ddl := IF(@col_exists = 0,
  'ALTER TABLE standard_cost_items ADD COLUMN actual_cost DECIMAL(15,2) NOT NULL DEFAULT 0 AFTER cost_value',
  'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- bom_cost
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'standard_cost_items'
    AND COLUMN_NAME = 'bom_cost'
);
SET @ddl := IF(@col_exists = 0,
  'ALTER TABLE standard_cost_items ADD COLUMN bom_cost DECIMAL(15,2) NOT NULL DEFAULT 0 AFTER actual_cost',
  'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- variance (actual_cost - bom_cost)
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'standard_cost_items'
    AND COLUMN_NAME = 'variance'
);
SET @ddl := IF(@col_exists = 0,
  'ALTER TABLE standard_cost_items ADD COLUMN variance DECIMAL(15,2) NOT NULL DEFAULT 0 AFTER bom_cost',
  'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;
