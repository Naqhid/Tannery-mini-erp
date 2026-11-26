-- RM warehouse pick lists: party type (Customer / Supplier / Production) and address
SET @db := DATABASE();

SET @c := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='rmw_pick_lists' AND COLUMN_NAME='party_type');
SET @sql := IF(@c=0,
  'ALTER TABLE rmw_pick_lists ADD COLUMN party_type VARCHAR(20) NULL AFTER customer_name',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @c := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='rmw_pick_lists' AND COLUMN_NAME='address');
SET @sql := IF(@c=0,
  'ALTER TABLE rmw_pick_lists ADD COLUMN address TEXT NULL AFTER party_type',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
