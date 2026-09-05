-- Fix: Re-apply FK change from production_plans → production_status_orders
-- for general_cost_headers and machine_cost_headers (migration 027 was not applied on prod)

ALTER TABLE general_cost_headers DROP FOREIGN KEY IF EXISTS fk_gch_plan;
ALTER TABLE general_cost_headers DROP FOREIGN KEY IF EXISTS fk_gch_ps_order;
ALTER TABLE general_cost_headers
  ADD CONSTRAINT fk_gch_ps_order FOREIGN KEY (production_plan_id) REFERENCES production_status_orders(id);

ALTER TABLE machine_cost_headers DROP FOREIGN KEY IF EXISTS fk_mch_plan;
ALTER TABLE machine_cost_headers DROP FOREIGN KEY IF EXISTS fk_mch_ps_order;
ALTER TABLE machine_cost_headers
  ADD CONSTRAINT fk_mch_ps_order FOREIGN KEY (production_plan_id) REFERENCES production_status_orders(id);
