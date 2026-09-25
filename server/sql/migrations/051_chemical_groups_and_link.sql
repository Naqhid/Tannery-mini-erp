-- Migration: Add the two chemical stock groups and link imported materials.
-- The "Chemical Stoack 22-9-2026" workbook has two sheets/groups:
--   WB     -> Wetblue chemicals  (materials.type = 'Wet-end')
--   Finish -> Finishing chemicals (materials.type = 'Finishing')
-- This creates the two groups in group_master (idempotent) and sets group_id
-- on the imported materials by their type.
-- Note: per-item HSN codes live on materials.hsn_code (migration 050); the
-- group hsn_code below is only a representative default for the group.

-- =============================================
-- Step 1: Insert the two groups (skip if the name already exists).
-- Codes are generated from the current MAX(GRP-#####) so we never collide
-- with an existing group code on the target database.
-- =============================================
SET @grp_seq = (SELECT COALESCE(MAX(CAST(SUBSTRING(code, 5) AS UNSIGNED)), 0) FROM group_master WHERE code LIKE 'GRP-%');

INSERT INTO group_master (code, name, hsn_code, gst_rate, status)
SELECT CONCAT('GRP-', LPAD(@grp_seq := @grp_seq + 1, 5, '0')), 'Wetblue Chemicals', '3202', 18.00, 'Active'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM group_master WHERE name = 'Wetblue Chemicals');

INSERT INTO group_master (code, name, hsn_code, gst_rate, status)
SELECT CONCAT('GRP-', LPAD(@grp_seq := @grp_seq + 1, 5, '0')), 'Finishing Chemicals', '3209', 18.00, 'Active'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM group_master WHERE name = 'Finishing Chemicals');

-- =============================================
-- Step 2: Link materials to their group by type
-- =============================================
UPDATE materials
SET group_id = (SELECT id FROM group_master WHERE name = 'Wetblue Chemicals' LIMIT 1)
WHERE type = 'Wet-end';

UPDATE materials
SET group_id = (SELECT id FROM group_master WHERE name = 'Finishing Chemicals' LIMIT 1)
WHERE type = 'Finishing';
