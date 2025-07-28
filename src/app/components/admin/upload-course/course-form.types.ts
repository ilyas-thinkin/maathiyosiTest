export interface LessonInput {
  title: string;
  videoFile: File | null;
}

export interface CourseFormData {
  title: string;
  description: string;
  category: string;
  thumbnail: File | null;
  lessons: LessonInput[];
}
