-- Rate Master table - centralized rate management for all components
CREATE TABLE IF NOT EXISTS rate_master (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  rate_type ENUM('Machine', 'Labour', 'Chemical', 'Overhead', 'Process', 'Other') NOT NULL DEFAULT 'Machine',
  component_ref_id INT NULL COMMENT 'Reference to machine/material/process id',
  uom VARCHAR(50) NULL COMMENT 'Per Hour, Per Pcs, Per Kg, Per Ltr, etc.',
  rate_indian DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  rate_imported DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  effective_from DATE NULL,
  effective_to DATE NULL,
  description VARCHAR(255) NULL,
  status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  is_deleted TINYINT(1) NOT NULL DEFAULT 0,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_by INT NULL,
  updated_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed some sample rate entries
INSERT INTO rate_master (code, name, rate_type, uom, rate_indian, rate_imported, description, status) VALUES
('RATE-00001', 'Spray Machine Rate', 'Machine', 'Per Hour', 150.00, 250.00, 'Spray machine operating rate', 'Active'),
('RATE-00002', 'Dryer Machine Rate', 'Machine', 'Per Hour', 120.00, 200.00, 'Dryer machine operating rate', 'Active'),
('RATE-00003', 'Skilled Labour Rate', 'Labour', 'Per Hour', 80.00, 80.00, 'Skilled labour hourly rate', 'Active'),
('RATE-00004', 'Chrome Tanning Process', 'Process', 'Per Pcs', 25.00, 40.00, 'Chrome tanning process rate', 'Active');
