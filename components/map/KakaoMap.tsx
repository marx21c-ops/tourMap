"use client";

import { useEffect, useRef, useState } from "react";
import { IkseonPlace, CATEGORY_COLORS, IKSEON_CENTER } from "@/types";

interface Props {
  places: IkseonPlace[];
  onPlaceSelect: (place: IkseonPlace) => void;
  selectedPlaceId?: string | null;
}

const EMOJI: Record<string, string> = {
  hanok: "🏛️", cafe: "☕", food: "🍜", photo: "📸", workshop: "🎨", culture: "🏯",
};

function markerHTML(place: IkseonPlace, isSelected: boolean) {
  const color = CATEGORY_COLORS[place.category];
  const size = isSelected ? 44 : 36;
  const font = isSelected ? 18 : 14;
  return `<div style="width:${size}px;height:${size}px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;cursor:pointer;"><span style="transform:rotate(45deg);font-size:${font}px;line-height:1;">${EMOJI[place.category]}</span></div>`;
}

export default function KakaoMap({ places, onPlaceSelect, selectedPlaceId }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null);
  const overlaysRef = useRef<kakao.maps.CustomOverlay[]>([]);
  const myLocRef = useRef<kakao.maps.CustomOverlay | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize map once
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || mapInstanceRef.current) return;

      try {
        const map = new window.kakao.maps.Map(mapRef.current, {
          center: new window.kakao.maps.LatLng(IKSEON_CENTER.lat, IKSEON_CENTER.lng),
          level: 3,
        });
        mapInstanceRef.current = map;
        setLoading(false);

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude: lat, longitude: lng } = pos.coords;
              if (myLocRef.current) myLocRef.current.setMap(null);
              myLocRef.current = new window.kakao.maps.CustomOverlay({
                position: new window.kakao.maps.LatLng(lat, lng),
                content: `<div style="width:20px;height:20px;background:#3B82F6;border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(59,130,246,0.3);"></div>`,
                map,
                yAnchor: 0.5,
              });
              map.panTo(new window.kakao.maps.LatLng(lat, lng));
            },
            () => {}
          );
        }
      } catch (e) {
        setMapError("지도 초기화 실패: " + String(e));
        setLoading(false);
      }
    };

    if (window.kakao?.maps) {
      initMap();
      return;
    }

    const key = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
    if (!key) {
      setMapError("KAKAO_MAP_KEY 환경변수 없음");
      setLoading(false);
      return;
    }

    const existing = document.querySelector('script[src*="dapi.kakao.com"]');
    if (existing) {
      existing.addEventListener("load", initMap);
      return;
    }

    const script = document.createElement("script");
    // autoload=false 없이 로드 — SDK가 준비되면 kakao.maps 즉시 사용 가능
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}`;
    script.async = true;
    script.onload = initMap;
    script.onerror = () => {
      setMapError(`SDK 로드 실패 (키: ${key?.slice(0, 8)}...)`);
      setLoading(false);
    };
    document.head.appendChild(script);
  }, []);

  // Update markers when places or selection changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    overlaysRef.current.forEach((o) => o.setMap(null));
    overlaysRef.current = [];

    places.forEach((place) => {
      const isSelected = place.id === selectedPlaceId;
      const overlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(place.lat, place.lng),
        content: markerHTML(place, isSelected),
        map,
        yAnchor: 1,
      });
      const el = (overlay as unknown as { a: HTMLElement }).a;
      if (el) el.addEventListener("click", () => onPlaceSelect(place));
      overlaysRef.current.push(overlay);
    });
  }, [places, selectedPlaceId, onPlaceSelect]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      {loading && !mapError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 gap-3">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">지도 불러오는 중...</p>
        </div>
      )}
      {mapError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 gap-2 px-6">
          <p className="text-red-600 font-semibold text-sm text-center">지도 오류</p>
          <p className="text-red-500 text-xs text-center">{mapError}</p>
        </div>
      )}
    </div>
  );
}
