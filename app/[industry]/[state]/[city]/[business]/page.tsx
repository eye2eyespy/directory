import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Globe, MapPin, Navigation, Phone, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { galleryItems, pickListingMedia, youtubeEmbed } from "@/lib/media";
import { formatPhone, mapsHref, telHref, yearsInBusiness } from "@/lib/utils";
import { QuoteForm } from "@/components/business/QuoteForm";
import { BusinessCard } from "@/components/directory/BusinessCard";
import { getSettings } from "@/lib/settings";
import { businessCardInclude } from "@/lib/queries";
import { MapSlot } from "@/components/map/MapSlot";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function BusinessProfilePage({
  params,
}: {
  params: Promise<{ industry: string; state: string; city: string; business: string }>;
}) {
  const { industry: industrySlug, business: businessSlug } = await params;
  const settings = await getSettings();

  const business = await prisma.business.findFirst({
    where: { slug: businessSlug, industry: { slug: industrySlug }, published: true },
    include: {
      industry: true,
      categories: { include: { category: true } },
      services: { include: { service: true } },
      media: { orderBy: { sortOrder: "asc" } },
      hours: { orderBy: { dayOfWeek: "asc" } },
      locations: true,
      credentials: { orderBy: { sortOrder: "asc" } },
      awards: true,
      social: true,
      reviews: { orderBy: { sortOrder: "asc" }, take: 5 },
    },
  });
  if (!business) notFound();

  const similar = await prisma.business.findMany({
    where: {
      published: true,
      industryId: business.industryId,
      id: { not: business.id },
      citySlug: business.citySlug ?? undefined,
    },
    include: businessCardInclude,
    take: 3,
  });

  const media = pickListingMedia(business.media, settings.mediaPriority);
  const gallery = galleryItems(business.media);
  const address = [business.address1, business.city, business.state, business.postalCode].filter(Boolean).join(", ");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    description: business.description,
    telephone: business.phone,
    url: business.websiteUrl,
    image: media.url,
    aggregateRating: business.googleRating
      ? {
          "@type": "AggregateRating",
          ratingValue: business.googleRating,
          reviewCount: business.googleReviewCount,
        }
      : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address1,
      addressLocality: business.city,
      addressRegion: business.state,
      postalCode: business.postalCode,
      addressCountry: business.country,
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="mb-4 text-xs text-ink-soft">
        <Link href={`/${business.industry.slug}`}>{business.industry.name}</Link>
        {" / "}
        <Link href={`/${business.industry.slug}/${business.stateSlug}`}>{business.state}</Link>
        {" / "}
        <span>{business.city}</span>
      </nav>

      <header className="border-b border-line pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="serif text-4xl text-navy md:text-5xl">{business.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              {business.googleRating ? (
                <span className="inline-flex items-center gap-1 font-semibold">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  {business.googleRating.toFixed(1)}
                  <span className="font-normal text-ink-soft">({business.googleReviewCount} Google Reviews)</span>
                </span>
              ) : null}
              {business.verified ? (
                <span className="inline-flex items-center gap-1 text-good">
                  <CheckCircle2 className="h-4 w-4" /> Verified
                </span>
              ) : null}
              {business.sponsored ? <span className="ribbon bg-primary">Sponsored</span> : null}
              {business.featured ? <span className="ribbon ribbon-accent bg-accent">Featured</span> : null}
            </div>
            <p className="mt-3 text-ink-soft">
              {business.categories.map((c) => c.category.name).join(" • ")}
              {business.city ? ` · ${business.city}, ${business.state}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {business.phone ? (
              <a href={telHref(business.phone)} className="btn btn-primary">
                <Phone className="h-4 w-4" /> Call Now
              </a>
            ) : null}
            {business.websiteUrl ? (
              <a href={business.websiteUrl} className="btn btn-outline" target="_blank" rel="noreferrer">
                <Globe className="h-4 w-4" /> Website
              </a>
            ) : null}
            {address ? (
              <a href={mapsHref(address)} className="btn btn-outline" target="_blank" rel="noreferrer">
                <Navigation className="h-4 w-4" /> Directions
              </a>
            ) : null}
            <a href="#quote" className="btn btn-primary">
              Request Quote
            </a>
          </div>
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.9fr)]">
        <div className="space-y-10">
          {gallery.length ? (
            <section>
              <div className="grid gap-2 md:grid-cols-[2fr_1fr]">
                <div className="relative min-h-72 overflow-hidden rounded-sm bg-navy">
                  {media.isVideo && media.url ? (
                    <iframe title="Featured video" src={youtubeEmbed(media.url)} className="h-full min-h-72 w-full" allowFullScreen />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={media.thumbnailUrl || media.url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="grid gap-2">
                  {gallery
                    .filter((item) => item.type === "IMAGE")
                    .slice(0, 3)
                    .map((item) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={item.id} src={item.url ?? ""} alt={item.title ?? ""} className="h-24 w-full rounded-sm object-cover md:h-full" />
                    ))}
                </div>
              </div>
            </section>
          ) : null}

          {business.description ? (
            <section>
              <h2 className="serif text-2xl text-navy">About</h2>
              <p className="mt-3 max-w-3xl leading-relaxed text-ink">{business.description}</p>
            </section>
          ) : null}

          {business.services.length ? (
            <section>
              <h2 className="serif text-2xl text-navy">Services</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {business.services.map((row) => (
                  <li key={row.serviceId} className="rounded-full bg-paper-2 px-3 py-1 text-sm">
                    {row.service.name}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section>
            <h2 className="serif text-2xl text-navy">Company details</h2>
            <dl className="mt-3 grid gap-3 sm:grid-cols-3">
              {business.yearEstablished ? (
                <div className="rounded-sm border border-line bg-white p-4">
                  <dt className="text-xs uppercase tracking-wide text-ink-soft">Year established</dt>
                  <dd className="serif text-2xl">{business.yearEstablished}</dd>
                </div>
              ) : null}
              {yearsInBusiness(business.yearEstablished) != null ? (
                <div className="rounded-sm border border-line bg-white p-4">
                  <dt className="text-xs uppercase tracking-wide text-ink-soft">Years in business</dt>
                  <dd className="serif text-2xl">{yearsInBusiness(business.yearEstablished)}</dd>
                </div>
              ) : null}
            </dl>
          </section>

          {business.credentials.length ? (
            <section>
              <h2 className="serif text-2xl text-navy">Credentials</h2>
              <ul className="mt-3 space-y-2">
                {business.credentials.map((item) => (
                  <li key={item.id} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-good" /> {item.name}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {business.awards.length ? (
            <section>
              <h2 className="serif text-2xl text-navy">Honors & awards</h2>
              <ul className="mt-3 space-y-2">
                {business.awards.map((award) => (
                  <li key={award.id} className="text-sm">
                    🏆 {award.year} {award.name}
                    {award.organization ? ` — ${award.organization}` : ""}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {business.reviews.length ? (
            <section>
              <h2 className="serif text-2xl text-navy">Google reviews</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {business.reviews.map((review) => (
                  <blockquote key={review.id} className="rounded-sm border border-line bg-white p-4">
                    <p className="text-accent">{"★".repeat(Math.round(review.rating))}</p>
                    <p className="mt-2 text-sm leading-relaxed">“{review.text}”</p>
                    <footer className="mt-3 text-xs font-semibold text-ink-soft">{review.authorName}</footer>
                  </blockquote>
                ))}
              </div>
            </section>
          ) : null}

          {business.locations.length ? (
            <section>
              <h2 className="serif text-2xl text-navy">Service areas</h2>
              <p className="mt-3 text-sm text-ink-soft">{business.locations.map((l) => l.city).join(" · ")}</p>
            </section>
          ) : null}

          {similar.length ? (
            <section>
              <h2 className="serif text-2xl text-navy">Similar businesses</h2>
              <div className="mt-4 space-y-4">
                {similar.map((item) => (
                  <BusinessCard key={item.id} business={item} mediaPriority={settings.mediaPriority} />
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-6">
          <div className="rounded-sm border border-line bg-white p-5">
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-ink-soft">Contact information</h2>
            <p className="mt-3 font-semibold">{business.name}</p>
            {business.phone ? (
              <p className="mt-2 flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4" /> {formatPhone(business.phone)}
              </p>
            ) : null}
            {address ? (
              <p className="mt-2 flex items-start gap-2 text-sm">
                <MapPin className="mt-0.5 h-4 w-4" /> {address}
              </p>
            ) : null}
          </div>

          {business.hours.length ? (
            <div className="rounded-sm border border-line bg-white p-5">
              <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-ink-soft">Hours</h2>
              <ul className="mt-3 space-y-1 text-sm">
                {business.hours.map((row) => (
                  <li key={row.id} className="flex justify-between">
                    <span>{DAYS[row.dayOfWeek]}</span>
                    <span className="text-ink-soft">{row.closed ? "Closed" : `${row.openTime}–${row.closeTime}`}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {business.latitude && business.longitude ? (
            <div className="h-56 overflow-hidden rounded-sm border border-line">
              <MapSlot
                points={[
                  {
                    id: business.id,
                    name: business.name,
                    lat: business.latitude,
                    lng: business.longitude,
                    href: "#",
                    city: business.city,
                  },
                ]}
              />
            </div>
          ) : null}

          <div id="quote" className="scroll-mt-24 rounded-xl border border-line bg-paper-2 p-5">
            <h2 className="text-2xl font-bold tracking-tight text-navy">Request a quote</h2>
            <div className="mt-4">
              <QuoteForm businessId={business.id} businessName={business.name} />
            </div>
          </div>

          {business.social.filter((s) => s.url).length ? (
            <div className="flex flex-wrap gap-2 text-sm">
              {business.social.map((item) => (
                <a key={item.id} href={item.url} className="capitalize underline" target="_blank" rel="noreferrer">
                  {item.network}
                </a>
              ))}
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
