"use client";

import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import "leaflet/dist/leaflet.css";

export type MapPoint = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  href: string;
  rating?: number | null;
  city?: string | null;
};

const icon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:16px;height:16px;border-radius:999px;background:#2F8F3A;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></span>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const activeIcon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:22px;height:22px;border-radius:999px;background:#1B3A4B;border:3px solid #E8A838;box-shadow:0 2px 8px rgba(0,0,0,.4)"></span>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

function Fit({ points, activeId }: { points: MapPoint[]; activeId?: string | null }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    const active = points.find((p) => p.id === activeId);
    if (active) {
      map.flyTo([active.lat, active.lng], 10, { duration: 0.4 });
      return;
    }
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds.pad(0.35), { maxZoom: 8, padding: [28, 28] });
  }, [map, points, activeId]);
  return null;
}

export default function DirectoryMap({
  points,
  activeId,
}: {
  points: MapPoint[];
  activeId?: string | null;
}) {
  const center: [number, number] = points[0] ? [points[0].lat, points[0].lng] : [27.8, -81.7];

  return (
    <MapContainer center={center} zoom={7} minZoom={5} maxZoom={12} scrollWheelZoom className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <Fit points={points} activeId={activeId} />
      {points.map((point) => (
        <Marker
          key={point.id}
          position={[point.lat, point.lng]}
          icon={point.id === activeId ? activeIcon : icon}
        >
          <Popup>
            <div className="min-w-40">
              <p className="font-semibold">{point.name}</p>
              {point.city ? <p className="text-xs opacity-70">{point.city}</p> : null}
              {point.rating ? <p className="text-xs">★ {point.rating.toFixed(1)}</p> : null}
              <Link href={point.href} className="text-xs font-semibold underline">
                View profile
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
