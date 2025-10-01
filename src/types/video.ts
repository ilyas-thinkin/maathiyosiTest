export interface CloudflareDirectUploadResponse {
  uploadURL: string;
  uid: string;
}

export interface SupabaseLesson {
  course_id: string;
  title: string;
  description?: string;
  video_uid: string;
}
