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

type BottomTab = "home" | "docent" | "nearby" | "mypage";

const NAV_H = 56; // px, bottom nav button area (safe area handled separately)

export default function HomePage() {
  const router = useRouter();

  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedPlace, setSelectedPlace] = useState<IkseonPlace | null>(null);
  const [bottomTab, setBottomTab] = useState<BottomTab>("home");

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [arrived, setArrived] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  const filteredPlaces = getPlacesByCategory(activeCategory);

  const coursePlaces = useMemo(
    () =>
      activeCourse
        ? (activeCourse.placeIds.map(getPlaceById).filter(Boolean) as IkseonPlace[])
        : [],
    [activeCourse]
  );

  const currentPlace = coursePlaces[currentStep] ?? null;

  const distanceToTarget = useMemo(() => {
    if (!userLocation || !currentPlace) return null;
    return haversineDistance(userLocation.lat, userLocation.lng, currentPlace.lat, currentPlace.lng);
  }, [userLocation, currentPlace]);

  useEffect(() => {
    if (!isNavigating || !distanceToTarget || arrived) return;
    if (distanceToTarget <= 50) setArrived(true);
  }, [isNavigating, distanceToTarget, arrived]);

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
    setBottomTab("home");
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
    setBottomTab("docent");
  }, []);

  const navBottomOffset = `calc(${NAV_H}px + env(safe-area-inset-bottom))`;

  return (
    <div className="relative w-full h-dvh flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div
        className="absolute top-0 left-0 right-0 z-10 px-5 pb-4 bg-white"
        style={{ paddingTop: "max(env(safe-area-inset-top), 1rem)" }}
      >
        <div className="flex items-center justify-between">
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
      </div>

      {/* Map / Home Screen */}
      {bottomTab === "home" && (
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

          {!activeCourse && (
            <>
              <div
                className="absolute left-0 right-0 z-10"
                style={{ bottom: `calc(${navBottomOffset} + 8px)` }}
              >
                <CategoryFilter activeCategory={activeCategory} onChange={handleCategoryChange} />
              </div>
              <div
                className="absolute left-5 z-10"
                style={{ top: "calc(max(env(safe-area-inset-top), 1rem) + 92px)" }}
              >
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
                  bottomOffset={navBottomOffset}
                />
              )}
            </>
          )}

          {/* Course preview bottom bar */}
          {activeCourse && !isNavigating && (
            <div
              className="absolute left-0 right-0 z-30 bg-white px-5 py-4"
              style={{ bottom: navBottomOffset, boxShadow: "0 -4px 24px rgba(0,0,0,0.10)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="flex gap-1.5">
                  {coursePlaces.map((_, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white border-2 border-white font-bold"
                      style={{ backgroundColor: "#151613", fontSize: 10 }}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
                <span className="text-xs" style={{ color: "#7C807B" }}>
                  총 {activeCourse.placeCount}개 장소 · {activeCourse.duration}
                </span>
              </div>
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
              navHeight={NAV_H}
            />
          )}
        </div>
      )}

      {/* Docent / Course List Screen */}
      {bottomTab === "docent" && (
        <div
          className="flex-1 min-h-0 overflow-y-auto px-5 space-y-6"
          style={{
            paddingTop: "calc(max(env(safe-area-inset-top), 1rem) + 84px)",
            paddingBottom: `calc(${NAV_H}px + env(safe-area-inset-bottom) + 24px)`,
          }}
        >
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

      {/* Nearby placeholder */}
      {bottomTab === "nearby" && (
        <div className="flex-1 flex items-center justify-center" style={{ paddingBottom: `${NAV_H}px` }}>
          <div className="text-center">
            <p className="text-5xl mb-4">📡</p>
            <p className="text-base font-semibold" style={{ color: "#151613" }}>내 주변</p>
            <p className="text-sm mt-2" style={{ color: "#7C807B" }}>곧 서비스될 예정이에요</p>
          </div>
        </div>
      )}

      {/* My Page placeholder */}
      {bottomTab === "mypage" && (
        <div className="flex-1 flex items-center justify-center" style={{ paddingBottom: `${NAV_H}px` }}>
          <div className="text-center">
            <p className="text-5xl mb-4">👤</p>
            <p className="text-base font-semibold" style={{ color: "#151613" }}>마이페이지</p>
            <p className="text-sm mt-2" style={{ color: "#7C807B" }}>곧 서비스될 예정이에요</p>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 bg-white"
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
          boxShadow: "0 -1px 0 rgba(0,0,0,0.08)",
        }}
      >
        <div className="flex" style={{ height: `${NAV_H}px` }}>
          {(
            [
              { id: "home" as BottomTab, label: "홈", Icon: HomeIcon },
              { id: "docent" as BottomTab, label: "도슨트", Icon: DocentIcon },
              { id: "nearby" as BottomTab, label: "내 주변", Icon: NearbyIcon },
              { id: "mypage" as BottomTab, label: "마이페이지", Icon: MypageIcon },
            ] as const
          ).map(({ id, label, Icon }) => {
            const active = bottomTab === id;
            const color = active ? "#7C3AED" : "#9CA3AF";
            return (
              <button
                key={id}
                onClick={() => setBottomTab(id)}
                className="flex-1 flex flex-col items-center justify-center gap-0.5"
              >
                <Icon color={color} />
                <span className="text-[10px] font-medium" style={{ color }}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

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

function HomeIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DocentIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
      <path d="M12 7V12L15 14" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function NearbyIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="16" width="4" height="5" rx="1" fill={color} />
      <rect x="10" y="11" width="4" height="10" rx="1" fill={color} />
      <rect x="17" y="5" width="4" height="16" rx="1" fill={color} />
    </svg>
  );
}

function MypageIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.8" />
      <path
        d="M4 20C4 17 7.6 14 12 14C16.4 14 20 17 20 20"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
