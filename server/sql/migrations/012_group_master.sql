-- Group Master table (merges HSN functionality into group)
CREATE TABLE IF NOT EXISTS group_master (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  category_id INT NULL,
  hsn_code VARCHAR(20) NULL,
  gst_rate DECIMAL(5,2) NOT NULL DEFAULT 18.00,
  description VARCHAR(255) NULL,
  status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  is_deleted TINYINT(1) NOT NULL DEFAULT 0,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_by INT NULL,
  updated_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL
);

-- Add group_id to products table
ALTER TABLE products ADD COLUMN group_id INT NULL AFTER category_id;
ALTER TABLE products ADD CONSTRAINT fk_products_group FOREIGN KEY (group_id) REFERENCES group_master(id) ON DELETE SET NULL;

-- Add group_id to materials table
ALTER TABLE materials ADD COLUMN group_id INT NULL AFTER type;
ALTER TABLE materials ADD CONSTRAINT fk_materials_group FOREIGN KEY (group_id) REFERENCES group_master(id) ON DELETE SET NULL;

-- Add UOM and rate fields to machines table
ALTER TABLE machines ADD COLUMN uom_type ENUM('Per Hour', 'Per Pcs') NULL AFTER name;
ALTER TABLE machines ADD COLUMN rate_indian DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER uom_type;
ALTER TABLE machines ADD COLUMN rate_imported DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER rate_indian;

-- Seed some sample group entries
INSERT INTO group_master (code, name, category_id, hsn_code, gst_rate, description, status) VALUES
('GRP-00001', 'Finished Leather', NULL, '4107', 12.00, 'Finished leather group', 'Active'),
('GRP-00002', 'Tanning Chemicals', NULL, '3202', 18.00, 'Tanning chemicals group', 'Active'),
('GRP-00003', 'Dyes & Pigments', NULL, '3204', 18.00, 'Dyes and pigments group', 'Active');
