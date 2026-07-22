-- ============================================================
-- Migration 009: Add missing columns to supplier_pricing table
-- The model expects columns that don't exist in the original schema
-- Run this migration to add the required columns
-- ============================================================

-- Step 1: Modify the status column to support more values (VARCHAR instead of ENUM)
ALTER TABLE supplier_pricing
  MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'Pending';

-- Step 2: Add missing columns
-- Use separate ALTER statements so if a column already exists, only that statement fails

ALTER TABLE supplier_pricing ADD COLUMN item_group VARCHAR(100) NULL;
ALTER TABLE supplier_pricing ADD COLUMN supplier_part_no VARCHAR(100) NULL;
ALTER TABLE supplier_pricing ADD COLUMN unit_price DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE supplier_pricing ADD COLUMN currency VARCHAR(10) DEFAULT 'INR';
ALTER TABLE supplier_pricing ADD COLUMN min_order_qty DECIMAL(12,2) DEFAULT 0;
ALTER TABLE supplier_pricing ADD COLUMN price_type VARCHAR(50) DEFAULT 'Purchase Price';
ALTER TABLE supplier_pricing ADD COLUMN remarks TEXT NULL;
ALTER TABLE supplier_pricing ADD COLUMN approved_by INT NULL;
ALTER TABLE supplier_pricing ADD COLUMN approved_date DATE NULL;
ALTER TABLE supplier_pricing ADD COLUMN approval_notes TEXT NULL;
ALTER TABLE supplier_pricing ADD COLUMN last_approved_price DECIMAL(12,2) DEFAULT 0;
ALTER TABLE supplier_pricing ADD COLUMN last_approved_date DATE NULL;
ALTER TABLE supplier_pricing ADD COLUMN created_by INT NULL;
ALTER TABLE supplier_pricing ADD COLUMN updated_by INT NULL;
ALTER TABLE supplier_pricing ADD COLUMN deleted_at TIMESTAMP NULL;

-- Step 3: Copy existing 'price' values into 'unit_price' for existing rows
UPDATE supplier_pricing SET unit_price = price WHERE unit_price = 0 AND price > 0;
