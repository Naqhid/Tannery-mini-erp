-- Migration 057: Add 'Physical Stock' to material_receipts.receipt_type ENUM
-- =============================================================================
-- The Material Receipt form now offers a "Physical Stock" receipt type, but the
-- receipt_type column is an ENUM that did not include that value, causing
-- "Data truncated for column 'receipt_type'" on save/post.
--
-- This ALTER adds 'Physical Stock' while preserving:
--   * all existing enum values (in the same order),
--   * NULL allowed (YES),
--   * DEFAULT 'Direct Purchase'.
-- Safe to re-run: applying the same ENUM definition again is a no-op.
-- =============================================================================

ALTER TABLE material_receipts
  MODIFY COLUMN receipt_type
    ENUM('Purchase Order','Direct Purchase','Transfer','Sample','Return','Physical Stock')
    NULL DEFAULT 'Direct Purchase';
