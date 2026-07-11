-- ============================================================
-- Migration 004: Audit columns, Soft Delete, Bulk Operations support
-- Compatible with MySQL 8.0+
-- Adds created_by, updated_by, deleted_at columns to all master tables
-- ============================================================

USE tannery_mini_erp;

-- Stored procedure to add columns/indexes only if they don't exist (idempotent)

DELIMITER //

DROP PROCEDURE IF EXISTS add_audit_columns//

CREATE PROCEDURE add_audit_columns(
  IN p_table VARCHAR(64),
  IN p_after_col VARCHAR(64),
  IN p_idx_name VARCHAR(64)
)
BEGIN
  -- Add created_by if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = p_table AND COLUMN_NAME = 'created_by'
  ) THEN
    SET @sql = CONCAT('ALTER TABLE `', p_table, '` ADD COLUMN created_by INT DEFAULT NULL AFTER `', p_after_col, '`');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;

  -- Add updated_by if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = p_table AND COLUMN_NAME = 'updated_by'
  ) THEN
    SET @sql = CONCAT('ALTER TABLE `', p_table, '` ADD COLUMN updated_by INT DEFAULT NULL AFTER created_by');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;

  -- Add deleted_at if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = p_table AND COLUMN_NAME = 'deleted_at'
  ) THEN
    SET @sql = CONCAT('ALTER TABLE `', p_table, '` ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL AFTER updated_by');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;

  -- Add index on deleted_at if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = p_table AND INDEX_NAME = p_idx_name
  ) THEN
    SET @sql = CONCAT('ALTER TABLE `', p_table, '` ADD INDEX `', p_idx_name, '` (deleted_at)');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END//

DELIMITER ;

-- Apply to all master tables
CALL add_audit_columns('product_categories', 'status', 'idx_pc_deleted');
CALL add_audit_columns('leather_types', 'status', 'idx_lt_deleted');
CALL add_audit_columns('uom', 'status', 'idx_uom_deleted');
CALL add_audit_columns('thickness', 'status', 'idx_th_deleted');
CALL add_audit_columns('standard_sizes', 'status', 'idx_ss_deleted');
CALL add_audit_columns('colors', 'status', 'idx_clr_deleted');
CALL add_audit_columns('finish_types', 'status', 'idx_ft_deleted');
CALL add_audit_columns('grades', 'status', 'idx_gr_deleted');
CALL add_audit_columns('hsn_codes', 'status', 'idx_hsn_deleted');
CALL add_audit_columns('process_stages', 'status', 'idx_ps_deleted');
CALL add_audit_columns('machines', 'status', 'idx_mac_deleted');
CALL add_audit_columns('roles', 'status', 'idx_role_deleted');
CALL add_audit_columns('companies', 'status', 'idx_comp_deleted');
CALL add_audit_columns('business_units', 'status', 'idx_bu_deleted');
CALL add_audit_columns('customers', 'notes', 'idx_cust_deleted');
CALL add_audit_columns('suppliers', 'notes', 'idx_sup_deleted');
CALL add_audit_columns('products', 'status', 'idx_prod_deleted');

-- materials: also needs status column added first
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'materials' AND COLUMN_NAME = 'status');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE materials ADD COLUMN status ENUM(''Active'',''Inactive'') NOT NULL DEFAULT ''Active'' AFTER type', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CALL add_audit_columns('materials', 'status', 'idx_mat_deleted');

-- Cleanup
DROP PROCEDURE IF EXISTS add_audit_columns;

SELECT 'Migration 004 completed successfully.' AS result;
