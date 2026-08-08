-- Migration: Add 'posted' status to recipes and material_issues tables

-- Add 'posted' to recipes status column
ALTER TABLE recipes MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active';

-- Add 'posted' to material_issues status column (if it's ENUM)
ALTER TABLE material_issues MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'Draft';
