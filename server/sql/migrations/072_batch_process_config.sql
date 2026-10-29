-- Migration 072: Create batch process config table for tracking execution
-- =============================================================================
-- This table stores configuration for the monthly batch process including:
-- - last_execution_date: When the batch process was last run
-- - last_execution_month: Which month was last processed
-- - lock_execution: Flag to prevent re-execution for the same period
-- =============================================================================

SET @db := DATABASE();

-- Check if table exists
SET @c := (SELECT COUNT(*) FROM information_schema.TABLES 
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='batch_process_config');

SET @sql := IF(@c=0,
  "CREATE TABLE batch_process_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT DEFAULT NULL,
    INDEX idx_key (config_key)
  )",
  'SELECT 1');

PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Insert default values if table was just created
SET @c := (SELECT COUNT(*) FROM batch_process_config WHERE config_key = 'last_execution_date');
SET @sql := IF(@c=0,
  "INSERT INTO batch_process_config (config_key, config_value) VALUES 
     ('last_execution_date', NULL),
     ('last_execution_month', NULL),
     ('lock_execution', '0')",
  'SELECT 1');

PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
