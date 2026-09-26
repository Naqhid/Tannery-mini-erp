-- Migration 053: Import Machines into Cost Components
-- =============================================================================
-- Goal (per request):
--   * Every DISTINCT machines.machine_type becomes a Group (group_master),
--     shown in the "Group" column of the Cost Component page.
--   * Every machine becomes a Cost Component (cost_components) row where:
--        machines.name        -> cost_components.name        (Cost Component)
--        machines.machine_type-> cost_components.group_id     (Group)
--        machines.uom_type    -> cost_components.uom_id       (UOM)  [existing UOM only]
--        machines.rate_indian -> cost_components.cost_per_uom (Cost / UOM)
--        machines.status      -> cost_components.status       (Status)
--
-- UOM policy (per request "in uom what we have same we need"):
--   * We DO NOT create new UOM rows. The machine's free-text uom_type
--     (e.g. "Per Pcs", "Per Hour", "Per Kg") is matched onto the EXISTING uom
--     master using a normalized lookup:
--        - exact match on uom.name or uom.code, else
--        - strip a leading "Per " and match the remainder, else
--        - a small synonym map (pcs/pc -> Piece, etc.).
--     If nothing matches (e.g. "Per Hour" with no Hour UOM), uom_id stays NULL.
--
-- Other notes:
--   * Only NON-archived machines (deleted_at IS NULL) are imported.
--   * Machine-type groups are attached to the "Cost Component" product category
--     when it exists, otherwise NULL.
--   * Idempotent: groups matched by name, cost components by name; existing rows
--     are UPDATED instead of duplicated, so re-running is safe.
--   * `machines` may use a different collation (utf8mb4_0900_ai_ci) than the
--     target tables (utf8mb4_unicode_ci). Cross-table string comparisons are
--     forced to utf8mb4_unicode_ci with COLLATE to avoid collation errors.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Create a Group (group_master) for each distinct machine_type.
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
  WHERE g.name = mt.machine_type COLLATE utf8mb4_unicode_ci
    AND g.deleted_at IS NULL
);

-- Ensure any pre-existing machine-type group has a category assigned.
UPDATE group_master g
JOIN (
  SELECT DISTINCT machine_type FROM machines
  WHERE deleted_at IS NULL AND machine_type IS NOT NULL AND TRIM(machine_type) <> ''
) mt ON g.name = mt.machine_type COLLATE utf8mb4_unicode_ci
SET g.category_id = (
  SELECT id FROM product_categories
  WHERE name = 'Cost Component' AND deleted_at IS NULL
  ORDER BY id LIMIT 1
)
WHERE g.deleted_at IS NULL
  AND g.category_id IS NULL;

-- -----------------------------------------------------------------------------
-- 2) Insert a Cost Component for each machine not already present (by name).
--    UOM is resolved to an EXISTING uom row only (no new UOMs are created).
-- -----------------------------------------------------------------------------
INSERT INTO cost_components (code, name, group_id, uom_id, cost_per_uom, description, status, created_at, updated_at)
SELECT
  CONCAT('CC-', LPAD(
    (SELECT COALESCE(MAX(CAST(SUBSTRING(cc2.code, 4) AS UNSIGNED)), 0)
       FROM cost_components cc2 WHERE cc2.code REGEXP '^CC-[0-9]+$') + src.rn,
    5, '0'))                                                 AS code,
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
       WHERE g.name = m.machine_type COLLATE utf8mb4_unicode_ci
         AND g.deleted_at IS NULL
       ORDER BY g.id LIMIT 1)                                AS group_id,
    (SELECT u.id FROM uom u
       WHERE u.deleted_at IS NULL
         AND (
           -- exact match on name/code
           LOWER(u.name) = LOWER(m.uom_type) COLLATE utf8mb4_unicode_ci
           OR LOWER(u.code) = LOWER(m.uom_type) COLLATE utf8mb4_unicode_ci
           -- match after stripping a leading "per "
           OR LOWER(u.name) = LOWER(TRIM(REPLACE(m.uom_type COLLATE utf8mb4_unicode_ci, 'Per ', '')))
           OR LOWER(u.code) = LOWER(TRIM(REPLACE(m.uom_type COLLATE utf8mb4_unicode_ci, 'Per ', '')))
           -- common synonyms -> Piece
           OR (LOWER(u.name) = 'piece'
               AND LOWER(TRIM(REPLACE(m.uom_type COLLATE utf8mb4_unicode_ci, 'Per ', ''))) IN ('pcs', 'pc', 'pcs.', 'pieces', 'piece'))
           -- Kg -> Kilogram
           OR (LOWER(u.name) = 'kilogram'
               AND LOWER(TRIM(REPLACE(m.uom_type COLLATE utf8mb4_unicode_ci, 'Per ', ''))) IN ('kg', 'kgs', 'kilo', 'kilogram'))
           -- Sqft -> Square Feet
           OR (LOWER(u.name) = 'square feet'
               AND LOWER(TRIM(REPLACE(m.uom_type COLLATE utf8mb4_unicode_ci, 'Per ', ''))) IN ('sqft', 'sq ft', 'sft', 'square feet'))
           -- Sqm -> Square Meter
           OR (LOWER(u.name) = 'square meter'
               AND LOWER(TRIM(REPLACE(m.uom_type COLLATE utf8mb4_unicode_ci, 'Per ', ''))) IN ('sqm', 'sq m', 'square meter', 'square metre'))
         )
       ORDER BY u.id LIMIT 1)                                AS uom_id,
    COALESCE(m.rate_indian, 0)                               AS cost_per_uom,
    COALESCE(m.status, 'Active')                             AS status,
    ROW_NUMBER() OVER (ORDER BY m.id)                        AS rn
  FROM machines m
  WHERE m.deleted_at IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM cost_components cc
      WHERE cc.name = m.name COLLATE utf8mb4_unicode_ci
        AND cc.deleted_at IS NULL
    )
) src;

-- -----------------------------------------------------------------------------
-- 3) Refresh existing imported cost components so group / uom / cost / status
--    stay in sync with the machine data on re-runs.
-- -----------------------------------------------------------------------------
UPDATE cost_components cc
JOIN machines m
  ON cc.name = m.name COLLATE utf8mb4_unicode_ci AND m.deleted_at IS NULL
SET
  cc.group_id = (SELECT g.id FROM group_master g
                   WHERE g.name = m.machine_type COLLATE utf8mb4_unicode_ci
                     AND g.deleted_at IS NULL
                   ORDER BY g.id LIMIT 1),
  cc.uom_id = (SELECT u.id FROM uom u
                 WHERE u.deleted_at IS NULL
                   AND (
                     LOWER(u.name) = LOWER(m.uom_type) COLLATE utf8mb4_unicode_ci
                     OR LOWER(u.code) = LOWER(m.uom_type) COLLATE utf8mb4_unicode_ci
                     OR LOWER(u.name) = LOWER(TRIM(REPLACE(m.uom_type COLLATE utf8mb4_unicode_ci, 'Per ', '')))
                     OR LOWER(u.code) = LOWER(TRIM(REPLACE(m.uom_type COLLATE utf8mb4_unicode_ci, 'Per ', '')))
                     OR (LOWER(u.name) = 'piece'
                         AND LOWER(TRIM(REPLACE(m.uom_type COLLATE utf8mb4_unicode_ci, 'Per ', ''))) IN ('pcs', 'pc', 'pcs.', 'pieces', 'piece'))
                     OR (LOWER(u.name) = 'kilogram'
                         AND LOWER(TRIM(REPLACE(m.uom_type COLLATE utf8mb4_unicode_ci, 'Per ', ''))) IN ('kg', 'kgs', 'kilo', 'kilogram'))
                     OR (LOWER(u.name) = 'square feet'
                         AND LOWER(TRIM(REPLACE(m.uom_type COLLATE utf8mb4_unicode_ci, 'Per ', ''))) IN ('sqft', 'sq ft', 'sft', 'square feet'))
                     OR (LOWER(u.name) = 'square meter'
                         AND LOWER(TRIM(REPLACE(m.uom_type COLLATE utf8mb4_unicode_ci, 'Per ', ''))) IN ('sqm', 'sq m', 'square meter', 'square metre'))
                   )
                 ORDER BY u.id LIMIT 1),
  cc.cost_per_uom = COALESCE(m.rate_indian, 0),
  cc.status = COALESCE(m.status, 'Active'),
  cc.updated_at = CURRENT_TIMESTAMP
WHERE cc.deleted_at IS NULL
  AND cc.description = 'Imported from machine (migration 053)';
