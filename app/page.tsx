"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { IkseonPlace, Course } from "@/types";
import { ikseonPlaces, getPlacesByCategory, getPlaceById } from "@/data/ikseonPlaces";
import { ikseonCourses } from "@/data/courses";
import { haversineDistance, formatDistance } from "@/lib/geo";
import CategoryFilter from "@/components/map/CategoryFilter";
import PlaceBottomSheet from "@/components/map/PlaceBottomSheet";
import CourseCard from "@/components/course/CourseCard";
import CourseNavGuide from "@/components/navigation/CourseNavGuide";

const KakaoMap = dynamic(() => import("@/components/map/KakaoMap"), { ssr: false });

type Tab = "map" | "courses";

export default function HomePage() {
  const router = useRouter();

  // Map / place state
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedPlace, setSelectedPlace] = useState<IkseonPlace | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("map");

  // User location
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Course navigation state
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [arrived, setArrived] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  const filteredPlaces = getPlacesByCategory(activeCategory);

  // Places for the active course (in order)
  const coursePlaces = useMemo(
    () =>
      activeCourse
        ? (activeCourse.placeIds.map(getPlaceById).filter(Boolean) as IkseonPlace[])
        : [],
    [activeCourse]
  );

  const currentPlace = coursePlaces[currentStep] ?? null;

  // Distance from user to current target
  const distanceToTarget = useMemo(() => {
    if (!userLocation || !currentPlace) return null;
    return haversineDistance(userLocation.lat, userLocation.lng, currentPlace.lat, currentPlace.lng);
  }, [userLocation, currentPlace]);

  // Proximity detection — auto-flag arrival at 50m
  useEffect(() => {
    if (!isNavigating || !distanceToTarget || arrived) return;
    if (distanceToTarget <= 50) setArrived(true);
  }, [isNavigating, distanceToTarget, arrived]);

  // Courses sorted by proximity to user
  const sortedCourses = useMemo(() => {
    if (!userLocation) return ikseonCourses;
    return [...ikseonCourses].sort((a, b) => {
      const nearest = (course: Course) =>
        Math.min(
          ...course.placeIds.map((id) => {
            const p = getPlaceById(id);
            return p
              ? haversineDistance(userLocation.lat, userLocation.lng, p.lat, p.lng)
              : Infinity;
          })
        );
      return nearest(a) - nearest(b);
    });
  }, [userLocation]);

  // Nearest distance per course (for label in list)
  const nearestDistByCourse = useMemo((): Record<string, number> => {
    if (!userLocation) return {};
    return Object.fromEntries(
      ikseonCourses.map((course) => {
        const dist = Math.min(
          ...course.placeIds.map((id) => {
            const p = getPlaceById(id);
            return p
              ? haversineDistance(userLocation.lat, userLocation.lng, p.lat, p.lng)
              : Infinity;
          })
        );
        return [course.id, dist];
      })
    );
  }, [userLocation]);

  const handleLocationUpdate = useCallback((lat: number, lng: number) => {
    setUserLocation({ lat, lng });
  }, []);

  const handlePlaceSelect = useCallback((place: IkseonPlace) => {
    setSelectedPlace(place);
  }, []);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setSelectedPlace(null);
  };

  const handleCourseSelect = useCallback((course: Course) => {
    setActiveCourse(course);
    setCurrentStep(0);
    setIsNavigating(false);
    setArrived(false);
    setShowComplete(false);
    setSelectedPlace(null);
    setActiveTab("map");
  }, []);

  const handleStartNavigation = useCallback(() => {
    setIsNavigating(true);
    setCurrentStep(0);
    setArrived(false);
  }, []);

  const handleNextStep = useCallback(() => {
    if (!activeCourse) return;
    if (currentStep >= activeCourse.placeCount - 1) {
      setIsNavigating(false);
      setActiveCourse(null);
      setCurrentStep(0);
      setArrived(false);
      setShowComplete(true);
    } else {
      setCurrentStep((prev) => prev + 1);
      setArrived(false);
    }
  }, [activeCourse, currentStep]);

  const handleExitNavigation = useCallback(() => {
    setIsNavigating(false);
    setArrived(false);
  }, []);

  const handleExitCourse = useCallback(() => {
    setActiveCourse(null);
    setCurrentStep(0);
    setIsNavigating(false);
    setArrived(false);
  }, []);

  const handleBackToCourses = useCallback(() => {
    setActiveCourse(null);
    setCurrentStep(0);
    setIsNavigating(false);
    setArrived(false);
    setActiveTab("courses");
  }, []);

  return (
    <div className="relative w-full h-dvh flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 px-5 pb-3 bg-white" style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            {activeCourse ? (
              <>
                <p className="text-xs font-medium" style={{ color: "#7C807B" }}>
                  {isNavigating ? "코스 내비게이션" : "코스 미리보기"}
                </p>
                <h1 className="text-lg font-semibold truncate pr-2" style={{ color: "#151613" }}>
                  {activeCourse.title}
                </h1>
              </>
            ) : (
              <>
                <p className="text-xs font-medium" style={{ color: "#7C807B" }}>서울 · 종로구 익선동</p>
                <h1 className="text-xl font-semibold" style={{ color: "#151613" }}>어디를 둘러볼까요?</h1>
              </>
            )}
          </div>
          {activeCourse && (
            <button
              onClick={handleExitCourse}
              className="px-4 py-2 rounded-xl text-xs font-medium border"
              style={{ borderColor: "#E2E2E2", color: "#7C807B", backgroundColor: "#FFFFFF" }}
            >
              코스 종료
            </button>
          )}
        </div>

        {/* Tab */}
        <div className="flex rounded-2xl p-1 gap-1" style={{ backgroundColor: "#F3F4F5" }}>
          {(["map", "courses"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
              style={
                activeTab === tab
                  ? { backgroundColor: "#151613", color: "#FFFFFF" }
                  : { color: "#7C807B" }
              }
            >
              {tab === "map" ? "🗺 지도" : "✨ 코스 추천"}
            </button>
          ))}
        </div>
      </div>

      {/* Map Screen */}
      {activeTab === "map" && (
        <div className="flex-1 relative">
          <div className="absolute inset-0 isolate">
            <KakaoMap
              places={activeCourse ? [] : filteredPlaces}
              onPlaceSelect={handlePlaceSelect}
              selectedPlaceId={selectedPlace?.id}
              activeCourse={activeCourse}
              coursePlaces={coursePlaces}
              currentStep={currentStep}
              isNavigating={isNavigating}
              onLocationUpdate={handleLocationUpdate}
            />
          </div>

          {/* Normal map: category filter + place count badge */}
          {!activeCourse && (
            <>
              <div className="absolute bottom-4 left-0 right-0 z-10">
                <CategoryFilter activeCategory={activeCategory} onChange={handleCategoryChange} />
              </div>
              <div className="absolute top-[144px] left-5 z-10">
                <div
                  className="rounded-full px-3 py-1.5 text-xs font-medium shadow-sm"
                  style={{ backgroundColor: "#151613", color: "#FFFFFF" }}
                >
                  장소 {filteredPlaces.length}개
                </div>
              </div>
              {selectedPlace && (
                <PlaceBottomSheet
                  place={selectedPlace}
                  onClose={() => setSelectedPlace(null)}
                />
              )}
            </>
          )}

          {/* Course preview: "코스 시작하기" bottom bar */}
          {activeCourse && !isNavigating && (
            <div
              className="absolute bottom-0 left-0 right-0 z-30 bg-white px-5 pb-safe pb-6 pt-4"
              style={{ boxShadow: "0 -4px 24px rgba(0,0,0,0.10)" }}
            >
              <div className="mb-3 space-y-1.5 max-h-36 overflow-y-auto">
                {coursePlaces.map((place, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                      style={{ backgroundColor: "#151613", fontSize: 9 }}
                    >
                      {i + 1}
                    </div>
                    <span className="text-xs truncate" style={{ color: "#151613" }}>
                      {place.name}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs mb-3" style={{ color: "#7C807B" }}>
                총 {activeCourse.placeCount}개 장소 · {activeCourse.duration}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleBackToCourses}
                  className="flex-1 py-4 rounded-xl text-sm font-semibold border"
                  style={{ borderColor: "#E2E2E2", color: "#7C807B" }}
                >
                  ← 돌아가기
                </button>
                <button
                  onClick={handleStartNavigation}
                  className="flex-[2] py-4 rounded-xl text-sm font-semibold text-white"
                  style={{ backgroundColor: "#151613" }}
                >
                  코스 출발 →
                </button>
              </div>
            </div>
          )}

          {/* Navigation guide */}
          {activeCourse && isNavigating && currentPlace && (
            <CourseNavGuide
              course={activeCourse}
              currentStep={currentStep}
              currentPlace={currentPlace}
              distanceToTarget={distanceToTarget}
              arrived={arrived}
              onNext={handleNextStep}
              onExit={handleExitNavigation}
            />
          )}
        </div>
      )}

      {/* Course List Screen */}
      {activeTab === "courses" && (
        <div className="flex-1 min-h-0 overflow-y-auto pb-6 px-5 space-y-6" style={{ paddingTop: 'calc(max(env(safe-area-inset-top), 1rem) + 114px)' }}>
          <p className="text-sm font-medium" style={{ color: "#7C807B" }}>
            {userLocation
              ? `📍 내 위치 기준 가까운 순 · 총 ${sortedCourses.length}개`
              : `총 ${ikseonCourses.length}개의 추천 코스`}
          </p>
          {sortedCourses.map((course, index) => {
            const dist = nearestDistByCourse[course.id];
            return (
              <div key={course.id}>
                <div className="flex items-center gap-2.5 mb-2">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: "#151613" }}
                  >
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold" style={{ color: "#151613" }}>
                    {course.title}
                  </span>
                </div>
                {userLocation && dist < Infinity && (
                  <p className="text-xs mb-1.5 pl-1" style={{ color: "#7C807B" }}>
                    📍 가장 가까운 장소까지 약 {formatDistance(dist)}
                  </p>
                )}
                <CourseCard course={course} onPreview={() => handleCourseSelect(course)} />
              </div>
            );
          })}
        </div>
      )}

      {/* Course complete modal */}
      {showComplete && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowComplete(false)}
        >
          <div className="bg-white rounded-3xl px-8 py-10 mx-6 text-center">
            <p className="text-5xl mb-4">🎊</p>
            <h2 className="text-xl font-semibold mb-2" style={{ color: "#151613" }}>
              코스 완주!
            </h2>
            <p className="text-sm mb-6" style={{ color: "#7C807B" }}>
              익선동 코스를 모두 둘러봤어요.
            </p>
            <button
              className="px-8 py-3 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: "#151613" }}
              onClick={() => setShowComplete(false)}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
