-- Migration 063: Add soft-delete support to material_issues.
-- =============================================================================
-- Material issues were previously hard-deleted. To align with the app-wide
-- soft-delete policy (records are flagged via deleted_at, never physically
-- removed), add a nullable deleted_at timestamp. List/stats/report queries
-- filter on `deleted_at IS NULL`, and the delete endpoint now stamps this
-- column instead of running DELETE.
--
-- MySQL 8.0 has no "ADD COLUMN IF NOT EXISTS", so the column is added only
-- when missing (checked via information_schema). Safe to re-run.
-- =============================================================================
SET @db := DATABASE();

SET @has_col := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = @db
     AND TABLE_NAME = 'material_issues'
     AND COLUMN_NAME = 'deleted_at'
);
SET @sql := IF(@has_col = 0,
  'ALTER TABLE material_issues ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Index to keep the "active rows" filter fast.
SET @has_idx := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
   WHERE TABLE_SCHEMA = @db
     AND TABLE_NAME = 'material_issues'
     AND INDEX_NAME = 'idx_mi_deleted_at'
);
SET @sql := IF(@has_idx = 0,
  'CREATE INDEX idx_mi_deleted_at ON material_issues (deleted_at)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
