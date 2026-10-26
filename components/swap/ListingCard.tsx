import Link from "next/link";
import type { ListingCard as ListingCardData } from "@/lib/swap";
import { formatMoney, ratingStars, statusLabel } from "@/lib/swap";

export function ListingCard({ listing, showStatus = false }: { listing: ListingCardData; showStatus?: boolean }) {
  const image = listing.images[0]?.url;
  const stars = ratingStars(listing.seller.ratingScore);
  const price = listing.salePriceCents ?? listing.priceCents;

  return (
    <Link href={`/swap/l/${listing.slug}`} className="group overflow-hidden rounded-2xl border border-line bg-white">
      <div className="aspect-[4/3] bg-paper-2">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink-soft">No photo</div>
        )}
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 font-semibold tracking-tight">{listing.title}</h3>
          <p className="shrink-0 text-sm font-bold">{formatMoney(price)}</p>
        </div>
        {listing.salePriceCents ? (
          <p className="-mt-1 text-xs text-ink-soft line-through">{formatMoney(listing.priceCents)}</p>
        ) : null}
        <p className="text-xs text-ink-soft">
          {listing.category.name}
          {listing.seller.city ? ` · ${listing.seller.city}` : ""}
          {stars != null ? ` · ${stars.toFixed(1)} (${listing.seller.ratingCount})` : ""}
        </p>
        {listing.spots.length ? (
          <div className="flex flex-wrap gap-1.5">
            {listing.spots.slice(0, 2).map((row) => (
              <span key={row.spot.id} className="rounded-full bg-paper-2 px-2 py-1 text-[11px] font-semibold">
                {row.spot.name}
              </span>
            ))}
          </div>
        ) : null}
        {showStatus ? <p className="text-xs font-semibold uppercase tracking-wide text-primary">{statusLabel(listing.status)}</p> : null}
      </div>
    </Link>
  );
}
