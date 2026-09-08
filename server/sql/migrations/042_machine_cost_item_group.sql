-- 07 Sep 2026: Add Group to machine cost line items.
-- Machine cost lines now carry a Group (from group_master), mirroring the
-- Group column used in Standard Costing. Columns are added only if they do not
-- already exist so the migration is safe to re-run.

-- group_id
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'machine_cost_items'
    AND COLUMN_NAME = 'group_id'
);
SET @ddl := IF(@col_exists = 0,
  'ALTER TABLE machine_cost_items ADD COLUMN group_id INT NULL AFTER machine_name',
  'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- group_name (denormalized for display / export)
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'machine_cost_items'
    AND COLUMN_NAME = 'group_name'
);
SET @ddl := IF(@col_exists = 0,
  'ALTER TABLE machine_cost_items ADD COLUMN group_name VARCHAR(255) NULL AFTER group_id',
  'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;
