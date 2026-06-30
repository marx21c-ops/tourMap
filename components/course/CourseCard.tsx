import { Course } from "@/types";
import Image from "next/image";

interface Props {
  course: Course;
  onClick?: () => void;
}

export default function CourseCard({ course, onClick }: Props) {
  return (
    <div
      className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer active:scale-[0.98] transition-transform"
      onClick={onClick}
    >
      <div className="relative h-44">
        <Image src={course.coverImage} alt={course.title} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <div className="flex gap-1.5 flex-wrap mb-1">
            {course.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full text-xs text-white bg-white/20 backdrop-blur-sm">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-base mb-0.5">{course.title}</h3>
        <p className="text-sm text-gray-500 mb-3">{course.subtitle}</p>
        <div className="flex gap-3 text-xs text-gray-600">
          <span>⏱ {course.duration}</span>
          <span>📍 {course.placeCount}개 장소</span>
          <span>💪 {course.difficulty}</span>
        </div>
      </div>
    </div>
  );
}
