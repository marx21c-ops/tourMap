"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ikseonCourses } from "@/data/courses";
import { getCompletedCourses } from "@/lib/stamps";

const STAMP_META: Record<string, { emoji: string; color: string; bg: string }> = {
  c01: { emoji: "🏛️", color: "#B45309", bg: "#FEF3C7" },
  c02: { emoji: "🍜", color: "#15803D", bg: "#DCFCE7" },
  c03: { emoji: "📜", color: "#1D4ED8", bg: "#DBEAFE" },
  c04: { emoji: "🎨", color: "#7C3AED", bg: "#EDE9FE" },
};

export default function StampsPage() {
  const router = useRouter();
  const [completed, setCompleted] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCompleted(getCompletedCourses());
    setMounted(true);
  }, []);

  const total = ikseonCourses.length;
  const count = completed.length;
  const allDone = count === total;

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{
        background: "linear-gradient(160deg, #FAFAF7 0%, #F0EDE6 100%)",
        paddingTop: "max(env(safe-area-inset-top), 1.5rem)",
        paddingBottom: "max(env(safe-area-inset-bottom), 1.5rem)",
      }}
    >
      {/* Header */}
      <div className="px-5 pt-2 pb-8 text-center">
        <p className="text-4xl mb-3">📖</p>
        <h1 className="text-2xl font-bold" style={{ color: "#151613" }}>
          익선동 스탬프 북
        </h1>
        {mounted && (
          <p className="text-sm mt-2" style={{ color: "#7C807B" }}>
            {allDone
              ? "🎉 모든 코스를 완주했어요!"
              : `총 ${total}개 코스 중 ${count}개 완주`}
          </p>
        )}

        {/* Progress dots */}
        {mounted && (
          <div className="flex justify-center gap-2 mt-3">
            {ikseonCourses.map((c) => (
              <div
                key={c.id}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  backgroundColor: completed.includes(c.id)
                    ? STAMP_META[c.id]?.color ?? "#151613"
                    : "#E2E2E2",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Stamps grid */}
      <div className="flex-1 px-6">
        <div className="grid grid-cols-2 gap-6">
          {ikseonCourses.map((course) => {
            const isDone = mounted && completed.includes(course.id);
            const meta = STAMP_META[course.id];
            const shortTitle = course.title
              .replace("익선동 ", "")
              .replace(" 코스", "");

            return (
              <div key={course.id} className="flex flex-col items-center">
                {/* Stamp circle */}
                <div
                  className="flex flex-col items-center justify-center rounded-full select-none"
                  style={{
                    width: 136,
                    height: 136,
                    border: isDone
                      ? `5px solid ${meta.color}`
                      : "3px dashed #D1D5DB",
                    backgroundColor: isDone ? meta.bg : "#F3F4F4",
                    transform: isDone ? "rotate(-5deg)" : "none",
                    opacity: isDone ? 1 : 0.55,
                    boxShadow: isDone
                      ? `0 0 0 2px white, 0 0 0 5px ${meta.color}55, 0 4px 16px ${meta.color}30`
                      : "none",
                    transition: "all 0.3s ease",
                  }}
                >
                  <span className="text-3xl mb-1">{meta.emoji}</span>
                  <span
                    className="text-[11px] font-bold text-center leading-tight px-3"
                    style={{ color: isDone ? meta.color : "#9CA3AF" }}
                  >
                    {shortTitle}
                  </span>
                  {isDone && (
                    <span
                      className="text-[10px] font-bold mt-1.5 px-2.5 py-0.5 rounded-full"
                      style={{ backgroundColor: meta.color, color: "white" }}
                    >
                      완주!
                    </span>
                  )}
                </div>

                {/* Label */}
                <p
                  className="text-xs font-medium mt-2.5 text-center"
                  style={{ color: isDone ? "#151613" : "#9CA3AF" }}
                >
                  {isDone ? "✓ 완주" : "미완주"}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* All done message */}
      {mounted && allDone && (
        <div
          className="mx-5 mt-6 px-5 py-4 rounded-2xl text-center"
          style={{ backgroundColor: "#FEF3C7", border: "1px solid #F59E0B" }}
        >
          <p className="text-sm font-semibold" style={{ color: "#92400E" }}>
            🏆 익선동 완전 정복!
          </p>
          <p className="text-xs mt-0.5" style={{ color: "#B45309" }}>
            4개 코스를 모두 완주했어요. 대단해요!
          </p>
        </div>
      )}

      {/* Back button */}
      <div className="px-5 pt-6">
        <button
          onClick={() => router.push("/")}
          className="w-full py-4 rounded-2xl text-sm font-semibold text-white"
          style={{ backgroundColor: "#151613" }}
        >
          지도로 돌아가기
        </button>
      </div>
    </div>
  );
}
