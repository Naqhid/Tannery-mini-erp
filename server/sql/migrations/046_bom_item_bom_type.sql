-- 046_bom_item_bom_type.sql
-- Move "BOM Type" (Wet End / Finishing / Packing) from the BOM header to each
-- BOM Product line, so a single BOM can mix materials of different BOM types.
-- The header column boms.process_type is retained for backward compatibility.
--
-- MySQL 8.0 does not support "ADD COLUMN IF NOT EXISTS", so we add the column
-- conditionally via a prepared statement guarded by information_schema.

SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'bom_items'
    AND COLUMN_NAME = 'bom_type'
);

SET @ddl = IF(@col_exists = 0,
  'ALTER TABLE bom_items ADD COLUMN bom_type VARCHAR(50) NULL AFTER type',
  'SELECT 1');

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Backfill existing line items from their parent BOM's header process_type so
-- current data keeps a sensible value.
UPDATE bom_items bi
JOIN boms b ON bi.bom_id = b.id
SET bi.bom_type = b.process_type
WHERE bi.bom_type IS NULL OR bi.bom_type = '';
