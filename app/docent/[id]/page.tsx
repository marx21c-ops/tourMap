"use client";

import { use, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import Image from "next/image";
import { getCourseById } from "@/data/courses";
import { getPlaceById } from "@/data/ikseonPlaces";
import { CATEGORY_COLORS, CATEGORY_LABELS, CATEGORY_EMOJIS } from "@/types";
import FollowUpQuestions from "@/components/docent/FollowUpQuestions";

export default function DocentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const course = getCourseById(id);

  const [step, setStep] = useState(0);
  const [selectedFollowUp, setSelectedFollowUp] = useState<string | null>(null);

  if (!course) notFound();

  const places = course.placeIds.map(getPlaceById).filter(Boolean);
  const totalSteps = places.length;
  const currentPlace = places[step];

  if (!currentPlace) notFound();

  const color = CATEGORY_COLORS[currentPlace.category];
  const progress = ((step + 1) / totalSteps) * 100;
  const isLast = step === totalSteps - 1;

  const handleNext = () => {
    if (isLast) {
      router.push("/");
    } else {
      setStep((s) => s + 1);
      setSelectedFollowUp(null);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep((s) => s - 1);
      setSelectedFollowUp(null);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-dvh bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white px-4 pt-safe pt-4 pb-3 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => router.back()}
            className="text-gray-500 text-sm flex items-center gap-1"
          >
            ← 나가기
          </button>
          <span className="text-xs text-gray-400 font-medium">
            {step + 1} / {totalSteps}
          </span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: color }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1.5 font-medium">{course.title}</p>
      </div>

      <div className="flex-1 overflow-y-auto pb-36">
        {/* Place Hero */}
        <div className="relative h-52 w-full">
          {currentPlace.imageUrl ? (
            <Image src={currentPlace.imageUrl} alt={currentPlace.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full" style={{ backgroundColor: color + "33" }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: color }}
              >
                {CATEGORY_EMOJIS[currentPlace.category]} {CATEGORY_LABELS[currentPlace.category]}
              </span>
              <span className="text-white/70 text-xs">⏱ 약 {currentPlace.estimatedStayMinutes}분</span>
            </div>
            <h2 className="text-xl font-bold text-white">{currentPlace.name}</h2>
            <p className="text-white/80 text-xs mt-0.5">📍 {currentPlace.address}</p>
          </div>
        </div>

        <div className="px-4 pt-5 space-y-4">
          {/* Step Indicator */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            {places.map((p, i) => (
              <button
                key={i}
                onClick={() => { setStep(i); setSelectedFollowUp(null); }}
                className={`flex-shrink-0 w-7 h-7 rounded-full text-xs font-bold transition-all ${
                  i === step
                    ? "text-white scale-110"
                    : i < step
                    ? "bg-gray-200 text-gray-600"
                    : "bg-gray-100 text-gray-400"
                }`}
                style={i === step ? { backgroundColor: color } : undefined}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* Docent Q&A */}
          <div className="bg-white rounded-3xl p-5 shadow-sm animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative w-8 h-8 rounded-full overflow-hidden">
                <Image src={course.docentAvatar} alt={course.docentName} fill className="object-cover" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">{course.docentName}</p>
                <p className="text-xs text-gray-400">AI 도슨트</p>
              </div>
            </div>

            <h3 className="text-base font-bold text-gray-900 mb-3 leading-snug">
              {selectedFollowUp ?? currentPlace.question}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {selectedFollowUp
                ? `${selectedFollowUp}에 관한 이야기를 들려드릴게요. ${currentPlace.shortAnswer}`
                : currentPlace.shortAnswer}
            </p>
          </div>

          {/* Follow-up Questions */}
          {!selectedFollowUp && (
            <FollowUpQuestions
              questions={currentPlace.followUpQuestions}
              onSelect={(q) => setSelectedFollowUp(q)}
            />
          )}

          {/* Short Description */}
          <div className="bg-white rounded-3xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 mb-2">장소 소개</p>
            <p className="text-sm text-gray-700 leading-relaxed">{currentPlace.shortDescription}</p>
            <div className="flex gap-1.5 flex-wrap mt-3">
              {currentPlace.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Map Link */}
          <button
            onClick={() => {
              const url = `https://map.kakao.com/link/map/${currentPlace.name},${currentPlace.lat},${currentPlace.lng}`;
              window.open(url, "_blank");
            }}
            className="w-full py-3 rounded-2xl border border-gray-200 text-sm text-gray-600 bg-white"
          >
            📍 지도에서 위치 보기
          </button>
        </div>
      </div>

      {/* Fixed Navigation */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 pb-safe pb-6 pt-4 bg-gradient-to-t from-white via-white to-transparent">
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={handlePrev}
              className="flex-1 py-4 rounded-3xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white"
            >
              ← 이전 장소
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-[2] py-4 rounded-3xl text-sm font-semibold flex items-center justify-center gap-2"
            style={{ backgroundColor: isLast ? "#111827" : color }}
          >
            {isLast ? (
              <>
                <span className="text-white">코스 완료하기 🎉</span>
              </>
            ) : (
              <>
                <span className="text-white">다음 장소</span>
                <span style={{ color: "#A3E635" }}>→</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
