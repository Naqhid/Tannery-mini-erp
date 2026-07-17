-- Add access_level column to roles table
ALTER TABLE roles ADD COLUMN access_level ENUM('read_write', 'read_only') NOT NULL DEFAULT 'read_write' AFTER permissions;

-- Set VIEWER role to read_only
UPDATE roles SET access_level = 'read_only' WHERE code = 'VIEWER';
