"use client";

import { Course, IkseonPlace } from "@/types";
import { formatDistance } from "@/lib/geo";

interface Props {
  course: Course;
  currentStep: number;
  currentPlace: IkseonPlace;
  distanceToTarget: number | null;
  arrived: boolean;
  onNext: () => void;
  onExit: () => void;
  navHeight?: number;
}

export default function CourseNavGuide({
  course,
  currentStep,
  currentPlace,
  distanceToTarget,
  arrived,
  onNext,
  onExit,
  navHeight = 0,
}: Props) {
  const isLast = currentStep >= course.placeCount - 1;
  const progress = Math.round((currentStep / course.placeCount) * 100);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-3xl" style={{ boxShadow: "0 -4px 24px rgba(0,0,0,0.12)" }}>
      {/* Handle */}
      <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-4" style={{ backgroundColor: "#E2E2E2" }} />

      <div className="px-5" style={{ paddingBottom: `calc(env(safe-area-inset-bottom) + ${navHeight}px + 24px)` }}>
        {/* Top row: progress + exit */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: "#151613" }}
            >
              {currentStep + 1}
            </div>
            <span className="text-xs font-medium" style={{ color: "#7C807B" }}>
              {currentStep + 1} / {course.placeCount} 장소
            </span>
          </div>
          <button
            onClick={onExit}
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium"
            style={{ backgroundColor: "#F3F4F5", color: "#7C807B" }}
          >
            ✕
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 rounded-full mb-4 overflow-hidden" style={{ backgroundColor: "#F3F4F5" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: "#99F950" }}
          />
        </div>

        {/* Distance / arrived badge */}
        {arrived ? (
          <p className="text-sm font-semibold mb-1" style={{ color: "#22C55E" }}>
            🎉 도착했어요! 잠시 둘러보세요
          </p>
        ) : distanceToTarget !== null ? (
          <p className="text-xs mb-1" style={{ color: "#7C807B" }}>
            📍 약 {formatDistance(distanceToTarget)} 앞
          </p>
        ) : null}

        {/* Place name */}
        <h3 className="text-lg font-semibold mb-1" style={{ color: "#151613" }}>
          {currentPlace.name}
        </h3>
        <p className="text-sm mb-4 line-clamp-2" style={{ color: "#7C807B" }}>
          {currentPlace.shortDescription}
        </p>

        {/* CTA button */}
        <button
          onClick={onNext}
          className="w-full py-4 rounded-xl text-sm font-semibold transition-all"
          style={
            arrived
              ? { backgroundColor: "#151613", color: "#FFFFFF" }
              : { backgroundColor: "#F3F4F5", color: "#7C807B" }
          }
        >
          {arrived
            ? isLast
              ? "🎊 코스 완주!"
              : "다음 장소로 →"
            : isLast
            ? "마지막 장소입니다"
            : "이동 중... (도착하면 자동 감지)"}
        </button>
      </div>
    </div>
  );
}
