import Link from "next/link";
import type { Metadata } from "next";
import { MapSlot } from "@/components/map/MapSlot";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { spotBadges } from "@/lib/swap";

export const metadata: Metadata = { title: "Meet-up spots" };

export default async function SpotsPage() {
  const settings = await getSettings();
  const spots = await prisma.swapSpot.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    include: { listings: { where: { listing: { status: "AVAILABLE" } }, select: { listingId: true } } },
  });
  const points = spots
    .filter((spot) => spot.latitude != null && spot.longitude != null)
    .map((spot) => ({
      id: spot.id,
      name: spot.name,
      lat: spot.latitude as number,
      lng: spot.longitude as number,
      href: `/swap/spots/${spot.slug}`,
      city: `${spot.listings.length} listings`,
    }));

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[1fr_1fr]">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">{settings.spotLabelPlural}</h1>
        <p className="mt-2 text-sm text-ink-soft">Approved public places for an in-person handoff. Sellers choose from this list.</p>
        <div className="mt-6 space-y-3">
          {spots.length ? (
            spots.map((spot) => (
              <Link key={spot.id} href={`/swap/spots/${spot.slug}`} className="block rounded-2xl border border-line bg-white p-4 hover:border-primary">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{spot.name}</p>
                    <p className="text-sm text-ink-soft">{[spot.address, spot.city, spot.region].filter(Boolean).join(", ")}</p>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">{spot.listings.length}</p>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {spotBadges(spot).map((badge) => (
                    <span key={badge} className="rounded-full bg-paper-2 px-2 py-0.5 text-[11px] font-semibold">
                      {badge}
                    </span>
                  ))}
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm text-ink-soft">None yet. Add them in the CMS under Spots.</p>
          )}
        </div>
      </div>
      <div className="h-[32rem] overflow-hidden rounded-2xl border border-line">
        <MapSlot points={points} />
      </div>
    </div>
  );
}
