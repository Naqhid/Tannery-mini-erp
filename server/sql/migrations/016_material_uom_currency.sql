-- Migration: Add dual-UOM, currency support to materials and material receipts
-- Requirements: 10, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25

-- Add primary_uom_id and secondary_uom_id to materials table
ALTER TABLE materials ADD COLUMN primary_uom_id INT NULL AFTER uom;
ALTER TABLE materials ADD COLUMN secondary_uom_id INT NULL AFTER primary_uom_id;
ALTER TABLE materials ADD COLUMN currency VARCHAR(10) NOT NULL DEFAULT 'INR' AFTER secondary_uom_id;

ALTER TABLE materials ADD CONSTRAINT fk_materials_primary_uom FOREIGN KEY (primary_uom_id) REFERENCES uom(id) ON DELETE SET NULL;
ALTER TABLE materials ADD CONSTRAINT fk_materials_secondary_uom FOREIGN KEY (secondary_uom_id) REFERENCES uom(id) ON DELETE SET NULL;

-- Add new columns to material_receipt_items
ALTER TABLE material_receipt_items ADD COLUMN primary_uom VARCHAR(50) NULL AFTER uom;
ALTER TABLE material_receipt_items ADD COLUMN secondary_uom VARCHAR(50) NULL AFTER primary_uom;
ALTER TABLE material_receipt_items ADD COLUMN primary_uom_qty DECIMAL(12,4) NOT NULL DEFAULT 0 AFTER secondary_uom;
ALTER TABLE material_receipt_items ADD COLUMN secondary_uom_qty DECIMAL(12,4) NOT NULL DEFAULT 0 AFTER primary_uom_qty;
ALTER TABLE material_receipt_items ADD COLUMN currency VARCHAR(10) NOT NULL DEFAULT 'INR' AFTER secondary_uom_qty;
ALTER TABLE material_receipt_items ADD COLUMN exchange_rate DECIMAL(12,6) NOT NULL DEFAULT 1.000000 AFTER currency;
ALTER TABLE material_receipt_items ADD COLUMN rate_fc DECIMAL(12,4) NOT NULL DEFAULT 0 AFTER exchange_rate;
ALTER TABLE material_receipt_items ADD COLUMN rate_inr DECIMAL(12,4) NOT NULL DEFAULT 0 AFTER rate_fc;
ALTER TABLE material_receipt_items ADD COLUMN amount_fc DECIMAL(14,4) NOT NULL DEFAULT 0 AFTER rate_inr;
ALTER TABLE material_receipt_items ADD COLUMN amount_inr DECIMAL(14,4) NOT NULL DEFAULT 0 AFTER amount_fc;

-- Add GST and summary fields to material_receipts
ALTER TABLE material_receipts ADD COLUMN gst_percent DECIMAL(5,2) NOT NULL DEFAULT 0 AFTER other_charges;
ALTER TABLE material_receipts ADD COLUMN cgst_amount DECIMAL(14,4) NOT NULL DEFAULT 0 AFTER gst_percent;
ALTER TABLE material_receipts ADD COLUMN sgst_amount DECIMAL(14,4) NOT NULL DEFAULT 0 AFTER cgst_amount;
ALTER TABLE material_receipts ADD COLUMN total_gst_amount DECIMAL(14,4) NOT NULL DEFAULT 0 AFTER sgst_amount;
ALTER TABLE material_receipts ADD COLUMN total_other_charges DECIMAL(14,4) NOT NULL DEFAULT 0 AFTER total_gst_amount;
