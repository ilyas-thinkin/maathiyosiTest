export interface LessonInput {
  title: string;
  videoFile: File | null;
}

export interface CourseFormData {
  title: string;
  description: string;
  category: string;
  price: string; // ✅ Added missing price field
  thumbnail: File | null;
  lessons: LessonInput[];
}