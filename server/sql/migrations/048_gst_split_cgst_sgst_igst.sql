-- 048: GST split support (intra-state CGST/SGST vs inter-state IGST)
-- Sales Orders: add cgst/sgst/igst amount columns (tax_percent + tax_amount already exist).
-- Material Receipts: add igst_amount (cgst/sgst/total_gst already exist).

ALTER TABLE sales_orders
  ADD COLUMN cgst_amount DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER tax_amount,
  ADD COLUMN sgst_amount DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER cgst_amount,
  ADD COLUMN igst_amount DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER sgst_amount,
  ADD COLUMN tax_type VARCHAR(10) NOT NULL DEFAULT 'IGST' AFTER igst_amount;

ALTER TABLE material_receipts
  ADD COLUMN igst_amount DECIMAL(14,4) NOT NULL DEFAULT 0 AFTER sgst_amount,
  ADD COLUMN tax_type VARCHAR(10) NOT NULL DEFAULT 'IGST' AFTER total_gst_amount;
