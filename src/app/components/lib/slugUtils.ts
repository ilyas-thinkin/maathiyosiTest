// src/app/components/lib/slugUtils.ts
// Utility functions for generating and handling course slugs

/**
 * Generate a URL-friendly slug from a title
 * @param title - The course title
 * @returns URL-friendly slug (lowercase, hyphenated)
 * @example "IoT Course 101" -> "iot-course-101"
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    // Remove special characters
    .replace(/[^a-z0-9\s-]/g, '')
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Replace multiple hyphens with single hyphen
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Ensure slug is unique by appending a suffix if needed
 * @param baseSlug - The base slug
 * @param existingSlugs - Array of existing slugs
 * @returns Unique slug
 */
export function ensureUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Validate slug format
 * @param slug - The slug to validate
 * @returns true if valid
 */
export function isValidSlug(slug: string): boolean {
  // Slug should only contain lowercase letters, numbers, and hyphens
  // Should not start or end with hyphen
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugPattern.test(slug);
}
