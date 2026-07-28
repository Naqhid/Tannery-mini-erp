-- Tax Master table
CREATE TABLE IF NOT EXISTS tax_master (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  tax_category ENUM('Goods', 'Services', 'Stationary') NOT NULL DEFAULT 'Goods',
  hsn_code_id INT NULL,
  description VARCHAR(255) NULL,
  gst_percent DECIMAL(5,2) NOT NULL DEFAULT 18.00,
  cess_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  effective_from DATE NULL,
  status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  is_deleted TINYINT(1) NOT NULL DEFAULT 0,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_by INT NULL,
  updated_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hsn_code_id) REFERENCES hsn_codes(id) ON DELETE SET NULL
);

-- Seed some default tax entries
INSERT INTO tax_master (code, name, tax_category, gst_percent, cess_percent, description, status) VALUES
('TAX-001', 'GST 18%', 'Goods', 18.00, 0.00, 'Standard GST for goods', 'Active'),
('TAX-002', 'GST 12%', 'Goods', 12.00, 0.00, 'Reduced GST for goods', 'Active'),
('TAX-003', 'GST 5%', 'Goods', 5.00, 0.00, 'Low GST for essential goods', 'Active'),
('TAX-004', 'GST 28%', 'Goods', 28.00, 0.00, 'Luxury goods GST', 'Active'),
('TAX-005', 'GST 18% Services', 'Services', 18.00, 0.00, 'Standard GST for services', 'Active');
