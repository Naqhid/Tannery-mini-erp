-- Migration 073: Add blocking for shipped sale orders
-- =============================================================================
-- Prevents creating new transactions for sale orders that have been shipped
-- Adds is_blocked flag and triggers to automatically block shipped orders
-- =============================================================================

SET @db := DATABASE();

-- Check if sales_orders table exists
SET @c := (SELECT COUNT(*) FROM information_schema.TABLES 
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='sales_orders');

-- Only proceed if sales_orders table exists
SET @sql := IF(@c>0,
  "SELECT 1",
  "SELECT 'sales_orders table does not exist' AS warning");
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Add is_blocked column if it doesn't exist
SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='sales_orders' AND COLUMN_NAME='is_blocked');
SET @sql := IF(@c=0,
  "ALTER TABLE sales_orders ADD COLUMN is_blocked TINYINT(1) DEFAULT 0 AFTER status",
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Add blocked_reason column if it doesn't exist
SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='sales_orders' AND COLUMN_NAME='blocked_reason');
SET @sql := IF(@c=0,
  "ALTER TABLE sales_orders ADD COLUMN blocked_reason VARCHAR(255) DEFAULT NULL AFTER is_blocked",
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Add blocked_at column if it doesn't exist
SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='sales_orders' AND COLUMN_NAME='blocked_at');
SET @sql := IF(@c=0,
  "ALTER TABLE sales_orders ADD COLUMN blocked_at TIMESTAMP NULL DEFAULT NULL AFTER blocked_reason",
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Add index for is_blocked
SET @c := (SELECT COUNT(*) FROM information_schema.STATISTICS 
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='sales_orders' AND INDEX_NAME='idx_so_blocked');
SET @sql := IF(@c=0,
  "CREATE INDEX idx_so_blocked ON sales_orders (is_blocked, status)",
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Update existing shipped/delivered orders to be blocked
-- This ensures backward compatibility: any order that's already shipped is automatically blocked
UPDATE sales_orders 
SET is_blocked = 1, 
    blocked_reason = CONCAT('Automatically blocked: Status is ', status),
    blocked_at = CASE WHEN shipped_date IS NOT NULL THEN shipped_date ELSE updated_at END
WHERE status IN ('Shipped', 'Delivered') 
  AND is_blocked = 0;

-- Create trigger to automatically block orders when they are marked as Shipped or Delivered
DELIMITER //
CREATE TRIGGER after_sales_order_shipped 
AFTER UPDATE ON sales_orders 
FOR EACH ROW 
BEGIN 
    IF NEW.status IN ('Shipped', 'Delivered') AND OLD.status NOT IN ('Shipped', 'Delivered') THEN
        UPDATE sales_orders 
        SET is_blocked = 1, 
            blocked_reason = CONCAT('Automatically blocked: Status changed to ', NEW.status),
            blocked_at = NOW()
        WHERE id = NEW.id;
    END IF;
END//
DELIMITER ;

-- Add note: To check if a sale order is blocked, use:
-- SELECT id, order_no, status, is_blocked, blocked_reason, blocked_at FROM sales_orders WHERE is_blocked = 1;
