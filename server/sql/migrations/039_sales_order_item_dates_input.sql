-- 06 Sep 2026: Per-item Order Date and Delivery Date on sales order items.
-- Dates are now captured per line item rather than at the order level. Each
-- column is added only if it does not already exist so the migration is safe
-- to re-run.

-- order_date
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'sales_order_items'
    AND COLUMN_NAME = 'order_date'
);
SET @ddl := IF(@col_exists = 0,
  'ALTER TABLE sales_order_items ADD COLUMN order_date DATE NULL AFTER quantity',
  'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- delivery_date
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'sales_order_items'
    AND COLUMN_NAME = 'delivery_date'
);
SET @ddl := IF(@col_exists = 0,
  'ALTER TABLE sales_order_items ADD COLUMN delivery_date DATE NULL AFTER order_date',
  'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;
