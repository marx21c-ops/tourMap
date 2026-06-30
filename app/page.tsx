"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { IkseonPlace } from "@/types";
import { ikseonPlaces, getPlacesByCategory } from "@/data/ikseonPlaces";
import { ikseonCourses } from "@/data/courses";
import CategoryFilter from "@/components/map/CategoryFilter";
import PlaceBottomSheet from "@/components/map/PlaceBottomSheet";
import CourseCard from "@/components/course/CourseCard";

const KakaoMap = dynamic(() => import("@/components/map/KakaoMap"), { ssr: false });

type Tab = "map" | "courses";

export default function HomePage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedPlace, setSelectedPlace] = useState<IkseonPlace | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("map");
  const [showCourseList, setShowCourseList] = useState(false);

  const filteredPlaces = getPlacesByCategory(activeCategory);

  const handlePlaceSelect = useCallback((place: IkseonPlace) => {
    setSelectedPlace(place);
  }, []);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setSelectedPlace(null);
  };

  return (
    <div className="relative w-full h-dvh flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 px-4 pt-safe pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-500">서울 · 종로구 익선동</p>
            <h1 className="text-lg font-bold text-gray-900">어디를 둘러볼까요? 🗺️</h1>
          </div>
          <button
            onClick={() => setShowCourseList(!showCourseList)}
            className="bg-gray-900 text-white px-3 py-1.5 rounded-full text-xs font-medium"
          >
            추천 코스
          </button>
        </div>

        {/* Tab */}
        <div className="flex bg-gray-100 rounded-2xl p-1 gap-1">
          {(["map", "courses"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
              }`}
            >
              {tab === "map" ? "🗺 지도" : "✨ 코스"}
            </button>
          ))}
        </div>
      </div>

      {/* Map Screen */}
      {activeTab === "map" && (
        <div className="flex-1 relative">
          {/* Map fills entire screen */}
          <div className="absolute inset-0">
            <KakaoMap
              places={filteredPlaces}
              onPlaceSelect={handlePlaceSelect}
              selectedPlaceId={selectedPlace?.id}
            />
          </div>

          {/* Category Filter — floats above map at bottom */}
          <div className="absolute bottom-4 left-0 right-0 z-10">
            <CategoryFilter activeCategory={activeCategory} onChange={handleCategoryChange} />
          </div>

          {/* Place Count Badge */}
          <div className="absolute top-[138px] left-4 z-10">
            <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-gray-700 shadow-sm border border-gray-100">
              장소 {filteredPlaces.length}개
            </div>
          </div>

          {/* Bottom Sheet */}
          {selectedPlace && (
            <PlaceBottomSheet
              place={selectedPlace}
              onClose={() => setSelectedPlace(null)}
            />
          )}
        </div>
      )}

      {/* Course List Screen */}
      {activeTab === "courses" && (
        <div className="flex-1 overflow-y-auto pt-[130px] pb-6 px-4 space-y-4">
          <p className="text-sm text-gray-500">총 {ikseonCourses.length}개의 추천 코스</p>
          {ikseonCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onClick={() => router.push(`/course/${course.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
