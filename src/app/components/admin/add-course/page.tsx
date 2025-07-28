import VideoUploader from '../VideoUploader';

export default function AddCoursePage() {
  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold mb-4">Add New Course</h1>
      <VideoUploader />
      {/* Add form fields for title, description, etc. */}
    </div>
  );
}
