-- BOM Enhancements: Add customer_id, change process_type to VARCHAR for new BOM types
ALTER TABLE boms ADD COLUMN customer_id INT NULL AFTER product_id;
ALTER TABLE boms ADD CONSTRAINT fk_boms_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;

-- Change process_type from ENUM to VARCHAR to support new BOM types
ALTER TABLE boms MODIFY COLUMN process_type VARCHAR(50) NULL DEFAULT 'Wet End Chemicals';
