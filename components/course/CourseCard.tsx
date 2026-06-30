import { Course } from "@/types";
import Image from "next/image";

interface Props {
  course: Course;
  onClick?: () => void;
  onPreview?: () => void;
}

export default function CourseCard({ course, onClick, onPreview }: Props) {
  return (
    <div
      className="bg-white rounded-xl overflow-hidden shadow-sm"
      onClick={onClick}
    >
      <div className="relative h-44">
        <Image src={course.coverImage} alt={course.title} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
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
        <h3 className="font-semibold text-base mb-0.5" style={{ color: "#151613" }}>{course.title}</h3>
        <p className="text-sm mb-3" style={{ color: "#7C807B" }}>{course.subtitle}</p>
        <div className="flex gap-3 text-xs mb-4" style={{ color: "#7C807B" }}>
          <span>⏱ {course.duration}</span>
          <span>📍 {course.placeCount}개 장소</span>
          <span>💪 {course.difficulty}</span>
        </div>
        {onPreview && (
          <button
            onClick={(e) => { e.stopPropagation(); onPreview(); }}
            className="w-full py-2.5 rounded-xl text-sm font-medium"
            style={{ backgroundColor: "#F3F4F5", color: "#151613" }}
          >
            지도에서 미리보기 →
          </button>
        )}
      </div>
    </div>
  );
}
