-- ============================================================
-- Migration 003: Warehouse Bin/Rack Details & User Access
-- ============================================================

USE tannery_mini_erp;

-- ------------------------------------------------------------
-- 1. warehouse_bins (Bin / Rack locations within a warehouse)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS warehouse_bins (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  warehouse_id    INT           NOT NULL,
  bin_code        VARCHAR(30)   NOT NULL,
  bin_name        VARCHAR(100)  DEFAULT NULL,
  rack_no         VARCHAR(30)   DEFAULT NULL,
  shelf_no        VARCHAR(30)   DEFAULT NULL,
  capacity        DECIMAL(12,2) DEFAULT NULL,
  uom             VARCHAR(30)   DEFAULT NULL,
  status          ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_by      INT           DEFAULT NULL,
  created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_wb_warehouse FOREIGN KEY (warehouse_id)
    REFERENCES warehouses(id) ON DELETE CASCADE,
  UNIQUE KEY uk_wb_code (warehouse_id, bin_code),
  INDEX idx_wb_warehouse (warehouse_id),
  INDEX idx_wb_status (status)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 2. warehouse_user_access (User permissions per warehouse)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS warehouse_user_access (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  warehouse_id    INT           NOT NULL,
  user_name       VARCHAR(150)  NOT NULL,
  role            VARCHAR(100)  DEFAULT 'Store Keeper',
  access_level    ENUM('Full','View Only','Limited') DEFAULT 'Full',
  can_receive     TINYINT(1)    DEFAULT 1,
  can_issue       TINYINT(1)    DEFAULT 1,
  can_transfer    TINYINT(1)    DEFAULT 1,
  can_adjust      TINYINT(1)    DEFAULT 0,
  created_by      INT           DEFAULT NULL,
  created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_wua_warehouse FOREIGN KEY (warehouse_id)
    REFERENCES warehouses(id) ON DELETE CASCADE,
  INDEX idx_wua_warehouse (warehouse_id)
) ENGINE=InnoDB;
