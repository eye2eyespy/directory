import type { Metadata } from "next";
import { ListingCard } from "@/components/swap/ListingCard";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { listingCardInclude, parseDollars, searchOrder } from "@/lib/swap";

export const metadata: Metadata = { title: "Search swap" };

export default async function SwapSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; spot?: string; min?: string; max?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const settings = await getSettings();
  const q = (params.q ?? "").trim();
  const minCents = params.min ? parseDollars(params.min) : null;
  const maxCents = params.max ? parseDollars(params.max) : null;
  const sort = params.sort || "newest";

  const [categories, spots, listings] = await Promise.all([
    prisma.swapCategory.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.swapSpot.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.listing.findMany({
      where: {
        status: "AVAILABLE",
        ...(params.category ? { category: { slug: params.category } } : {}),
        ...(params.spot ? { spots: { some: { spot: { slug: params.spot } } } } : {}),
        ...(minCents != null || maxCents != null
          ? { sortPriceCents: { ...(minCents != null ? { gte: minCents } : {}), ...(maxCents != null ? { lte: maxCents } : {}) } }
          : {}),
        ...(q
          ? {
              OR: [{ title: { contains: q } }, { description: { contains: q } }],
            }
          : {}),
      },
      include: listingCardInclude,
      orderBy: searchOrder(sort),
      take: 60,
    }),
  ]);

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[240px_1fr]">
      <form action="/swap/search" className="h-fit space-y-4 rounded-2xl border border-line bg-white p-4">
        {q ? <input type="hidden" name="q" value={q} /> : null}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-soft">Category</label>
          <select name="category" defaultValue={params.category ?? ""} className="w-full rounded-lg border border-line px-3 py-2 text-sm">
            <option value="">All</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-soft">{settings.spotLabel}</label>
          <select name="spot" defaultValue={params.spot ?? ""} className="w-full rounded-lg border border-line px-3 py-2 text-sm">
            <option value="">Any</option>
            {spots.map((spot) => (
              <option key={spot.id} value={spot.slug}>
                {spot.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-soft">Min $</label>
            <input name="min" defaultValue={params.min ?? ""} inputMode="decimal" className="w-full rounded-lg border border-line px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-soft">Max $</label>
            <input name="max" defaultValue={params.max ?? ""} inputMode="decimal" className="w-full rounded-lg border border-line px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-soft">Sort</label>
          <select name="sort" defaultValue={sort} className="w-full rounded-lg border border-line px-3 py-2 text-sm">
            <option value="newest">Newest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="rating">Top rated sellers</option>
          </select>
        </div>
        <button className="btn btn-primary w-full" type="submit">
          Apply
        </button>
      </form>

      <section>
        <h1 className="text-3xl font-bold tracking-tight">{q ? `Results for “${q}”` : "Listings"}</h1>
        <p className="mt-1 text-sm text-ink-soft">{listings.length} available</p>
        {listings.length ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm text-ink-soft">Nothing matches those filters.</p>
        )}
      </section>
    </div>
  );
}
