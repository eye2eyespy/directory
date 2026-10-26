import Link from "next/link";
import type { Metadata } from "next";
import { ListingCard } from "@/components/swap/ListingCard";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { listingCardInclude } from "@/lib/swap";

export const metadata: Metadata = { title: "Swap" };

export default async function SwapHomePage() {
  const settings = await getSettings();
  const [categories, listings, spots] = await Promise.all([
    prisma.swapCategory.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.listing.findMany({
      where: { status: "AVAILABLE" },
      include: listingCardInclude,
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.swapSpot.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      include: { listings: { where: { listing: { status: "AVAILABLE" } }, select: { listingId: true } } },
      take: 6,
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-10">
      <section>
        <h1 className="text-4xl font-bold tracking-tight">{settings.swapName}</h1>
        <p className="mt-2 max-w-2xl text-ink-soft">{settings.swapTagline} Payment happens in person. This site keeps the conversation and the meeting place.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/swap/search?category=${category.slug}`}
              className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Newest listings</h2>
          <Link href="/swap/search" className="text-sm font-semibold text-primary hover:underline">
            See all
          </Link>
        </div>
        {listings.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-line bg-paper-2 p-8">
            <p className="font-semibold">No listings yet.</p>
            <p className="mt-1 text-sm text-ink-soft">Be the first to list an item. An admin can add {settings.spotLabelPlural.toLowerCase()} before goods go up.</p>
            <Link href="/account/listings/new" className="btn btn-primary mt-4">
              Create a listing
            </Link>
          </div>
        )}
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-2xl font-bold tracking-tight">{settings.spotLabelPlural}</h2>
          <Link href="/swap/spots" className="text-sm font-semibold text-primary hover:underline">
            Map
          </Link>
        </div>
        {spots.length ? (
          <div className="grid gap-3 md:grid-cols-3">
            {spots.map((spot) => (
              <Link key={spot.id} href={`/swap/spots/${spot.slug}`} className="rounded-2xl border border-line bg-white p-4 hover:border-primary">
                <p className="font-semibold">{spot.name}</p>
                <p className="mt-1 text-sm text-ink-soft">
                  {[spot.city, spot.region].filter(Boolean).join(", ") || spot.address}
                </p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-primary">
                  {spot.listings.length} active {spot.listings.length === 1 ? "listing" : "listings"}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-soft">No {settings.spotLabelPlural.toLowerCase()} have been approved yet.</p>
        )}
      </section>
    </div>
  );
}
