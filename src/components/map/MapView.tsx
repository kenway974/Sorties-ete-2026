"use client";
import { useEffect, useRef, useState } from "react";
import type * as LeafletType from "leaflet";
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
const CLUSTER_RADIUS_PX = 55;

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

interface Cluster {
  activities: Activity[];
  lat: number;
  lng: number;
}

function buildClusters(activities: Activity[], map: LeafletMap): Cluster[] {
  const used = new Set<number>();
  const clusters: Cluster[] = [];

  for (let i = 0; i < activities.length; i++) {
    if (used.has(i)) continue;
    const a = activities[i];
    const ptA = map.latLngToContainerPoint([a.lat, a.lng]);
    const members: Activity[] = [a];
    used.add(i);

    for (let j = i + 1; j < activities.length; j++) {
      if (used.has(j)) continue;
      const b = activities[j];
      const ptB = map.latLngToContainerPoint([b.lat, b.lng]);
      const dx = ptA.x - ptB.x;
      const dy = ptA.y - ptB.y;
      if (Math.sqrt(dx * dx + dy * dy) < CLUSTER_RADIUS_PX) {
        members.push(b);
        used.add(j);
      }
    }

    clusters.push({
      activities: members,
      lat: members.reduce((s, m) => s + m.lat, 0) / members.length,
      lng: members.reduce((s, m) => s + m.lng, 0) / members.length,
    });
  }
  return clusters;
}

export default function MapView({
  activities,
  userLat,
  userLng,
  onActivityClick,
  selectedId,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const LRef = useRef<typeof LeafletType | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // ── Map init ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;
    let cancelled = false;

    (async () => {
      const leafletModule = await import("leaflet");
      const L = (leafletModule.default ?? leafletModule) as typeof LeafletType;
      if (cancelled || mapInstanceRef.current || !mapRef.current) return;
      LRef.current = L;

      const map = L.map(mapRef.current, { center: PARIS_CENTER, zoom: 13, zoomControl: false });
      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          maxZoom: 19,
        }
      ).addTo(map);

      mapInstanceRef.current = map;
      map.whenReady(() => { if (!cancelled) setMapReady(true); });
    })();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    };
  }, []);

  // ── Clustered markers ───────────────────────────────────────────────────
  useEffect(() => {
    const L = LRef.current;
    const map = mapInstanceRef.current;
    if (!mapReady || !L || !map) return;

    const renderMarkers = () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      const clusters = buildClusters(activities, map);

      for (const cluster of clusters) {
        const isSingle = cluster.activities.length === 1;
        const activity = cluster.activities[0];

        if (isSingle) {
          // Individual pill marker
          const color = CATEGORY_COLORS[activity.category] || "#1B3A6B";
          const isSelected = activity.id === selectedId;
          const label = activity.title.length > 17 ? activity.title.slice(0, 17) + "…" : activity.title;

          const icon = L.divIcon({
            html: `<div style="
              background:${isSelected ? "#fff" : color};color:${isSelected ? color : "#fff"};
              border:2px solid ${color};border-radius:999px;padding:4px 10px;
              font-size:11px;font-weight:700;white-space:nowrap;
              box-shadow:0 2px 8px rgba(0,0,0,${isSelected ? "0.28" : "0.18"});
              cursor:pointer;font-family:system-ui,-apple-system,sans-serif;
            ">${label}</div>`,
            className: "leaflet-pill-marker",
            iconAnchor: [0, 0],
            popupAnchor: [40, -4],
          });

          const priceHtml = activity.price != null
            ? `<span style="font-size:12px;font-weight:700;color:${color}">${activity.price === 0 ? "Gratuit" : activity.price + " €"}</span>`
            : "";

          const marker = L.marker([cluster.lat, cluster.lng], { icon })
            .addTo(map)
            .bindPopup(
              `<div style="min-width:190px;padding:4px 2px;font-family:system-ui,-apple-system,sans-serif">
                <div style="font-size:13px;font-weight:700;color:#111;margin-bottom:3px;line-height:1.3">${activity.title}</div>
                <div style="font-size:11px;color:#888;margin-bottom:6px">${activity.address}</div>
                <div style="display:flex;align-items:center;justify-content:space-between">
                  <span style="font-size:11px;color:#555">${activity.date} · ${activity.time?.slice(0, 5) ?? ""}</span>
                  ${priceHtml}
                </div>
              </div>`,
              { maxWidth: 240 }
            );
          marker.on("click", () => onActivityClick?.(activity));
          markersRef.current.push(marker);
        } else {
          // Cluster bubble
          const count = cluster.activities.length;
          const size = count < 10 ? 38 : count < 50 ? 46 : 54;
          const icon = L.divIcon({
            html: `<div style="
              width:${size}px;height:${size}px;border-radius:50%;
              background:#1B3A6B;color:#fff;
              display:flex;align-items:center;justify-content:center;
              font-size:${count < 10 ? 14 : 12}px;font-weight:800;
              box-shadow:0 2px 10px rgba(27,58,107,0.4);
              border:3px solid rgba(255,255,255,0.9);
              cursor:pointer;font-family:system-ui,-apple-system,sans-serif;
            ">${count}</div>`,
            className: "leaflet-cluster-marker",
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          });

          const marker = L.marker([cluster.lat, cluster.lng], { icon }).addTo(map);
          marker.on("click", () => {
            map.setView([cluster.lat, cluster.lng], map.getZoom() + 2, { animate: true });
          });
          markersRef.current.push(marker);
        }
      }
    };

    renderMarkers();
    map.on("zoomend moveend", renderMarkers);
    return () => { map.off("zoomend moveend", renderMarkers); };
   
  }, [activities, selectedId, onActivityClick, mapReady]);

  // ── User location dot ────────────────────────────────────────────────────
  useEffect(() => {
    const L = LRef.current;
    const map = mapInstanceRef.current;
    if (!L || !map || !userLat || !userLng) return;
    const icon = L.divIcon({
      html: `<div style="width:14px;height:14px;background:#1B3A6B;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 4px rgba(27,58,107,0.25)"></div>`,
      className: "",
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
    L.marker([userLat, userLng], { icon }).addTo(map);
    map.setView([userLat, userLng], 14);
  }, [userLat, userLng]);

  return <div ref={mapRef} className="w-full h-full" />;
}
