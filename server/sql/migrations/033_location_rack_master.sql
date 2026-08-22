-- Migration 033: Location/Rack Master table

CREATE TABLE IF NOT EXISTS location_racks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(30) NOT NULL,
  name VARCHAR(150) NOT NULL,
  warehouse_id INT NULL,
  description TEXT NULL,
  status ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT NULL,
  updated_by INT NULL,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  UNIQUE KEY uq_location_rack_code (code),
  KEY idx_location_rack_warehouse (warehouse_id),
  KEY idx_location_rack_deleted (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
