"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { IkseonPlace } from "@/types";

interface Props {
  places: IkseonPlace[];
  currentStep: number;
  isNavigating: boolean;
}

export default function CourseRouteControl({ places, currentStep, isNavigating }: Props) {
  const map = useMap();
  const layersRef = useRef<L.Layer[]>([]);

  useEffect(() => {
    // Clear previous layers
    layersRef.current.forEach((l) => l.remove());
    layersRef.current = [];

    if (places.length === 0) return;

    // Draw completed segments (gray)
    for (let i = 0; i < Math.min(currentStep, places.length - 1); i++) {
      const line = L.polyline(
        [[places[i].lat, places[i].lng], [places[i + 1].lat, places[i + 1].lng]],
        { color: "#C4C4C4", weight: 3, opacity: 0.7 }
      ).addTo(map);
      layersRef.current.push(line);
    }

    // Draw remaining segments (dark dashed)
    for (let i = currentStep; i < places.length - 1; i++) {
      const line = L.polyline(
        [[places[i].lat, places[i].lng], [places[i + 1].lat, places[i + 1].lng]],
        { color: "#151613", weight: 3, dashArray: "8 5", opacity: 0.85 }
      ).addTo(map);
      layersRef.current.push(line);
    }

    // Draw numbered markers
    places.forEach((place, i) => {
      const isCompleted = i < currentStep;
      const isCurrent = i === currentStep;

      const bg = isCompleted ? "#C4C4C4" : isCurrent ? "#99F950" : "#151613";
      const textColor = isCurrent ? "#151613" : "#FFFFFF";
      const size = isCurrent ? 36 : 28;
      const shadow = isCurrent
        ? "box-shadow:0 0 0 6px rgba(153,249,80,0.35),0 2px 6px rgba(0,0,0,0.25);"
        : "box-shadow:0 2px 6px rgba(0,0,0,0.25);";

      const icon = L.divIcon({
        html: `<div style="width:${size}px;height:${size}px;background:${bg};border-radius:50%;border:2.5px solid white;${shadow}display:flex;align-items:center;justify-content:center;font-size:${isCurrent ? 15 : 11}px;font-weight:700;color:${textColor};">${i + 1}</div>`,
        className: "",
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([place.lat, place.lng], { icon, zIndexOffset: isCurrent ? 100 : 0 }).addTo(map);
      layersRef.current.push(marker);
    });

    // Fit bounds when not navigating, pan to current step when navigating
    if (!isNavigating) {
      const bounds = L.latLngBounds(places.map((p) => [p.lat, p.lng] as L.LatLngExpression));
      map.fitBounds(bounds, { padding: [60, 80], animate: true });
    } else if (places[currentStep]) {
      map.panTo([places[currentStep].lat, places[currentStep].lng], { animate: true });
    }

    return () => {
      layersRef.current.forEach((l) => l.remove());
      layersRef.current = [];
    };
  }, [map, places, currentStep, isNavigating]);

  return null;
}
