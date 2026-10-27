-- Migration 060: Add manufacture date & shelf life to material receipt items.
-- Expiry date already exists on material_receipt_items; it is now derived on the
-- client as manufacture_date + shelf_life_months (shown/stored in months).
-- This migration is additive only and does not alter existing logic.
--
-- Idempotent: safe to re-run. Each column is only added if it does not already
-- exist, so this won't error on a DB where it was partially/previously applied.

SET @db := DATABASE();

SET @has_mfg := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = @db
     AND TABLE_NAME = 'material_receipt_items'
     AND COLUMN_NAME = 'manufacture_date'
);
SET @sql := IF(@has_mfg = 0,
  'ALTER TABLE material_receipt_items ADD COLUMN manufacture_date DATE NULL AFTER expiry_date',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_shelf := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = @db
     AND TABLE_NAME = 'material_receipt_items'
     AND COLUMN_NAME = 'shelf_life_months'
);
SET @sql := IF(@has_shelf = 0,
  'ALTER TABLE material_receipt_items ADD COLUMN shelf_life_months INT NULL AFTER manufacture_date',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
