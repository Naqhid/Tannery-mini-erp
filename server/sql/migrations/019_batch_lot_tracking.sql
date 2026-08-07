-- Migration: Ensure batches and batch_line_items tables exist with proper schema for Batch/Lot Tracking

-- Create batches table if not exists
CREATE TABLE IF NOT EXISTS batches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  batch_no VARCHAR(50) NOT NULL UNIQUE,
  production_plan_id INT DEFAULT NULL,
  sales_order_id INT DEFAULT NULL,
  customer_id INT DEFAULT NULL,
  order_no VARCHAR(50) DEFAULT NULL,
  article_code VARCHAR(50) DEFAULT NULL,
  article_name VARCHAR(255) DEFAULT NULL,
  production_date DATE DEFAULT NULL,
  stage VARCHAR(50) DEFAULT 'Tanning',
  current_stage VARCHAR(50) DEFAULT 'Tanning',
  total_receipt_qty DECIMAL(12,2) DEFAULT 0.00,
  total_output_qty DECIMAL(12,2) DEFAULT 0.00,
  yield_percent DECIMAL(6,2) DEFAULT 0.00,
  status ENUM('Draft','In-Process','Completed','On-Hold','Cancelled') DEFAULT 'Draft',
  remarks TEXT DEFAULT NULL,
  created_by INT DEFAULT NULL,
  updated_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_batch_no (batch_no),
  INDEX idx_production_date (production_date),
  INDEX idx_stage (stage),
  INDEX idx_current_stage (current_stage),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create batch_line_items table if not exists
CREATE TABLE IF NOT EXISTS batch_line_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  batch_id INT NOT NULL,
  seq INT DEFAULT 1,
  customer_name VARCHAR(255) DEFAULT NULL,
  order_no VARCHAR(50) DEFAULT NULL,
  article_code VARCHAR(50) DEFAULT NULL,
  article_name VARCHAR(255) DEFAULT NULL,
  finish VARCHAR(100) DEFAULT NULL,
  color VARCHAR(100) DEFAULT NULL,
  receipt_qty DECIMAL(12,2) DEFAULT 0.00,
  uom VARCHAR(20) DEFAULT 'SQ.FT.',
  output_qty DECIMAL(12,2) DEFAULT 0.00,
  output_uom VARCHAR(20) DEFAULT 'SQ.FT.',
  status VARCHAR(50) DEFAULT 'Pending',
  remarks TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_batch_id (batch_id),
  CONSTRAINT fk_batch_line_items_batch FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample batch data for testing (only if no data exists)
INSERT INTO batches (batch_no, production_date, stage, current_stage, total_receipt_qty, total_output_qty, yield_percent, status)
SELECT 'BTCH-240520-0012', '2024-05-20', 'Tanning', 'Tanning', 2450.00, 2320.00, 94.69, 'In-Process'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM batches WHERE batch_no = 'BTCH-240520-0012');

-- Insert sample line items (only if the batch exists and has no items)
INSERT INTO batch_line_items (batch_id, seq, customer_name, order_no, article_code, article_name, finish, color, receipt_qty, uom, output_qty, output_uom, status)
SELECT b.id, 1, 'Leather World Co.', 'SO-2024-0015', 'LTH-1001', 'Cow Leather', 'Full Chrome', 'Black', 800.00, 'SQ.FT.', 760.00, 'SQ.FT.', 'Completed'
FROM batches b
WHERE b.batch_no = 'BTCH-240520-0012'
AND NOT EXISTS (SELECT 1 FROM batch_line_items WHERE batch_id = b.id);

INSERT INTO batch_line_items (batch_id, seq, customer_name, order_no, article_code, article_name, finish, color, receipt_qty, uom, output_qty, output_uom, status)
SELECT b.id, 2, 'Global Leathers Ltd.', 'SO-2024-0018', 'LTH-1002', 'Buffalo Leather', 'Semi Chrome', 'Brown', 600.00, 'SQ.FT.', 570.00, 'SQ.FT.', 'Completed'
FROM batches b
WHERE b.batch_no = 'BTCH-240520-0012'
AND (SELECT COUNT(*) FROM batch_line_items WHERE batch_id = b.id) < 2;

INSERT INTO batch_line_items (batch_id, seq, customer_name, order_no, article_code, article_name, finish, color, receipt_qty, uom, output_qty, output_uom, status)
SELECT b.id, 3, 'Premium Shoes Pvt. Ltd.', 'SO-2024-0021', 'LTH-1003', 'Sheep Leather', 'Vegetable', 'Tan', 400.00, 'SQ.FT.', 380.00, 'SQ.FT.', 'Completed'
FROM batches b
WHERE b.batch_no = 'BTCH-240520-0012'
AND (SELECT COUNT(*) FROM batch_line_items WHERE batch_id = b.id) < 3;

INSERT INTO batch_line_items (batch_id, seq, customer_name, order_no, article_code, article_name, finish, color, receipt_qty, uom, output_qty, output_uom, status)
SELECT b.id, 4, 'Fashion Footwear Inc.', 'SO-2024-0023', 'LTH-1004', 'Goat Leather', 'Full Chrome', 'Navy Blue', 350.00, 'SQ.FT.', 330.00, 'SQ.FT.', 'In-Process'
FROM batches b
WHERE b.batch_no = 'BTCH-240520-0012'
AND (SELECT COUNT(*) FROM batch_line_items WHERE batch_id = b.id) < 4;

INSERT INTO batch_line_items (batch_id, seq, customer_name, order_no, article_code, article_name, finish, color, receipt_qty, uom, output_qty, output_uom, status)
SELECT b.id, 5, 'Elite Exports', 'SO-2024-0025', 'LTH-1005', 'Cow Leather', 'Pull Up', 'Dark Brown', 300.00, 'SQ.FT.', 280.00, 'SQ.FT.', 'In-Process'
FROM batches b
WHERE b.batch_no = 'BTCH-240520-0012'
AND (SELECT COUNT(*) FROM batch_line_items WHERE batch_id = b.id) < 5;
