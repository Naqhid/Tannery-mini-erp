-- Migration 061: Link standard cost sheets to a production plan so that an
-- Approved standard cost can LOCK the linked general & machine cost entries
-- (no edit / no delete) for that order. Additive only.

ALTER TABLE standard_cost_sheets
  ADD COLUMN production_plan_id INT NULL AFTER bom_id;

CREATE INDEX idx_scs_production_plan ON standard_cost_sheets (production_plan_id);
