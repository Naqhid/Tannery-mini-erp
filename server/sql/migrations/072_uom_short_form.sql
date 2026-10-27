-- Migration 072: Add short_form to uom master
-- =============================================================================
-- UOM Master now captures a Short Form (abbreviation, e.g. "Sq.Ft.", "Kg").
-- Nullable so existing rows are unaffected. MySQL 8.0 has no
-- "ADD COLUMN IF NOT EXISTS", so the add is guarded via information_schema and
-- is safe to re-run.
-- =============================================================================

SET @add_short_form := (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE uom ADD COLUMN short_form VARCHAR(20) NULL DEFAULT NULL AFTER name',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'uom' AND COLUMN_NAME = 'short_form'
);
PREPARE stmt1 FROM @add_short_form;
EXECUTE stmt1;
DEALLOCATE PREPARE stmt1;
