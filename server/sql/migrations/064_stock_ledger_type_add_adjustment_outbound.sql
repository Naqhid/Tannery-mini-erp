-- Migration 064: Extend stock_ledger.transaction_type enum.
-- =============================================================================
-- The application writes these transaction types to stock_ledger:
--   Opening, Receipt, Transfer In, Transfer Out, Issue, Outbound Delivery,
--   Stock Adjustment
-- The column enum was missing 'Outbound Delivery' and 'Stock Adjustment', so
-- those inserts failed (outbound deliveries never wrote a ledger row, and the
-- new physical-stock adjustment posting would error).
--
-- This widens the enum to cover every type the code uses. The legacy
-- 'Adjustment' value is kept for backward compatibility with existing rows.
-- Safe to re-run (idempotent: only alters when a needed value is absent).
-- =============================================================================
SET @db := DATABASE();

SET @needs_update := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = @db
     AND TABLE_NAME = 'stock_ledger'
     AND COLUMN_NAME = 'transaction_type'
     AND (COLUMN_TYPE NOT LIKE '%Stock Adjustment%'
          OR COLUMN_TYPE NOT LIKE '%Outbound Delivery%')
);

SET @sql := IF(@needs_update > 0,
  "ALTER TABLE stock_ledger MODIFY COLUMN transaction_type
     ENUM('Opening','Receipt','Transfer In','Transfer Out','Issue',
          'Outbound Delivery','Adjustment','Stock Adjustment') NOT NULL",
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
