"use client";

import { useEffect, useRef, useCallback } from "react";
import { IkseonPlace, CATEGORY_COLORS, IKSEON_CENTER } from "@/types";

interface Props {
  places: IkseonPlace[];
  onPlaceSelect: (place: IkseonPlace) => void;
  selectedPlaceId?: string | null;
}

export default function KakaoMap({ places, onPlaceSelect, selectedPlaceId }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null);
  const overlaysRef = useRef<kakao.maps.CustomOverlay[]>([]);
  const myLocationOverlayRef = useRef<kakao.maps.CustomOverlay | null>(null);

  const createMarkerContent = useCallback(
    (place: IkseonPlace, isSelected: boolean) => {
      const color = CATEGORY_COLORS[place.category];
      const size = isSelected ? 44 : 36;
      const emoji = {
        hanok: "🏛️",
        cafe: "☕",
        food: "🍜",
        photo: "📸",
        workshop: "🎨",
        culture: "🏯",
      }[place.category];

      return `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2.5px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          ${isSelected ? "box-shadow: 0 4px 16px rgba(0,0,0,0.4);" : ""}
        ">
          <span style="transform: rotate(45deg); font-size: ${isSelected ? 18 : 14}px; line-height: 1;">${emoji}</span>
        </div>
      `;
    },
    []
  );

  const initMap = useCallback(() => {
    if (!mapRef.current || !window.kakao?.maps) return;

    const map = new window.kakao.maps.Map(mapRef.current, {
      center: new window.kakao.maps.LatLng(IKSEON_CENTER.lat, IKSEON_CENTER.lng),
      level: 3,
    });
    mapInstanceRef.current = map;

    overlaysRef.current.forEach((o) => o.setMap(null));
    overlaysRef.current = [];

    places.forEach((place) => {
      const isSelected = place.id === selectedPlaceId;
      const overlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(place.lat, place.lng),
        content: createMarkerContent(place, isSelected),
        map,
        yAnchor: 1,
      });

      const el = (overlay as unknown as { a: HTMLElement }).a;
      if (el) {
        el.addEventListener("click", () => onPlaceSelect(place));
      }

      overlaysRef.current.push(overlay);
    });

    requestAnimationLocation(map);
  }, [places, selectedPlaceId, onPlaceSelect, createMarkerContent]);

  const requestAnimationLocation = (map: kakao.maps.Map) => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        if (myLocationOverlayRef.current) {
          myLocationOverlayRef.current.setMap(null);
        }
        const content = `
          <div style="
            width: 20px; height: 20px;
            background: #3B82F6;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 0 0 4px rgba(59,130,246,0.3);
          "/>
        `;
        const overlay = new window.kakao.maps.CustomOverlay({
          position: new window.kakao.maps.LatLng(lat, lng),
          content,
          map,
          yAnchor: 0.5,
        });
        myLocationOverlayRef.current = overlay;
        map.panTo(new window.kakao.maps.LatLng(lat, lng));
      },
      () => {}
    );
  };

  useEffect(() => {
    const tryInit = () => {
      if (window.kakao?.maps) {
        window.kakao.maps.load(initMap);
      } else {
        setTimeout(tryInit, 200);
      }
    };
    tryInit();
  }, [initMap]);

  return <div ref={mapRef} className="w-full h-full" />;
}
