-- 14 Sep 2026: Backfill products.name = leather_type + finish_type + color.
-- Product name is now composed server-side from the master records on every
-- create/update. This one-time backfill rebuilds the name for existing rows
-- that were saved before that logic (e.g. only "Sheep" instead of the full
-- "Sheep Softy Black"). Only rows that have at least one of the ids set and a
-- non-empty composed value are updated, so it is safe to re-run.

UPDATE products p
LEFT JOIN leather_types lt ON p.leather_type_id = lt.id
LEFT JOIN finish_types ft ON p.finish_type_id = ft.id
LEFT JOIN colors c ON p.color_id = c.id
SET p.name = TRIM(CONCAT_WS(' ', lt.name, ft.name, c.name))
WHERE (p.leather_type_id IS NOT NULL OR p.finish_type_id IS NOT NULL OR p.color_id IS NOT NULL)
  AND TRIM(CONCAT_WS(' ', lt.name, ft.name, c.name)) <> '';
