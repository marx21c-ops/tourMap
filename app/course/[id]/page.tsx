"use client";

import { use } from "react";
import { notFound, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getCourseById } from "@/data/courses";
import { getPlaceById } from "@/data/ikseonPlaces";
import { CATEGORY_COLORS, CATEGORY_LABELS, CATEGORY_EMOJIS } from "@/types";
import DocentCard from "@/components/course/DocentCard";

export default function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const course = getCourseById(id);

  if (!course) notFound();

  const places = course.placeIds.map(getPlaceById).filter(Boolean);

  const difficultyColor = {
    쉬움: "#22C55E",
    보통: "#F59E0B",
    어려움: "#EF4444",
  }[course.difficulty];

  return (
    <div className="relative w-full min-h-dvh bg-white">
      {/* Hero Image */}
      <div className="relative h-[45vh] w-full">
        <Image src={course.coverImage} alt={course.title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />

        {/* Top Nav */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-safe pt-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white"
          >
            ←
          </button>
          <div className="flex gap-2">
            <button className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white text-base">
              🔖
            </button>
            <button className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white text-base">
              ↗
            </button>
          </div>
        </div>
      </div>

      {/* Content Card — overlaps image */}
      <div className="relative -mt-6 bg-white rounded-t-3xl z-10">
        <div className="px-5 pt-6 pb-32">
          {/* Location + Tags */}
          <p className="text-xs text-gray-400 mb-2">서울 · 종로구 익선동</p>
          <div className="flex gap-1.5 flex-wrap mb-3">
            {course.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                #{tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{course.title}</h1>
          <p className="text-gray-500 text-sm mb-5">{course.subtitle}</p>

          {/* Info Row */}
          <div className="flex gap-3 mb-6">
            {[
              { icon: "⏱", value: course.duration },
              { icon: "📍", value: `${course.placeCount}개 장소` },
              { icon: "💪", value: course.difficulty, color: difficultyColor },
            ].map(({ icon, value, color }) => (
              <div key={value} className="flex-1 bg-gray-50 rounded-2xl py-3 flex flex-col items-center gap-1">
                <span className="text-lg">{icon}</span>
                <span className="text-xs font-semibold" style={color ? { color } : { color: "#374151" }}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Completion Rate */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>완주 예상률</span>
              <span className="font-semibold text-gray-900">{course.completionRate}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${course.completionRate}%`, backgroundColor: "#22C55E" }}
              />
            </div>
          </div>

          {/* Docent Card */}
          <div className="mb-6">
            <DocentCard course={course} />
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-base font-bold text-gray-900 mb-2">코스 소개</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{course.description}</p>
          </div>

          {/* Places List */}
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-3">포함 장소</h2>
            <div className="space-y-3">
              {places.map((place, i) => {
                if (!place) return null;
                const color = CATEGORY_COLORS[place.category];
                return (
                  <div key={place.id} className="flex items-start gap-3">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold mt-0.5"
                      style={{ backgroundColor: color }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-gray-900 text-sm">{place.name}</span>
                        <span className="text-xs" style={{ color }}>
                          {CATEGORY_EMOJIS[place.category]} {CATEGORY_LABELS[place.category]}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{place.shortDescription}</p>
                      <p className="text-xs text-gray-400 mt-0.5">⏱ 약 {place.estimatedStayMinutes}분</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 pb-safe pb-6 pt-4 bg-gradient-to-t from-white via-white to-transparent">
        <Link
          href={`/docent/${course.id}?step=0`}
          className="flex items-center justify-center gap-2 w-full py-4 bg-gray-900 rounded-3xl text-sm font-semibold"
        >
          <span className="text-white">AI 도슨트와 코스 시작하기</span>
          <span className="text-[#A3E635]">→</span>
        </Link>
      </div>
    </div>
  );
}
