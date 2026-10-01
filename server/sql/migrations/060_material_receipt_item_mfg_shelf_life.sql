-- Migration 060: Add manufacture date & shelf life to material receipt items.
-- Expiry date already exists on material_receipt_items; it is now derived on the
-- client as manufacture_date + shelf_life_months (shown/stored in months).
-- This migration is additive only and does not alter existing logic.

ALTER TABLE material_receipt_items
  ADD COLUMN manufacture_date DATE NULL AFTER expiry_date,
  ADD COLUMN shelf_life_months INT NULL AFTER manufacture_date;
