"use client";
import { useEffect, useRef, useState } from "react";
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
  const [mapReady, setMapReady] = useState(false);

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

      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      setMapReady(true);
    };

    init();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setMapReady(false);
      }
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    const run = async () => {
      const L = (await import("leaflet")).default;
      const map = mapInstanceRef.current;
      if (!map) return;

      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      activities.forEach((activity) => {
        const color = CATEGORY_COLORS[activity.category] || "#1B3A6B";
        const isSelected = activity.id === selectedId;
        const label = activity.title.length > 16 ? activity.title.slice(0, 16) + "…" : activity.title;

        const icon = L.divIcon({
          html: `<div style="
            background:${isSelected ? "#fff" : color};
            color:${isSelected ? color : "#fff"};
            border:2px solid ${color};
            border-radius:20px;
            padding:5px 11px;
            font-size:11px;
            font-weight:700;
            white-space:nowrap;
            box-shadow:0 2px 10px rgba(0,0,0,${isSelected ? "0.28" : "0.18"});
            transform:${isSelected ? "scale(1.12)" : "scale(1)"};
            cursor:pointer;
            letter-spacing:0.01em;
            font-family:system-ui,-apple-system,sans-serif;
          ">${label}</div>`,
          className: "",
          iconAnchor: [0, 0],
          popupAnchor: [60, -8],
        });

        const priceHtml = activity.price != null
          ? `<span style="font-size:12px;font-weight:700;color:${color}">${activity.price === 0 ? "Gratuit" : activity.price + "€"}</span>`
          : "";

        const marker = L.marker([activity.lat, activity.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width:190px;padding:4px 2px;font-family:system-ui,-apple-system,sans-serif">
              <div style="font-size:13px;font-weight:700;color:#111;margin-bottom:3px;line-height:1.3">${activity.title}</div>
              <div style="font-size:11px;color:#888;margin-bottom:6px">${activity.address}</div>
              <div style="display:flex;align-items:center;justify-content:space-between">
                <span style="font-size:11px;color:#555">${activity.date} · ${activity.time?.slice(0, 5) ?? ""}</span>
                ${priceHtml}
              </div>
            </div>
          `, { maxWidth: 240 });

        marker.on("click", () => onActivityClick?.(activity));
        markersRef.current.push(marker);
      });
    };
    run();
  }, [activities, selectedId, onActivityClick, mapReady]);

  useEffect(() => {
    if (!mapInstanceRef.current || !userLat || !userLng) return;
    const run = async () => {
      const map = mapInstanceRef.current;
      if (!map) return;
      const L = (await import("leaflet")).default;
      const icon = L.divIcon({
        html: `<div style="width:14px;height:14px;background:#1B3A6B;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 4px rgba(27,58,107,0.25)"></div>`,
        className: "",
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      L.marker([userLat, userLng], { icon }).addTo(map);
      map.setView([userLat, userLng], 14);
    };
    run();
  }, [userLat, userLng]);

  return <div ref={mapRef} className="w-full h-full" />;
}
