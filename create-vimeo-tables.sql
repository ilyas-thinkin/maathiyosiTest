-- SQL script to create Vimeo course tables in Supabase
-- Run this in your Supabase SQL Editor

-- Create courses_vimeo table
CREATE TABLE IF NOT EXISTS courses_vimeo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Uncategorized',
  price NUMERIC DEFAULT 0,
  thumbnail_url TEXT,
  vimeo_folder_id TEXT,
  vimeo_folder_uri TEXT,
  published BOOLEAN DEFAULT true
);

-- Create course_lessons_vimeo table
CREATE TABLE IF NOT EXISTS course_lessons_vimeo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  course_id UUID REFERENCES courses_vimeo(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  vimeo_video_id TEXT,
  vimeo_video_uri TEXT,
  vimeo_player_url TEXT,
  document_url TEXT,
  duration INTEGER DEFAULT 0,
  lesson_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_courses_vimeo_created_at ON courses_vimeo(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_courses_vimeo_category ON courses_vimeo(category);
CREATE INDEX IF NOT EXISTS idx_courses_vimeo_folder_id ON courses_vimeo(vimeo_folder_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_vimeo_course_id ON course_lessons_vimeo(course_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_vimeo_order ON course_lessons_vimeo(course_id, lesson_order);

-- Enable Row Level Security (RLS) if needed
ALTER TABLE courses_vimeo ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons_vimeo ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (adjust based on your needs)
CREATE POLICY "Public can view published courses"
  ON courses_vimeo FOR SELECT
  USING (published = true);

CREATE POLICY "Public can view published lessons"
  ON course_lessons_vimeo FOR SELECT
  USING (published = true);

-- Create policies for authenticated admin users (adjust based on your auth setup)
-- Replace with your actual admin check logic
CREATE POLICY "Admins can do everything on courses"
  ON courses_vimeo FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can do everything on lessons"
  ON course_lessons_vimeo FOR ALL
  USING (true)
  WITH CHECK (true);

-- Optional: Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to auto-update updated_at
CREATE TRIGGER update_courses_vimeo_updated_at
  BEFORE UPDATE ON courses_vimeo
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_lessons_vimeo_updated_at
  BEFORE UPDATE ON course_lessons_vimeo
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Vimeo course tables created successfully! 🎉' AS status;
