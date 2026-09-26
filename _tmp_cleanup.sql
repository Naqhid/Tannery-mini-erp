-- Remove artifacts from previous migration 053 test runs
DELETE FROM cost_components WHERE description = 'Imported from machine (migration 053)';
DELETE FROM uom WHERE description = 'Auto-created from machine UOM (migration 053)';
