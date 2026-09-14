-- 14 Sep 2026: Fix BOM items where a material was mis-stored in machine_id.
-- Earlier logic treated BOM process types ('Wet End'/'Finishing') as machine
-- lines and put the material id into machine_id, leaving material_id NULL. Such
-- rows lose their name/cost mapping (e.g. RA 27006 in a Wet End BOM). This
-- migration moves the id back to material_id for lines whose machine_id actually
-- references a material (exists in `materials`) and is not a real machine.
-- Safe to re-run.

UPDATE bom_items bi
JOIN materials m ON m.id = bi.machine_id
LEFT JOIN machines mac ON mac.id = bi.machine_id
SET bi.material_id = bi.machine_id,
    bi.machine_id = NULL
WHERE bi.machine_id IS NOT NULL
  AND (bi.material_id IS NULL OR bi.material_id = 0)
  AND mac.id IS NULL;
