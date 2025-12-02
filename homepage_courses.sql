-- =============================================
-- Homepage Courses Table
-- =============================================
-- This table stores which courses should be displayed on the homepage
-- Supports both Mux and Vimeo courses

-- Drop table if exists (use with caution in production)
-- DROP TABLE IF EXISTS homepage_courses;

-- Create homepage_courses table
CREATE TABLE IF NOT EXISTS homepage_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('mux', 'vimeo')),
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),

    -- Ensure unique combination of course_id and source
    UNIQUE(course_id, source)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_homepage_courses_display_order
    ON homepage_courses(display_order);

CREATE INDEX IF NOT EXISTS idx_homepage_courses_source
    ON homepage_courses(source);

CREATE INDEX IF NOT EXISTS idx_homepage_courses_course_id
    ON homepage_courses(course_id);

-- Create a composite index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_homepage_courses_source_course_id
    ON homepage_courses(source, course_id);

-- =============================================
-- Row Level Security (RLS) Policies
-- =============================================

-- Enable RLS
ALTER TABLE homepage_courses ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access (for displaying homepage courses)
CREATE POLICY "Allow public read access to homepage courses"
    ON homepage_courses
    FOR SELECT
    USING (true);

-- Policy: Allow authenticated admin users to insert
-- Note: You'll need to implement proper admin authentication
-- This is a placeholder policy - adjust based on your auth system
CREATE POLICY "Allow admin insert on homepage courses"
    ON homepage_courses
    FOR INSERT
    WITH CHECK (
        -- Replace with your actual admin check logic
        -- Example: auth.uid() IN (SELECT user_id FROM admin_users)
        true
    );

-- Policy: Allow authenticated admin users to update
CREATE POLICY "Allow admin update on homepage courses"
    ON homepage_courses
    FOR UPDATE
    USING (
        -- Replace with your actual admin check logic
        true
    );

-- Policy: Allow authenticated admin users to delete
CREATE POLICY "Allow admin delete on homepage courses"
    ON homepage_courses
    FOR DELETE
    USING (
        -- Replace with your actual admin check logic
        true
    );

-- =============================================
-- Trigger for updated_at timestamp
-- =============================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_homepage_courses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER set_homepage_courses_updated_at
    BEFORE UPDATE ON homepage_courses
    FOR EACH ROW
    EXECUTE FUNCTION update_homepage_courses_updated_at();

-- =============================================
-- Sample Data (Optional - Comment out if not needed)
-- =============================================

-- Example: Insert some courses to homepage
-- Replace these UUIDs with actual course IDs from your database
/*
INSERT INTO homepage_courses (course_id, source, display_order) VALUES
    ('00000000-0000-0000-0000-000000000001', 'mux', 0),
    ('00000000-0000-0000-0000-000000000002', 'vimeo', 1),
    ('00000000-0000-0000-0000-000000000003', 'mux', 2)
ON CONFLICT (course_id, source) DO NOTHING;
*/

-- =============================================
-- Helpful Queries
-- =============================================

-- View all homepage courses with their display order
-- SELECT * FROM homepage_courses ORDER BY display_order;

-- Count total homepage courses
-- SELECT COUNT(*) as total_homepage_courses FROM homepage_courses;

-- Get homepage courses grouped by source
-- SELECT source, COUNT(*) as count FROM homepage_courses GROUP BY source;

-- Delete all homepage courses
-- DELETE FROM homepage_courses;

-- Get homepage courses with full course details (Mux)
/*
SELECT
    hc.display_order,
    hc.source,
    c.*
FROM homepage_courses hc
JOIN courses_mux c ON hc.course_id = c.id AND hc.source = 'mux'
ORDER BY hc.display_order;
*/

-- Get homepage courses with full course details (Vimeo)
/*
SELECT
    hc.display_order,
    hc.source,
    c.*
FROM homepage_courses hc
JOIN courses_vimeo c ON hc.course_id = c.id AND hc.source = 'vimeo'
ORDER BY hc.display_order;
*/

-- Get all homepage courses (both Mux and Vimeo combined)
/*
SELECT
    hc.display_order,
    hc.source,
    COALESCE(cm.id, cv.id) as course_id,
    COALESCE(cm.title, cv.title) as title,
    COALESCE(cm.description, cv.description) as description,
    COALESCE(cm.price, cv.price) as price,
    COALESCE(cm.thumbnail_url, cv.thumbnail_url) as thumbnail_url,
    COALESCE(cm.category, cv.category) as category,
    COALESCE(cm.slug, cv.slug) as slug
FROM homepage_courses hc
LEFT JOIN courses_mux cm ON hc.course_id = cm.id AND hc.source = 'mux'
LEFT JOIN courses_vimeo cv ON hc.course_id = cv.id AND hc.source = 'vimeo'
ORDER BY hc.display_order;
*/
