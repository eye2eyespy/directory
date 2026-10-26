"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { List, Map as MapIcon } from "lucide-react";
import { BusinessCard } from "@/components/directory/BusinessCard";
import { businessPath } from "@/lib/utils";
import type { BusinessCardRecord } from "@/lib/queries";
import type { MapPoint } from "@/components/map/DirectoryMap";

const DirectoryMap = dynamic(() => import("@/components/map/DirectoryMap"), { ssr: false });

export function SearchExperience({
  businesses,
  mediaPriority,
  grouped = true,
}: {
  businesses: BusinessCardRecord[];
  mediaPriority: string[];
  grouped?: boolean;
}) {
  const [view, setView] = useState<"list" | "map">("list");
  const [activeId, setActiveId] = useState<string | null>(null);

  const sponsored = grouped ? businesses.filter((b) => b.sponsored) : [];
  const featured = grouped ? businesses.filter((b) => b.featured) : [];

  const points: MapPoint[] = useMemo(
    () =>
      businesses
        .filter((b) => b.latitude && b.longitude)
        .map((b) => ({
          id: b.id,
          name: b.name,
          lat: b.latitude as number,
          lng: b.longitude as number,
          href: businessPath({
            industrySlug: b.industry.slug,
            stateSlug: b.stateSlug,
            citySlug: b.citySlug,
            businessSlug: b.slug,
          }),
          rating: b.googleRating,
          city: b.city,
        })),
    [businesses],
  );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
        <p className="text-sm text-ink-soft">{businesses.length} listings</p>
        <div className="flex rounded-sm border border-line bg-white">
          <button
            type="button"
            onClick={() => setView("list")}
            className={`flex items-center gap-1 px-3 py-2 text-xs font-bold uppercase tracking-wide ${view === "list" ? "bg-navy text-paper" : ""}`}
          >
            <List className="h-3.5 w-3.5" /> List
          </button>
          <button
            type="button"
            onClick={() => setView("map")}
            className={`flex items-center gap-1 px-3 py-2 text-xs font-bold uppercase tracking-wide ${view === "map" ? "bg-navy text-paper" : ""}`}
          >
            <MapIcon className="h-3.5 w-3.5" /> Map
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.85fr)]">
        <div className={view === "map" ? "hidden lg:block" : ""}>
          {sponsored.length ? (
            <section className="mb-8">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-primary">Sponsored businesses</h2>
              <div className="space-y-4">
                {sponsored.map((business) => (
                  <div key={business.id} onMouseEnter={() => setActiveId(business.id)}>
                    <BusinessCard business={business} mediaPriority={mediaPriority} />
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {featured.length ? (
            <section className="mb-8">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-navy">Featured businesses</h2>
              <div className="space-y-4">
                {featured.map((business) => (
                  <div key={`feat-${business.id}`} onMouseEnter={() => setActiveId(business.id)}>
                    <BusinessCard business={business} mediaPriority={mediaPriority} />
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section>
            {grouped ? (
              <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-ink-soft">All results</h2>
            ) : null}
            <div className="space-y-4">
              {businesses.map((business) => (
                <div key={`all-${business.id}`} onMouseEnter={() => setActiveId(business.id)}>
                  <BusinessCard business={business} mediaPriority={mediaPriority} />
                </div>
              ))}
              {!businesses.length ? (
                <p className="rounded-sm border border-dashed border-line p-8 text-sm text-ink-soft">
                  No published listings match these filters yet.
                </p>
              ) : null}
            </div>
          </section>
        </div>

        <aside className={`sticky top-20 h-[70vh] overflow-hidden rounded-xl border border-line shadow-sm ${view === "list" ? "hidden lg:block" : "block h-[65vh]"}`}>
          <DirectoryMap points={points} activeId={activeId} />
        </aside>
      </div>
    </div>
  );
}
