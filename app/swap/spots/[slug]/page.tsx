import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ListingCard } from "@/components/swap/ListingCard";
import { flagSpot } from "@/app/swap/actions";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { listingCardInclude, mapLink, spotBadges } from "@/lib/swap";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const spot = await prisma.swapSpot.findUnique({ where: { slug }, select: { name: true, notes: true } });
  return { title: spot?.name ?? "Spot", description: spot?.notes ?? undefined };
}

export default async function SpotPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ error?: string; flagged?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const settings = await getSettings();
  const spot = await prisma.swapSpot.findUnique({ where: { slug } });
  if (!spot || !spot.active) notFound();

  const listings = await prisma.listing.findMany({
    where: { status: "AVAILABLE", spots: { some: { spotId: spot.id } } },
    include: listingCardInclude,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          {spot.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={spot.photoUrl} alt="" className="aspect-[4/3] w-full rounded-2xl object-cover" />
          ) : null}
          <h1 className="mt-4 text-4xl font-bold tracking-tight">{spot.name}</h1>
          <p className="mt-2 text-sm text-ink-soft">{[spot.address, spot.city, spot.region, spot.postalCode].filter(Boolean).join(", ")}</p>
          <div className="mt-3 flex flex-wrap gap-1">
            {spotBadges(spot).map((badge) => (
              <span key={badge} className="rounded-full bg-paper-2 px-2 py-1 text-[11px] font-semibold">
                {badge}
              </span>
            ))}
          </div>
          {spot.notes ? <p className="mt-4 whitespace-pre-wrap text-sm">{spot.notes}</p> : null}
          {spot.meetingTip ? <p className="mt-4 rounded-xl bg-paper-2 p-4 text-sm">{spot.meetingTip}</p> : null}
          <a href={mapLink(spot)} target="_blank" rel="noreferrer" className="btn btn-outline mt-4">
            Open map
          </a>
          <Link href={`/swap/search?spot=${spot.slug}`} className="btn btn-primary mt-4 ml-2">
            Listings here
          </Link>

          <form action={flagSpot} className="mt-8 space-y-3 rounded-2xl border border-line p-4">
            <p className="text-sm font-semibold">Flag this {settings.spotLabel.toLowerCase()}</p>
            <input type="hidden" name="spotId" value={spot.id} />
            {query.error ? <p className="text-sm text-red-800">{query.error}</p> : null}
            {query.flagged ? <p className="text-sm text-ink-soft">Flag sent. An admin will review it.</p> : null}
            <select name="reason" className="w-full rounded-lg border border-line px-3 py-2 text-sm" required defaultValue="">
              <option value="" disabled>
                Reason
              </option>
              <option>Temporarily closed</option>
              <option>Unsafe</option>
              <option>Construction</option>
              <option>Other</option>
            </select>
            <textarea name="note" rows={3} placeholder="What should the admin know?" className="w-full rounded-lg border border-line px-3 py-2 text-sm" />
            <button className="btn btn-outline" type="submit">
              Send flag
            </button>
          </form>
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Available here</h2>
          {listings.length ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink-soft">No active listings at this spot.</p>
          )}
        </div>
      </div>
    </div>
  );
}
