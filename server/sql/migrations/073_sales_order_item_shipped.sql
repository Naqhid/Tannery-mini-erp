-- Migration 073: Add shipped_qty and shipped_date to sales_order_items
-- =============================================================================
-- Shipped quantity and shipped date are now tracked per line item (in addition
-- to the order-level fields on sales_orders added in migration 071). This lets
-- each article row record how much of that line has shipped and when.
--
-- Both columns are nullable so existing rows are unaffected. MySQL 8.0 does not
-- support "ADD COLUMN IF NOT EXISTS", so each column is added conditionally via
-- information_schema so the migration is safe to re-run.
-- =============================================================================

SET @add_item_shipped_qty := (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE sales_order_items ADD COLUMN shipped_qty DECIMAL(14,3) NULL DEFAULT NULL AFTER quantity',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sales_order_items' AND COLUMN_NAME = 'shipped_qty'
);
PREPARE stmt1 FROM @add_item_shipped_qty;
EXECUTE stmt1;
DEALLOCATE PREPARE stmt1;

SET @add_item_shipped_date := (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE sales_order_items ADD COLUMN shipped_date DATE NULL DEFAULT NULL AFTER shipped_qty',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sales_order_items' AND COLUMN_NAME = 'shipped_date'
);
PREPARE stmt2 FROM @add_item_shipped_date;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;
