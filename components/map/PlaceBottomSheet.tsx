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
        <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-4" style={{ backgroundColor: "#E2E2E2" }} />

        {place.imageUrl && (
          <div className="relative h-36 mx-5 rounded-xl overflow-hidden mb-4">
            <Image src={place.imageUrl} alt={place.name} fill sizes="100vw" className="object-cover" />
          </div>
        )}

        <div className="px-5 pb-6">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: color }}
            >
              {CATEGORY_EMOJIS[place.category]} {CATEGORY_LABELS[place.category]}
            </span>
            {place.paid && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: "#F3F4F5", color: "#7C807B" }}>
                유료
              </span>
            )}
          </div>

          <h2 className="text-lg font-semibold mb-1" style={{ color: "#151613" }}>{place.name}</h2>
          <p className="text-sm mb-3 flex items-center gap-1" style={{ color: "#7C807B" }}>
            <span>📍</span> {place.address}
          </p>

          <p className="text-sm mb-4 leading-relaxed" style={{ color: "#151613" }}>{place.shortDescription}</p>

          <div className="rounded-2xl p-4 mb-4" style={{ backgroundColor: "#EEF1EE" }}>
            <p className="text-xs font-semibold mb-1" style={{ color: "#151613" }}>🎙 도슨트 질문</p>
            <p className="text-sm font-medium mb-2" style={{ color: "#151613" }}>{place.question}</p>
            <p className="text-sm" style={{ color: "#7C807B" }}>{place.shortAnswer}</p>
          </div>

          <div className="flex items-center gap-2 text-xs mb-5" style={{ color: "#7C807B" }}>
            <span>⏱ 약 {place.estimatedStayMinutes}분</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                const url = `https://map.kakao.com/link/map/${place.name},${place.lat},${place.lng}`;
                window.open(url, "_blank");
              }}
              className="flex-1 py-3 rounded-xl text-sm font-medium border"
              style={{ borderColor: "#151613", color: "#151613", backgroundColor: "#FFFFFF" }}
            >
              길찾기
            </button>
            <button
              onClick={() => router.push(`/course/c01?startPlace=${place.id}`)}
              className="flex-1 py-3 rounded-xl text-sm font-medium text-white"
              style={{ backgroundColor: "#151613" }}
            >
              코스 시작하기
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
