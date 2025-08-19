// ✅ YouTube Lesson Input
export interface LessonInputYT {
  title: string;
  youtubeUrl: string;
  description?: string; // optional
  document?: File | null; // optional
}

// ✅ YouTube Course Form Data
export interface CourseFormDataYT {
  title: string;
  description: string;
  category: string;
  price: string;
  thumbnail: File | null;
  lessons: LessonInputYT[];
}
