import { Course } from "@/types";
import Image from "next/image";

interface Props {
  course: Course;
}

export default function DocentCard({ course }: Props) {
  return (
    <div className="rounded-2xl p-4" style={{ backgroundColor: "#F3F4F5" }}>
      <p className="text-xs font-medium mb-3" style={{ color: "#7C807B" }}>함께할 도슨트</p>
      <div className="flex items-start gap-3">
        <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
          <Image src={course.docentAvatar} alt={course.docentName} fill className="object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm" style={{ color: "#151613" }}>{course.docentName}</span>
            <div className="flex gap-1">
              {["친근함", "INFP", "간결함"].map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 rounded text-xs border"
                  style={{ borderColor: "#E2E2E2", color: "#7C807B", backgroundColor: "#FFFFFF" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "#7C807B" }}>
            서울 골목골목을 누비며 숨겨진 이야기를 찾아온 도슨트. 쉽고 재미있게 역사를 풀어드려요.
          </p>
        </div>
      </div>
    </div>
  );
}
