-- SQL script to add vimeo_folder_id and vimeo_folder_uri columns to courses_vimeo table
-- Run this in your Supabase SQL Editor

-- Add vimeo_folder_id column
ALTER TABLE courses_vimeo
ADD COLUMN IF NOT EXISTS vimeo_folder_id TEXT;

-- Add vimeo_folder_uri column
ALTER TABLE courses_vimeo
ADD COLUMN IF NOT EXISTS vimeo_folder_uri TEXT;

-- Create index on vimeo_folder_id for faster lookups (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_courses_vimeo_folder_id
ON courses_vimeo(vimeo_folder_id);

-- No foreign key constraint needed as this is just a reference to Vimeo's external system
-- No RLS policy changes needed as the existing policies already cover all columns

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'courses_vimeo'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Success message
SELECT 'Vimeo folder columns added successfully! ✅' AS status;
