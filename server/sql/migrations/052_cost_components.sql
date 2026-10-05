-- Migration: Cost Components master
-- A "cost component" belongs to a group (group_master), has a name, a UOM
-- (uom master) and a cost per UOM. Used by General Cost and Machine Cost as the
-- source for their Cost Component dropdown.

CREATE TABLE IF NOT EXISTS cost_components (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(30)  NOT NULL,
  name          VARCHAR(150) NOT NULL,
  group_id      INT          NULL,
  uom_id        INT          NULL,
  cost_per_uom  DECIMAL(14,4) NOT NULL DEFAULT 0,
  description   TEXT         NULL,
  status        VARCHAR(20)  NOT NULL DEFAULT 'Active',
  created_by    INT          NULL,
  updated_by    INT          NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at    TIMESTAMP    NULL,
  UNIQUE KEY uq_cost_components_code (code),
  KEY idx_cost_components_group (group_id),
  KEY idx_cost_components_uom (uom_id),
  CONSTRAINT fk_cost_components_group FOREIGN KEY (group_id) REFERENCES group_master(id) ON DELETE SET NULL,
  CONSTRAINT fk_cost_components_uom FOREIGN KEY (uom_id) REFERENCES uom(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
