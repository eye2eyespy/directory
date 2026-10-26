"use client";

import dynamic from "next/dynamic";
import type { MapPoint } from "@/components/map/DirectoryMap";

const DirectoryMap = dynamic(() => import("@/components/map/DirectoryMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-[#d7e0d4]" />,
});

export function MapSlot({
  points,
  activeId,
}: {
  points: MapPoint[];
  activeId?: string | null;
}) {
  return <DirectoryMap points={points} activeId={activeId} />;
}
