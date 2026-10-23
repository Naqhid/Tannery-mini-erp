-- Migration 067: Make stock_ledger the SINGLE SOURCE OF TRUTH for stock.
-- =============================================================================
-- Adds the value/opening columns the ledger needs so live stock, average rate
-- and daily opening→in→out→balance can all be derived from stock_ledger alone,
-- without the parallel warehouse_stock / material_transactions tables.
--
-- New columns (all additive, nullable/defaulted — safe & idempotent):
--   opening_qty    DECIMAL(14,3)  running balance BEFORE this row
--   opening_value  DECIMAL(16,2)  running value   BEFORE this row
--   in_value       DECIMAL(16,2)  value of inbound qty on this row
--   out_value      DECIMAL(16,2)  value of outbound qty on this row (avg-priced)
--   balance_value  DECIMAL(16,2)  running value AFTER this row
--
-- avg_rate for any row = balance_value / balance_qty (NULLIF-guarded).
-- The first ('Opening') row per (warehouse, material) carries the master's
-- opening_stock / opening_stock_value as opening_qty / opening_value.
-- Safe to re-run: each ADD COLUMN is guarded by information_schema.
-- =============================================================================
SET @db := DATABASE();

-- opening_qty
SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='stock_ledger' AND COLUMN_NAME='opening_qty');
SET @sql := IF(@c=0,
  "ALTER TABLE stock_ledger ADD COLUMN opening_qty DECIMAL(14,3) NOT NULL DEFAULT 0.000 AFTER expiry_date",
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- opening_value
SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='stock_ledger' AND COLUMN_NAME='opening_value');
SET @sql := IF(@c=0,
  "ALTER TABLE stock_ledger ADD COLUMN opening_value DECIMAL(16,2) NOT NULL DEFAULT 0.00 AFTER opening_qty",
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- in_value
SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='stock_ledger' AND COLUMN_NAME='in_value');
SET @sql := IF(@c=0,
  "ALTER TABLE stock_ledger ADD COLUMN in_value DECIMAL(16,2) NOT NULL DEFAULT 0.00 AFTER in_qty",
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- out_value
SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='stock_ledger' AND COLUMN_NAME='out_value');
SET @sql := IF(@c=0,
  "ALTER TABLE stock_ledger ADD COLUMN out_value DECIMAL(16,2) NOT NULL DEFAULT 0.00 AFTER out_qty",
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- balance_value
SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='stock_ledger' AND COLUMN_NAME='balance_value');
SET @sql := IF(@c=0,
  "ALTER TABLE stock_ledger ADD COLUMN balance_value DECIMAL(16,2) NOT NULL DEFAULT 0.00 AFTER balance_qty",
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Helpful composite index for "latest row per (warehouse, material)" lookups
-- and date-ordered rebuilds (item + date sort).
SET @c := (SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='stock_ledger' AND INDEX_NAME='idx_sl_wh_mat_date');
SET @sql := IF(@c=0,
  "CREATE INDEX idx_sl_wh_mat_date ON stock_ledger (warehouse_id, material_id, transaction_date, id)",
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
