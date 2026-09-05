-- Fix: Re-apply FK change from production_plans → production_status_orders
-- for general_cost_headers and machine_cost_headers (migration 027 was not applied on prod)
-- Compatible with MySQL 8.0 (no IF EXISTS on DROP FOREIGN KEY)

-- general_cost_headers: drop old FK (ignore error if already gone), add new one
ALTER TABLE general_cost_headers DROP FOREIGN KEY fk_gch_plan;
ALTER TABLE general_cost_headers
  ADD CONSTRAINT fk_gch_ps_order FOREIGN KEY (production_plan_id) REFERENCES production_status_orders(id);

-- machine_cost_headers: drop old FK (ignore error if already gone), add new one
ALTER TABLE machine_cost_headers DROP FOREIGN KEY fk_mch_plan;
ALTER TABLE machine_cost_headers
  ADD CONSTRAINT fk_mch_ps_order FOREIGN KEY (production_plan_id) REFERENCES production_status_orders(id);
