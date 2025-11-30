-- Add slug column to courses_mux table
ALTER TABLE courses_mux
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Add slug column to courses_vimeo table
ALTER TABLE courses_vimeo
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Create index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_courses_mux_slug ON courses_mux(slug);
CREATE INDEX IF NOT EXISTS idx_courses_vimeo_slug ON courses_vimeo(slug);

-- Generate slugs for existing courses (Mux)
UPDATE courses_mux
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    ),
    '-+', '-', 'g'
  )
)
WHERE slug IS NULL;

-- Generate slugs for existing courses (Vimeo)
UPDATE courses_vimeo
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    ),
    '-+', '-', 'g'
  )
)
WHERE slug IS NULL;

-- Handle duplicate slugs by appending course ID
-- For Mux courses
WITH duplicates AS (
  SELECT slug, COUNT(*) as count
  FROM courses_mux
  WHERE slug IS NOT NULL
  GROUP BY slug
  HAVING COUNT(*) > 1
)
UPDATE courses_mux c
SET slug = c.slug || '-' || SUBSTRING(c.id::TEXT, 1, 8)
WHERE c.slug IN (SELECT slug FROM duplicates);

-- For Vimeo courses
WITH duplicates AS (
  SELECT slug, COUNT(*) as count
  FROM courses_vimeo
  WHERE slug IS NOT NULL
  GROUP BY slug
  HAVING COUNT(*) > 1
)
UPDATE courses_vimeo c
SET slug = c.slug || '-' || SUBSTRING(c.id::TEXT, 1, 8)
WHERE c.slug IN (SELECT slug FROM duplicates);
