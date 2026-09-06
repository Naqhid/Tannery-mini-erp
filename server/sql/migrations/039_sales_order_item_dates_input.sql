-- 06 Sep 2026: Per-item Order Date, Delivery Date and Input Qty on sales order items.
-- Dates and an input quantity are now captured per line item rather than at the
-- order level. Each column is added only if it does not already exist so the
-- migration is safe to re-run.

-- input_qty
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'sales_order_items'
    AND COLUMN_NAME = 'input_qty'
);
SET @ddl := IF(@col_exists = 0,
  'ALTER TABLE sales_order_items ADD COLUMN input_qty DECIMAL(15,2) NOT NULL DEFAULT 0 AFTER quantity',
  'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- order_date
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'sales_order_items'
    AND COLUMN_NAME = 'order_date'
);
SET @ddl := IF(@col_exists = 0,
  'ALTER TABLE sales_order_items ADD COLUMN order_date DATE NULL AFTER input_qty',
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
