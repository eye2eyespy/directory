import Link from "next/link";
import { CheckCircle2, Heart, MapPin, Play, Star } from "lucide-react";
import { businessPath, formatPhone, telHref } from "@/lib/utils";
import { pickListingMedia } from "@/lib/media";
import type { BusinessCardRecord } from "@/lib/queries";

export function BusinessCard({
  business,
  mediaPriority,
}: {
  business: BusinessCardRecord;
  mediaPriority: string[];
}) {
  const media = pickListingMedia(business.media, mediaPriority);
  const href = businessPath({
    industrySlug: business.industry.slug,
    stateSlug: business.stateSlug,
    citySlug: business.citySlug,
    businessSlug: business.slug,
  });
  const categories = business.categories.map((c) => c.category.name).slice(0, 3);

  return (
    <article className="relative overflow-hidden rounded-xl border border-line bg-white shadow-sm">
      {business.sponsored ? (
        <div className="absolute left-3 top-3 z-10 ribbon bg-primary">Sponsored</div>
      ) : business.featured ? (
        <div className="absolute left-3 top-3 z-10 ribbon ribbon-accent bg-accent">Featured</div>
      ) : null}
      <div className="grid gap-0 md:grid-cols-[240px_1fr]">
        <Link href={href} className="relative min-h-44 bg-paper-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={media.thumbnailUrl || media.url}
            alt={business.name}
            className="h-full w-full object-cover"
          />
          {media.isVideo ? (
            <span className="absolute inset-0 flex items-center justify-center bg-black/20">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-ink">
                <Play className="ml-0.5 h-5 w-5 fill-current" />
              </span>
            </span>
          ) : null}
        </Link>
        <div className="flex flex-col p-4 md:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Link href={href} className="text-lg font-bold leading-tight tracking-tight text-ink hover:text-primary">
                {business.name}
              </Link>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                {business.verified ? (
                  <span className="inline-flex items-center gap-1 font-medium text-good">
                    <CheckCircle2 className="h-4 w-4" /> Verified
                  </span>
                ) : null}
                {business.sponsored && business.featured ? (
                  <span className="ribbon bg-accent text-ink">Featured</span>
                ) : null}
              </div>
            </div>
            <button type="button" className="text-ink-soft hover:text-primary" aria-label="Save">
              <Heart className="h-5 w-5" />
            </button>
          </div>
          {business.googleRating ? (
            <p className="mt-2 flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span className="font-semibold">{business.googleRating.toFixed(1)}</span>
              <span className="text-ink-soft">({business.googleReviewCount ?? 0} reviews)</span>
            </p>
          ) : null}
          {categories.length ? <p className="mt-2 text-sm text-ink-soft">{categories.join(" · ")}</p> : null}
          {business.shortDescription ? (
            <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{business.shortDescription}</p>
          ) : null}
          <p className="mt-3 flex items-center gap-1 text-sm text-ink-soft">
            <MapPin className="h-4 w-4" />
            {business.city}, {business.state === "Florida" ? "FL" : business.state}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`${href}#quote`} className="btn btn-primary">
              Request quote
            </Link>
            <Link href={href} className="btn btn-outline">
              View profile
            </Link>
            {business.phone ? (
              <a href={telHref(business.phone)} className="btn btn-outline">
                Call {formatPhone(business.phone)}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
