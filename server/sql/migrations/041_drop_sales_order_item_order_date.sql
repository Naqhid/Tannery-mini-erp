-- 06 Sep 2026: Remove the per-item order_date column from sales order items.
-- order_date was briefly introduced per line item but is no longer needed
-- (order date remains at the sales order header level). Dropped only if it
-- exists so the migration is safe on databases that never had the column.
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'sales_order_items'
    AND COLUMN_NAME = 'order_date'
);
SET @ddl := IF(@col_exists = 1,
  'ALTER TABLE sales_order_items DROP COLUMN order_date',
  'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;
