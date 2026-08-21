-- Migration: Link General Cost and Machine Cost to production_status_orders instead of production_plans
-- This changes the data source for costing modules to use the Production Status page data

-- 1. Drop existing foreign keys
ALTER TABLE general_cost_headers DROP FOREIGN KEY IF EXISTS fk_gch_plan;
ALTER TABLE machine_cost_headers DROP FOREIGN KEY IF EXISTS fk_mch_plan;

-- 2. Add new foreign keys pointing to production_status_orders
ALTER TABLE general_cost_headers
  ADD CONSTRAINT fk_gch_ps_order FOREIGN KEY (production_plan_id) REFERENCES production_status_orders(id);

ALTER TABLE machine_cost_headers
  ADD CONSTRAINT fk_mch_ps_order FOREIGN KEY (production_plan_id) REFERENCES production_status_orders(id);
