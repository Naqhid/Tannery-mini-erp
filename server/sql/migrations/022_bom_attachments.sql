-- Migration: Add bom_attachments table for BOM file uploads

CREATE TABLE IF NOT EXISTS bom_attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bom_id INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(100) DEFAULT NULL,
  file_size INT DEFAULT 0,
  uploaded_by INT DEFAULT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_bom_attachments_bom FOREIGN KEY (bom_id) REFERENCES boms(id) ON DELETE CASCADE
);
