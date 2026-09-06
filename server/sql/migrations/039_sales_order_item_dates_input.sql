-- 06 Sep 2026: Per-item Delivery Date on sales order items.
-- Delivery date is now captured per line item rather than at the order level.
-- The column is added only if it does not already exist so the migration is
-- safe to re-run.
-- (An earlier revision of this file also added order_date/input_qty; those are
--  no longer used and are removed by later migrations.)

-- delivery_date
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'sales_order_items'
    AND COLUMN_NAME = 'delivery_date'
);
SET @ddl := IF(@col_exists = 0,
  'ALTER TABLE sales_order_items ADD COLUMN delivery_date DATE NULL AFTER quantity',
  'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;
