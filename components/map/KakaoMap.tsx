"use client";

import { useEffect, useRef } from "react";
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
  const readyRef = useRef(false);

  // Initialize map once
  useEffect(() => {
    const init = () => {
      if (!mapRef.current || readyRef.current) return;
      readyRef.current = true;

      const map = new window.kakao.maps.Map(mapRef.current, {
        center: new window.kakao.maps.LatLng(IKSEON_CENTER.lat, IKSEON_CENTER.lng),
        level: 3,
      });
      mapInstanceRef.current = map;

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          if (myLocRef.current) myLocRef.current.setMap(null);
          myLocRef.current = new window.kakao.maps.CustomOverlay({
            position: new window.kakao.maps.LatLng(lat, lng),
            content: `<div style="width:20px;height:20px;background:#3B82F6;border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(59,130,246,0.3);"></div>`,
            map,
            yAnchor: 0.5,
          });
          map.panTo(new window.kakao.maps.LatLng(lat, lng));
        }, () => {});
      }
    };

    const tryInit = () => {
      if (window.kakao) {
        window.kakao.maps.load(init);
      } else {
        setTimeout(tryInit, 200);
      }
    };
    tryInit();
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

  return <div ref={mapRef} className="w-full h-full" />;
}
