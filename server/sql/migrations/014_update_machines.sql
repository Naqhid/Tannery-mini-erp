-- Update machines table: change machine_type to ENUM (Wet End, Finishing), drop capacity
-- First clear any existing values that don't match the new ENUM
UPDATE machines SET machine_type = NULL WHERE machine_type NOT IN ('Wet End', 'Finishing');
ALTER TABLE machines MODIFY COLUMN machine_type ENUM('Wet End', 'Finishing') NULL;
ALTER TABLE machines DROP COLUMN capacity;
