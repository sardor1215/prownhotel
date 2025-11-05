-- ============================================
-- Add display_order column to rooms table
-- Copy and paste ALL of this into your database SQL editor
-- ============================================

-- Step 1: Add the column
ALTER TABLE rooms ADD COLUMN display_order INTEGER;

-- Step 2: Set values for existing rows (using their id as initial order)
UPDATE rooms SET display_order = id WHERE display_order IS NULL;

-- Step 3: Set default value for new rows
ALTER TABLE rooms ALTER COLUMN display_order SET DEFAULT 0;

-- Step 4: Make it NOT NULL (after all existing rows have values)
ALTER TABLE rooms ALTER COLUMN display_order SET NOT NULL;

-- Step 5: Create index for better query performance
CREATE INDEX idx_rooms_display_order ON rooms(display_order);

-- ============================================
-- Verification (optional - run this to check if it worked)
-- ============================================
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'rooms' AND column_name = 'display_order';
