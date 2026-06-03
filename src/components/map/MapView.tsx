"use client";
import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import type { Activity } from "@/types";

interface MapViewProps {
  activities: Activity[];
  userLat?: number | null;
  userLng?: number | null;
  onActivityClick?: (activity: Activity) => void;
  selectedId?: string | null;
}

const PARIS_CENTER: [number, number] = [48.8566, 2.3522];

const CATEGORY_COLORS: Record<string, string> = {
  soirees: "#9333ea",
  concerts: "#e11d48",
  expositions: "#0ea5e9",
  restaurants: "#f97316",
  bars: "#eab308",
  sport: "#22c55e",
  culture: "#6366f1",
  famille: "#14b8a6",
  etudiants: "#3b82f6",
  networking: "#8b5cf6",
  loisirs: "#ec4899",
};

export default function MapView({ activities, userLat, userLng, onActivityClick, selectedId }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Marker[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const init = async () => {
      const L = (await import("leaflet")).default;
      if (mapInstanceRef.current) return;

      const map = L.map(mapRef.current!, {
        center: PARIS_CENTER,
        zoom: 13,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    };

    init();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const run = async () => {
      const L = (await import("leaflet")).default;
      const map = mapInstanceRef.current;
      if (!map) return;

      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      activities.forEach((activity) => {
        const color = CATEGORY_COLORS[activity.category] || "#1B3A6B";
        const isSelected = activity.id === selectedId;
        const size = isSelected ? 40 : 32;

        const icon = L.divIcon({
          html: `<div style="
            width:${size}px;height:${size}px;
            background:${color};
            border:3px solid ${isSelected ? "#fff" : "rgba(255,255,255,0.8)"};
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            box-shadow:0 2px 8px rgba(0,0,0,0.3);
            display:flex;align-items:center;justify-content:center;
          "></div>`,
          className: "",
          iconSize: [size, size],
          iconAnchor: [size / 2, size],
          popupAnchor: [0, -size],
        });

        const marker = L.marker([activity.lat, activity.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width:180px;padding:4px">
              <strong style="font-size:14px">${activity.title}</strong><br/>
              <span style="color:#666;font-size:12px">${activity.address}</span><br/>
              <span style="font-size:12px">${activity.date} ${activity.time?.slice(0,5)}</span>
            </div>
          `);

        marker.on("click", () => onActivityClick?.(activity));
        markersRef.current.push(marker);
      });
    };
    run();
  }, [activities, selectedId, onActivityClick]);

  useEffect(() => {
    if (!mapInstanceRef.current || !userLat || !userLng) return;
    const run = async () => {
      const map = mapInstanceRef.current;
      if (!map) return;
      const L = (await import("leaflet")).default;
      const icon = L.divIcon({
        html: `<div style="width:16px;height:16px;background:#1B3A6B;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(27,58,107,0.3)"></div>`,
        className: "",
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      L.marker([userLat, userLng], { icon }).addTo(map);
      map.setView([userLat, userLng], 14);
    };
    run();
  }, [userLat, userLng]);

  return <div ref={mapRef} className="w-full h-full" />;
}
