-- Migration 058: Allow supplier category values used by the supplier form
-- ========================================================================
-- Supplier creation submits values such as 'domestic', 'international',
-- 'chemicals', and 'raw_material'. Some deployed databases still define the
-- category and supply_type columns as restrictive ENUMs, rejecting these with
-- "Data truncated" errors. Widening both to VARCHAR preserves existing text
-- while accepting the form's values. These ALTERs are safe to re-run.

ALTER TABLE suppliers
  MODIFY COLUMN category VARCHAR(50) NULL DEFAULT NULL;

ALTER TABLE suppliers
  MODIFY COLUMN supply_type VARCHAR(50) NULL DEFAULT NULL;