-- 06 Sep 2026: Remove the per-item input_qty column from sales order items.
-- input_qty was briefly introduced in an earlier revision of migration 039 but
-- is no longer needed. This drops it only if it exists, so the migration is
-- safe on databases that never had the column.
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'sales_order_items'
    AND COLUMN_NAME = 'input_qty'
);
SET @ddl := IF(@col_exists = 1,
  'ALTER TABLE sales_order_items DROP COLUMN input_qty',
  'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;
