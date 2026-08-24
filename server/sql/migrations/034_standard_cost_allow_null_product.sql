-- Migration 034: Allow NULL product_id in standard_cost_sheets for production-plan-based cost sheets
ALTER TABLE standard_cost_sheets MODIFY COLUMN product_id INT NULL;
ALTER TABLE standard_cost_sheets MODIFY COLUMN bom_id INT NULL;

-- Add columns if not exist (safe for re-run)
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='standard_cost_sheets' AND COLUMN_NAME='production_plan_id');
SET @sql = IF(@col_exists=0, 'ALTER TABLE standard_cost_sheets ADD COLUMN production_plan_id INT NULL AFTER bom_id', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='standard_cost_sheets' AND COLUMN_NAME='effective_from');
SET @sql = IF(@col_exists=0, 'ALTER TABLE standard_cost_sheets ADD COLUMN effective_from DATE NULL AFTER production_plan_id', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='standard_cost_sheets' AND COLUMN_NAME='description');
SET @sql = IF(@col_exists=0, 'ALTER TABLE standard_cost_sheets ADD COLUMN description TEXT NULL AFTER effective_from', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='standard_cost_sheets' AND COLUMN_NAME='customer_name');
SET @sql = IF(@col_exists=0, 'ALTER TABLE standard_cost_sheets ADD COLUMN customer_name VARCHAR(200) NULL AFTER description', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='standard_cost_sheets' AND COLUMN_NAME='article');
SET @sql = IF(@col_exists=0, 'ALTER TABLE standard_cost_sheets ADD COLUMN article VARCHAR(200) NULL AFTER customer_name', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='standard_cost_sheets' AND COLUMN_NAME='color');
SET @sql = IF(@col_exists=0, 'ALTER TABLE standard_cost_sheets ADD COLUMN color VARCHAR(100) NULL AFTER article', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='standard_cost_sheets' AND COLUMN_NAME='order_no');
SET @sql = IF(@col_exists=0, 'ALTER TABLE standard_cost_sheets ADD COLUMN order_no VARCHAR(50) NULL AFTER color', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='standard_cost_sheets' AND COLUMN_NAME='order_qty');
SET @sql = IF(@col_exists=0, 'ALTER TABLE standard_cost_sheets ADD COLUMN order_qty DECIMAL(15,2) DEFAULT 0 AFTER order_no', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='standard_cost_sheets' AND COLUMN_NAME='completed_qty');
SET @sql = IF(@col_exists=0, 'ALTER TABLE standard_cost_sheets ADD COLUMN completed_qty DECIMAL(15,2) DEFAULT 0 AFTER order_qty', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='standard_cost_sheets' AND COLUMN_NAME='balance_qty');
SET @sql = IF(@col_exists=0, 'ALTER TABLE standard_cost_sheets ADD COLUMN balance_qty DECIMAL(15,2) DEFAULT 0 AFTER completed_qty', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
