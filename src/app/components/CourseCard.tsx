import Link from "next/link";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
}

export default function CourseCard({ id, title, description, image }: CourseCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 w-72">
      <img
        src={image}
        alt={title}
        className="w-full h-40 object-cover rounded-t-2xl"
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-gray-600 text-sm mt-1">
          {description?.substring(0, 60)}...
        </p>
        <Link href={`/courses/${id}`}>
          <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
            View Course
          </button>
        </Link>
      </div>
    </div>
  );
}
