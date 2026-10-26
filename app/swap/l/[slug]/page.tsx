import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { expressInterest } from "@/app/swap/actions";
import { formatMoney, mapLink, ratingStars, spotBadges, statusLabel } from "@/lib/swap";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const listing = await prisma.listing.findUnique({ where: { slug }, select: { title: true, description: true } });
  if (!listing) return { title: "Listing" };
  return { title: listing.title, description: listing.description.slice(0, 160) };
}

export default async function ListingPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { slug } = await params;
  const { error } = await searchParams;
  const [listing, settings, session] = await Promise.all([
    prisma.listing.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: true,
        values: { include: { field: true } },
        spots: { include: { spot: true } },
        seller: true,
      },
    }),
    getSettings(),
    auth(),
  ]);
  if (!listing) notFound();

  const stars = ratingStars(listing.seller.ratingScore);
  const profile = session?.user?.id
    ? await prisma.swapProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } })
    : null;
  const mine = profile?.id === listing.sellerId;

  return (
    <article className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.3fr_0.7fr]">
      <div>
        <div className="grid gap-3 sm:grid-cols-2">
          {listing.images.length ? (
            listing.images.map((image) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={image.id} src={image.url} alt="" className="aspect-square w-full rounded-2xl object-cover" />
            ))
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-2xl bg-paper-2 text-sm text-ink-soft">No photo</div>
          )}
        </div>
        <h1 className="mt-6 text-4xl font-bold tracking-tight">{listing.title}</h1>
        <p className="mt-2 text-sm text-ink-soft">
          {listing.category.name}
          {listing.seller.city ? ` · ${listing.seller.city}` : ""}
          {" · "}
          {statusLabel(listing.status)}
        </p>
        <div className="mt-4 flex items-baseline gap-3">
          <p className="text-2xl font-bold">{formatMoney(listing.salePriceCents ?? listing.priceCents)}</p>
          {listing.salePriceCents ? <p className="text-ink-soft line-through">{formatMoney(listing.priceCents)}</p> : null}
        </div>
        <p className="mt-6 whitespace-pre-wrap text-sm leading-6">{listing.description}</p>
        {listing.values.length ? (
          <dl className="mt-6 grid gap-3 sm:grid-cols-3">
            {listing.values.map((value) => (
              <div key={value.id} className="rounded-xl bg-paper-2 px-3 py-2">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">{value.field.name}</dt>
                <dd className="text-sm font-medium">{value.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {listing.digitalNote ? <p className="mt-6 rounded-xl bg-paper-2 p-4 text-sm">Delivery: {listing.digitalNote}</p> : null}
        {listing.availabilityNote ? <p className="mt-6 rounded-xl bg-paper-2 p-4 text-sm">Availability: {listing.availabilityNote}</p> : null}
      </div>

      <aside className="h-fit space-y-4 rounded-2xl border border-line bg-white p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Seller</p>
          <p className="mt-1 font-semibold">{listing.seller.displayName}</p>
          <p className="text-sm text-ink-soft">
            {stars != null ? `${stars.toFixed(1)} from ${listing.seller.ratingCount} ratings` : "No ratings yet"}
          </p>
        </div>

        {listing.spots.length ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{settings.spotLabelPlural}</p>
            <ul className="mt-2 space-y-3">
              {listing.spots.map((row) => (
                <li key={row.spot.id}>
                  <Link href={`/swap/spots/${row.spot.slug}`} className="font-semibold hover:text-primary">
                    {row.spot.name}
                  </Link>
                  <p className="text-sm text-ink-soft">{[row.spot.address, row.spot.city].filter(Boolean).join(", ")}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {spotBadges(row.spot).map((badge) => (
                      <span key={badge} className="rounded-full bg-paper-2 px-2 py-0.5 text-[11px] font-semibold">
                        {badge}
                      </span>
                    ))}
                  </div>
                  <a href={mapLink(row.spot)} className="text-xs font-semibold text-primary hover:underline" target="_blank" rel="noreferrer">
                    Map
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}

        {mine ? (
          <Link href={`/account/listings/${listing.id}`} className="btn btn-outline w-full">
            Edit listing
          </Link>
        ) : listing.status !== "AVAILABLE" ? (
          <p className="text-sm text-ink-soft">This listing is {statusLabel(listing.status).toLowerCase()} and is hidden from search.</p>
        ) : session?.user ? (
          <form action={expressInterest}>
            <input type="hidden" name="listingId" value={listing.id} />
            <button className="btn btn-primary w-full" type="submit">
              I&apos;m interested
            </button>
          </form>
        ) : (
          <Link href={`/swap/login?callbackUrl=/swap/l/${listing.slug}`} className="btn btn-primary w-full">
            I&apos;m interested
          </Link>
        )}
        <p className="text-xs text-ink-soft">Meet in a public place. Pay in person. This site does not take payment.</p>
      </aside>
    </article>
  );
}
