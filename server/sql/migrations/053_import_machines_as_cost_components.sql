-- Migration 053: Import Machines into Cost Components
-- =============================================================================
-- Goal (per request):
--   * Every DISTINCT machines.machine_type becomes a Group (group_master),
--     shown in the "Group" column of the Cost Component page.
--   * Every machine becomes a Cost Component (cost_components) row where:
--        machines.name        -> cost_components.name        (Cost Component)
--        machines.machine_type-> cost_components.group_id     (Group)
--        machines.uom_type    -> cost_components.uom_id       (UOM)
--        machines.rate_indian -> cost_components.cost_per_uom (Cost / UOM)
--        machines.status      -> cost_components.status       (Status)
--
-- Notes:
--   * Only NON-archived machines (deleted_at IS NULL) are imported.
--   * UOM is matched against the uom master by name OR code (case-insensitive);
--     if no match is found, uom_id is left NULL rather than failing.
--   * Machine-type groups are attached to the "Cost Component" product category
--     when it exists, otherwise the first available category, otherwise NULL.
--   * Idempotent: groups are matched by name, cost components by name; existing
--     rows are UPDATED instead of duplicated, so re-running is safe.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Create a Group (group_master) for each distinct machine_type.
--    category_id defaults to the "Cost Component" product category.
-- -----------------------------------------------------------------------------
INSERT INTO group_master (code, name, category_id, hsn_code, gst_rate, description, status, created_at, updated_at)
SELECT
  CONCAT('GRP-M', LPAD(mt.rn, 4, '0'))                         AS code,
  mt.machine_type                                             AS name,
  (SELECT id FROM product_categories
     WHERE name = 'Cost Component' AND deleted_at IS NULL
     ORDER BY id LIMIT 1)                                     AS category_id,
  ''                                                          AS hsn_code,
  0                                                           AS gst_rate,
  'Auto-created from machine type (migration 053)'            AS description,
  'Active'                                                    AS status,
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (
  SELECT
    machine_type,
    ROW_NUMBER() OVER (ORDER BY machine_type) + 900 AS rn
  FROM machines
  WHERE deleted_at IS NULL
    AND machine_type IS NOT NULL
    AND TRIM(machine_type) <> ''
  GROUP BY machine_type
) mt
WHERE NOT EXISTS (
  SELECT 1 FROM group_master g
  WHERE g.name = mt.machine_type AND g.deleted_at IS NULL
);

-- Make sure any pre-existing machine-type group has a category assigned
-- (respecting the "category is mandatory" rule) when it currently has none.
UPDATE group_master g
JOIN (
  SELECT DISTINCT machine_type FROM machines
  WHERE deleted_at IS NULL AND machine_type IS NOT NULL AND TRIM(machine_type) <> ''
) mt ON mt.machine_type = g.name
SET g.category_id = (
  SELECT id FROM product_categories
  WHERE name = 'Cost Component' AND deleted_at IS NULL
  ORDER BY id LIMIT 1
)
WHERE g.deleted_at IS NULL
  AND g.category_id IS NULL;

-- -----------------------------------------------------------------------------
-- 2) Insert a Cost Component for each machine that isn't already present
--    (matched by name). New CC codes continue after the current maximum.
-- -----------------------------------------------------------------------------
SET @cc_base := (
  SELECT COALESCE(MAX(CAST(SUBSTRING(code, 4) AS UNSIGNED)), 0)
  FROM cost_components
  WHERE code REGEXP '^CC-[0-9]+$'
);
-- Guard against NULL so arithmetic below always yields an integer.
SET @cc_base := COALESCE(@cc_base, 0);

INSERT INTO cost_components (code, name, group_id, uom_id, cost_per_uom, description, status, created_at, updated_at)
SELECT
  CONCAT('CC-', LPAD(CAST(@cc_base + src.rn AS UNSIGNED), 5, '0')) AS code,
  src.name                                                   AS name,
  src.group_id                                               AS group_id,
  src.uom_id                                                 AS uom_id,
  src.cost_per_uom                                           AS cost_per_uom,
  'Imported from machine (migration 053)'                    AS description,
  src.status                                                 AS status,
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (
  SELECT
    m.name,
    (SELECT g.id FROM group_master g
       WHERE g.name = m.machine_type AND g.deleted_at IS NULL
       ORDER BY g.id LIMIT 1)                                AS group_id,
    (SELECT u.id FROM uom u
       WHERE u.deleted_at IS NULL
         AND (LOWER(u.name) = LOWER(m.uom_type) OR LOWER(u.code) = LOWER(m.uom_type))
       ORDER BY u.id LIMIT 1)                                AS uom_id,
    COALESCE(m.rate_indian, 0)                               AS cost_per_uom,
    COALESCE(m.status, 'Active')                             AS status,
    ROW_NUMBER() OVER (ORDER BY m.id)                        AS rn
  FROM machines m
  WHERE m.deleted_at IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM cost_components cc
      WHERE cc.name = m.name AND cc.deleted_at IS NULL
    )
) src;

-- -----------------------------------------------------------------------------
-- 3) Update existing cost components that share a machine name so their
--    group / uom / cost / status reflect the machine data. This keeps re-runs
--    consistent and refreshes any rows created before this migration.
-- -----------------------------------------------------------------------------
UPDATE cost_components cc
JOIN machines m
  ON m.name = cc.name AND m.deleted_at IS NULL
SET
  cc.group_id = (SELECT g.id FROM group_master g
                   WHERE g.name = m.machine_type AND g.deleted_at IS NULL
                   ORDER BY g.id LIMIT 1),
  cc.uom_id = (SELECT u.id FROM uom u
                 WHERE u.deleted_at IS NULL
                   AND (LOWER(u.name) = LOWER(m.uom_type) OR LOWER(u.code) = LOWER(m.uom_type))
                 ORDER BY u.id LIMIT 1),
  cc.cost_per_uom = COALESCE(m.rate_indian, 0),
  cc.status = COALESCE(m.status, 'Active'),
  cc.updated_at = CURRENT_TIMESTAMP
WHERE cc.deleted_at IS NULL
  AND cc.description = 'Imported from machine (migration 053)';
