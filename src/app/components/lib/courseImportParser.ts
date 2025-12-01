// src/app/components/lib/courseImportParser.ts
// Parser for course import text files

export interface ParsedCourseData {
  courseTitle: string;
  courseDescription: string;
  category: string;
  price: string;
  lessons: {
    title: string;
    description: string;
  }[];
}

/**
 * Parse a course import text file
 * @param fileContent - The text content of the uploaded file
 * @returns Parsed course data
 */
export function parseCourseImportFile(fileContent: string): ParsedCourseData {
  const lines = fileContent.split('\n');
  const data: any = {};
  const lessons: { [key: number]: { title?: string; description?: string } } = {};

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip empty lines
    if (!trimmedLine) continue;

    // Split by first colon
    const colonIndex = trimmedLine.indexOf(':');
    if (colonIndex === -1) continue;

    const key = trimmedLine.substring(0, colonIndex).trim().toUpperCase();
    const value = trimmedLine.substring(colonIndex + 1).trim();

    // Parse course fields
    if (key === 'COURSE_TITLE') {
      data.courseTitle = value;
    } else if (key === 'COURSE_DESCRIPTION') {
      data.courseDescription = value;
    } else if (key === 'CATEGORY') {
      data.category = value;
    } else if (key === 'PRICE') {
      data.price = value;
    }
    // Parse lesson fields (LESSON_1_TITLE, LESSON_2_DESCRIPTION, etc.)
    else if (key.startsWith('LESSON_')) {
      const parts = key.split('_');
      if (parts.length >= 3) {
        const lessonNum = parseInt(parts[1]);
        const fieldType = parts.slice(2).join('_'); // TITLE or DESCRIPTION

        if (!isNaN(lessonNum)) {
          if (!lessons[lessonNum]) {
            lessons[lessonNum] = {};
          }

          if (fieldType === 'TITLE') {
            lessons[lessonNum].title = value;
          } else if (fieldType === 'DESCRIPTION') {
            lessons[lessonNum].description = value;
          }
        }
      }
    }
  }

  // Convert lessons object to array, filtering out incomplete lessons
  const lessonsArray = Object.keys(lessons)
    .map(num => parseInt(num))
    .sort((a, b) => a - b)
    .map(num => ({
      title: lessons[num].title || '',
      description: lessons[num].description || ''
    }))
    .filter(lesson => lesson.title); // Only include lessons with at least a title

  return {
    courseTitle: data.courseTitle || '',
    courseDescription: data.courseDescription || '',
    category: data.category || '',
    price: data.price || '',
    lessons: lessonsArray
  };
}

/**
 * Read a text file and return its content
 * @param file - The uploaded File object
 * @returns Promise with file content as string
 */
export function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve(content);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Validate parsed course data
 * @param data - Parsed course data
 * @returns Validation result with any errors
 */
export function validateCourseData(data: ParsedCourseData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.courseTitle) {
    errors.push('Course title is required');
  }

  if (!data.courseDescription) {
    errors.push('Course description is required');
  }

  if (!data.category) {
    errors.push('Category is required');
  }

  if (!data.price) {
    errors.push('Price is required');
  } else if (isNaN(parseFloat(data.price))) {
    errors.push('Price must be a valid number');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
