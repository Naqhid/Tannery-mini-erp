-- Persistent BOM revision history and component-level revision fields.
CREATE TABLE IF NOT EXISTS bom_versions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bom_id INT NOT NULL,
  version_no INT NOT NULL DEFAULT 1,
  revision_no INT NOT NULL DEFAULT 1,
  status VARCHAR(20) NOT NULL DEFAULT 'Active',
  effective_from DATE NULL,
  effective_to DATE NULL,
  change_reason VARCHAR(500) NULL,
  snapshot JSON NOT NULL,
  created_by INT NULL,
  released_by INT NULL,
  released_on DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_bom_version_revision (bom_id, version_no, revision_no),
  KEY idx_bom_versions_bom_id (bom_id),
  CONSTRAINT fk_bom_versions_bom FOREIGN KEY (bom_id) REFERENCES boms(id) ON DELETE CASCADE
);

SET @has_scrap_percent = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'bom_items' AND column_name = 'scrap_percent');
SET @sql = IF(@has_scrap_percent = 0, 'ALTER TABLE bom_items ADD COLUMN scrap_percent DECIMAL(10,2) NOT NULL DEFAULT 0', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Give BOMs created before this migration an initial auditable revision.
INSERT INTO bom_versions (bom_id, version_no, revision_no, status, effective_from, effective_to, change_reason, snapshot, created_by, released_by, released_on)
SELECT b.id, COALESCE(b.version, 1), 1, b.status, b.valid_from, b.valid_to, 'Initial migration snapshot',
  JSON_OBJECT(
    'bom', JSON_OBJECT('id', b.id, 'code', b.code, 'name', b.name, 'status', b.status, 'version', b.version),
    'items', JSON_ARRAY()
  ),
  b.created_by, b.created_by, COALESCE(b.created_at, NOW())
FROM boms b
LEFT JOIN bom_versions bv ON bv.bom_id = b.id
WHERE bv.id IS NULL;

SET @has_effective_from = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'bom_items' AND column_name = 'effective_from');
SET @sql = IF(@has_effective_from = 0, 'ALTER TABLE bom_items ADD COLUMN effective_from DATE NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_effective_to = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'bom_items' AND column_name = 'effective_to');
SET @sql = IF(@has_effective_to = 0, 'ALTER TABLE bom_items ADD COLUMN effective_to DATE NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
