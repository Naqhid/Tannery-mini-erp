-- Add customer_id to products table
ALTER TABLE products ADD COLUMN customer_id INT NULL AFTER standard_size_id;
ALTER TABLE products ADD CONSTRAINT fk_products_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;
