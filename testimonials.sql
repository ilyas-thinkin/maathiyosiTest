-- =============================================
-- Testimonials Table
-- =============================================
-- This table stores student testimonials displayed on the homepage

-- Drop table if exists (use with caution in production)
-- DROP TABLE IF EXISTS testimonials;

-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    feedback TEXT NOT NULL,
    image_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    row_number INTEGER NOT NULL DEFAULT 1 CHECK (row_number IN (1, 2)),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_testimonials_display_order
    ON testimonials(display_order);

CREATE INDEX IF NOT EXISTS idx_testimonials_row_number
    ON testimonials(row_number);

CREATE INDEX IF NOT EXISTS idx_testimonials_is_active
    ON testimonials(is_active);

-- =============================================
-- Row Level Security (RLS) Policies
-- =============================================

-- Enable RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access for active testimonials
CREATE POLICY "Allow public read access to active testimonials"
    ON testimonials
    FOR SELECT
    USING (is_active = true);

-- Policy: Allow admin insert
CREATE POLICY "Allow admin insert on testimonials"
    ON testimonials
    FOR INSERT
    WITH CHECK (true);

-- Policy: Allow admin update
CREATE POLICY "Allow admin update on testimonials"
    ON testimonials
    FOR UPDATE
    USING (true);

-- Policy: Allow admin delete
CREATE POLICY "Allow admin delete on testimonials"
    ON testimonials
    FOR DELETE
    USING (true);

-- =============================================
-- Trigger for updated_at timestamp
-- =============================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_testimonials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER set_testimonials_updated_at
    BEFORE UPDATE ON testimonials
    FOR EACH ROW
    EXECUTE FUNCTION update_testimonials_updated_at();

-- =============================================
-- Insert Dummy Data (Current Testimonials)
-- =============================================

-- Row 1 Testimonials
INSERT INTO testimonials (name, role, feedback, image_url, display_order, row_number) VALUES
    ('Arun Kumar', 'Class 11 Student', 'Maathiyosi has completely changed how I learn physics. The video explanations are so clear, and I can learn at my own pace!', 'https://randomuser.me/api/portraits/men/32.jpg', 0, 1),
    ('Priya Sharma', 'Class 12 Student', 'The best decision I made for my board exam preparation. The structured courses and practice problems helped me score 95%!', 'https://randomuser.me/api/portraits/women/44.jpg', 1, 1),
    ('Karthik Reddy', 'Engineering Student', 'As an engineering student, Maathiyosi''s advanced math courses have been invaluable. The concepts are explained brilliantly!', 'https://randomuser.me/api/portraits/men/76.jpg', 2, 1),
    ('Divya Nair', 'Class 10 Student', 'I was struggling with algebra, but Maathiyosi made it so easy to understand. Now it''s my favorite subject!', 'https://randomuser.me/api/portraits/women/68.jpg', 3, 1),
    ('Rahul Mehta', 'NEET Aspirant', 'The biology and chemistry courses are exceptional. The detailed explanations helped me crack NEET with a great score!', 'https://randomuser.me/api/portraits/men/45.jpg', 4, 1),
    ('Sneha Iyer', 'Class 9 Student', 'Learning has never been this fun! The interactive lessons and quizzes keep me engaged and help me remember better.', 'https://randomuser.me/api/portraits/women/12.jpg', 5, 1)
ON CONFLICT DO NOTHING;

-- Row 2 Testimonials
INSERT INTO testimonials (name, role, feedback, image_url, display_order, row_number) VALUES
    ('Vijay Krishnan', 'JEE Aspirant', 'Maathiyosi''s JEE preparation courses are top-notch. The problem-solving techniques and shortcuts are game-changers!', 'https://randomuser.me/api/portraits/men/90.jpg', 0, 2),
    ('Ananya Das', 'Class 12 Student', 'The chemistry courses here are amazing! Complex reactions are broken down so well that I actually enjoy studying now.', 'https://randomuser.me/api/portraits/women/25.jpg', 1, 2),
    ('Rohan Singh', 'Class 11 Student', 'Best online learning platform I''ve used. The teachers are excellent, and the study materials are comprehensive.', 'https://randomuser.me/api/portraits/men/54.jpg', 2, 2),
    ('Meera Patel', 'Class 10 Student', 'My grades improved significantly after joining Maathiyosi. The practice tests really helped me prepare for exams!', 'https://randomuser.me/api/portraits/women/33.jpg', 3, 2),
    ('Arjun Desai', 'Engineering Student', 'The advanced calculus and linear algebra courses are perfectly designed for college-level learning. Highly recommend!', 'https://randomuser.me/api/portraits/men/67.jpg', 4, 2),
    ('Lakshmi Menon', 'Class 12 Student', 'Thanks to Maathiyosi, I''m confident about my board exams. The revision modules and mock tests are extremely helpful!', 'https://randomuser.me/api/portraits/women/51.jpg', 5, 2)
ON CONFLICT DO NOTHING;

-- =============================================
-- Storage Bucket Configuration
-- =============================================
-- Make sure the 'testimonial-image' bucket exists in Supabase Storage
-- with public access enabled for uploaded images

-- To create the bucket via SQL (if not exists):
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('testimonial-image', 'testimonial-image', true)
-- ON CONFLICT (id) DO NOTHING;

-- Storage policies for testimonial-image bucket:
-- 1. Allow public read access (already public bucket)
-- 2. Allow authenticated users to upload (handled by admin panel)

-- =============================================
-- Helpful Queries
-- =============================================

-- View all active testimonials
-- SELECT * FROM testimonials WHERE is_active = true ORDER BY row_number, display_order;

-- View testimonials by row
-- SELECT * FROM testimonials WHERE row_number = 1 AND is_active = true ORDER BY display_order;

-- Count total testimonials
-- SELECT COUNT(*) as total_testimonials FROM testimonials WHERE is_active = true;

-- Get testimonials grouped by row
-- SELECT row_number, COUNT(*) as count FROM testimonials WHERE is_active = true GROUP BY row_number;
