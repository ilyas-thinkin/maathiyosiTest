import Link from "next/link";
import { motion } from "framer-motion";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
}

export default function CourseCard({ id, title, description, image }: CourseCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 w-full max-w-sm mx-auto"
    >
      {/* Image with subtle zoom on hover */}
      <div className="overflow-hidden rounded-t-2xl">
        <motion.img
          src={image}
          alt={title}
          className="w-full h-44 sm:h-48 md:h-52 object-cover transition-transform duration-500 hover:scale-110"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <p className="text-gray-600 text-sm mt-1">
          {description?.substring(0, 60)}...
        </p>

        {/* Button */}
        <Link href={`/courses/${id}`}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 w-full px-4 py-2 bg-red-600 text-white font-medium rounded-xl shadow-md hover:bg-red-700 transition-colors duration-300"
          >
            View Course
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}
