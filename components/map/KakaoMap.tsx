"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { IkseonPlace, Course, CATEGORY_COLORS, IKSEON_CENTER } from "@/types";
import CourseRouteControl from "./CourseRouteControl";

interface Props {
  places: IkseonPlace[];
  onPlaceSelect: (place: IkseonPlace) => void;
  selectedPlaceId?: string | null;
  activeCourse?: Course | null;
  coursePlaces?: IkseonPlace[];
  currentStep?: number;
  isNavigating?: boolean;
  onLocationUpdate?: (lat: number, lng: number) => void;
}

const EMOJI: Record<string, string> = {
  hanok: "🏛️", cafe: "☕", food: "🍜", photo: "📸", workshop: "🎨", culture: "🏯",
};

function createMarkerIcon(place: IkseonPlace, isSelected: boolean) {
  const color = CATEGORY_COLORS[place.category];
  const size = isSelected ? 44 : 36;
  const font = isSelected ? 18 : 14;
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;cursor:pointer;"><span style="transform:rotate(45deg);font-size:${font}px;line-height:1;">${EMOJI[place.category]}</span></div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  });
}

function UserLocationControl({
  onLocationUpdate,
  isNavigating,
}: {
  onLocationUpdate?: (lat: number, lng: number) => void;
  isNavigating?: boolean;
}) {
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    const locationIcon = L.divIcon({
      html: `<div style="width:20px;height:20px;background:#99F950;border-radius:50%;border:3px solid white;box-shadow:0 0 0 3px #151613,0 2px 10px rgba(0,0,0,0.35);"></div>`,
      className: "",
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    const placeMarker = (lat: number, lng: number) => {
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { icon: locationIcon }).addTo(map);
      }
      onLocationUpdate?.(lat, lng);
    };

    let watchId: number | null = null;

    if (isNavigating) {
      // Continuous tracking during navigation
      watchId = navigator.geolocation?.watchPosition(
        (pos) => placeMarker(pos.coords.latitude, pos.coords.longitude),
        () => {},
        { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
      ) ?? null;
    } else {
      // One-shot on load
      navigator.geolocation?.getCurrentPosition(
        (pos) => placeMarker(pos.coords.latitude, pos.coords.longitude),
        () => {}
      );
    }

    // 📍 button
    const btn = document.createElement("button");
    btn.innerHTML = "📍";
    btn.title = "내 위치 보기";
    btn.style.cssText =
      "position:absolute;bottom:140px;right:12px;z-index:900;background:white;border:none;border-radius:50%;width:44px;height:44px;font-size:20px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;";
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      navigator.geolocation?.getCurrentPosition(
        (pos) => {
          placeMarker(pos.coords.latitude, pos.coords.longitude);
          map.flyTo([pos.coords.latitude, pos.coords.longitude], 17);
        },
        () => {}
      );
    });
    map.getContainer().appendChild(btn);

    return () => {
      if (watchId !== null) navigator.geolocation?.clearWatch(watchId);
      btn.remove();
      markerRef.current?.remove();
      markerRef.current = null;
    };
  }, [map, isNavigating, onLocationUpdate]);

  return null;
}

export default function KakaoMap({
  places,
  onPlaceSelect,
  selectedPlaceId,
  activeCourse,
  coursePlaces = [],
  currentStep = 0,
  isNavigating = false,
  onLocationUpdate,
}: Props) {
  return (
    <MapContainer
      center={[IKSEON_CENTER.lat, IKSEON_CENTER.lng]}
      zoom={17}
      style={{ width: "100%", height: "100%" }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <UserLocationControl onLocationUpdate={onLocationUpdate} isNavigating={isNavigating} />

      {activeCourse ? (
        <CourseRouteControl
          places={coursePlaces}
          currentStep={currentStep}
          isNavigating={isNavigating}
        />
      ) : (
        places.map((place) => (
          <Marker
            key={`${place.id}-${place.id === selectedPlaceId}`}
            position={[place.lat, place.lng]}
            icon={createMarkerIcon(place, place.id === selectedPlaceId)}
            eventHandlers={{ click: () => onPlaceSelect(place) }}
          />
        ))
      )}
    </MapContainer>
  );
}
