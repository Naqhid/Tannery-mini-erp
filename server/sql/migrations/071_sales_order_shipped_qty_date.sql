-- Migration 071: Add shipped_qty and shipped_date to sales_orders
-- =============================================================================
-- The Sales Order detail screen now captures a Shipped Quantity (prefilled from
-- the Packing-stage production output, but editable) and a Shipped Date. These
-- are persisted on the sales_orders header and surfaced on the Sales Orders
-- list page.
--
-- Both columns are nullable so existing orders are unaffected. MySQL 8.0 does
-- not support "ADD COLUMN IF NOT EXISTS", so each column is added conditionally
-- via information_schema so the migration is safe to re-run.
-- =============================================================================

SET @add_shipped_qty := (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE sales_orders ADD COLUMN shipped_qty DECIMAL(14,3) NULL DEFAULT NULL AFTER status',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sales_orders' AND COLUMN_NAME = 'shipped_qty'
);
PREPARE stmt1 FROM @add_shipped_qty;
EXECUTE stmt1;
DEALLOCATE PREPARE stmt1;

SET @add_shipped_date := (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE sales_orders ADD COLUMN shipped_date DATE NULL DEFAULT NULL AFTER shipped_qty',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sales_orders' AND COLUMN_NAME = 'shipped_date'
);
PREPARE stmt2 FROM @add_shipped_date;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;
