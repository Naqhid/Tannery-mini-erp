-- 06 Sep 2026: Add process_stage to material_issues
-- Material Issue can be tied to a specific production plan stage. The stage is
-- selected on the Add/Edit Material Issue page and must be persisted.
SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'material_issues'
    AND COLUMN_NAME = 'process_stage'
);

SET @ddl := IF(@col_exists = 0,
  'ALTER TABLE material_issues ADD COLUMN process_stage VARCHAR(100) NULL AFTER production_batch',
  'SELECT 1');

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
