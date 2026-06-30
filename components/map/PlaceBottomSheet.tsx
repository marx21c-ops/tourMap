"use client";

import { IkseonPlace, CATEGORY_COLORS, CATEGORY_LABELS, CATEGORY_EMOJIS } from "@/types";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Props {
  place: IkseonPlace | null;
  onClose: () => void;
}

export default function PlaceBottomSheet({ place, onClose }: Props) {
  const router = useRouter();

  if (!place) return null;

  const color = CATEGORY_COLORS[place.category];

  return (
    <>
      <div
        className="absolute inset-0 z-20"
        onClick={onClose}
        style={{ background: "transparent" }}
      />
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-3xl shadow-2xl animate-slide-up max-h-[55%] overflow-y-auto">
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-4" />

        {place.imageUrl && (
          <div className="relative h-36 mx-4 rounded-2xl overflow-hidden mb-4">
            <Image src={place.imageUrl} alt={place.name} fill className="object-cover" />
          </div>
        )}

        <div className="px-5 pb-6">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: color }}
            >
              {CATEGORY_EMOJIS[place.category]} {CATEGORY_LABELS[place.category]}
            </span>
            {place.paid && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                유료
              </span>
            )}
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-1">{place.name}</h2>
          <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
            <span>📍</span> {place.address}
          </p>

          <p className="text-sm text-gray-700 mb-4">{place.shortDescription}</p>

          <div className="bg-amber-50 rounded-2xl p-4 mb-4">
            <p className="text-xs text-amber-600 font-semibold mb-1">🎙 도슨트 질문</p>
            <p className="text-sm font-medium text-gray-800 mb-2">{place.question}</p>
            <p className="text-sm text-gray-600">{place.shortAnswer}</p>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500 mb-5">
            <span>⏱ 약 {place.estimatedStayMinutes}분</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                const url = `https://map.kakao.com/link/map/${place.name},${place.lat},${place.lng}`;
                window.open(url, "_blank");
              }}
              className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-medium text-gray-700 bg-white"
            >
              길찾기
            </button>
            <button
              onClick={() => router.push(`/course/c01?startPlace=${place.id}`)}
              className="flex-1 py-3 rounded-2xl text-sm font-medium text-white"
              style={{ backgroundColor: color }}
            >
              코스 시작하기
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
