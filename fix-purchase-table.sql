-- Fix PhonePe Payment Integration - Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE purchase
DROP CONSTRAINT IF EXISTS purchase_course_id_fkey;

-- Step 2: Verify constraint is removed
-- You can check with: SELECT conname FROM pg_constraint WHERE conrelid = 'purchase'::regclass;

-- Note: We're removing the foreign key constraint because:
-- 1. Course data is stored in 'courses_mux' table, not 'courses' table
-- 2. The constraint was referencing a non-existent 'courses' table
-- 3. The payment system still validates course_id exists in courses_mux before creating purchase

-- The table will continue to work as before, but without strict referential integrity
-- The course_id column remains as UUID type and is still indexed for performance

-- Verify the change
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'purchase' AND column_name = 'course_id';

-- Optional: If you want to add the correct foreign key to courses_mux instead
-- Uncomment the following lines if you want strict referential integrity to courses_mux:

-- ALTER TABLE purchase
-- ADD CONSTRAINT purchase_course_id_fkey
-- FOREIGN KEY (course_id)
-- REFERENCES courses_mux(id)
-- ON DELETE CASCADE;

COMMENT ON COLUMN purchase.course_id IS 'References course in courses_mux table (no FK constraint for flexibility)';
