import Link from "next/link";
import { SearchHero } from "@/components/directory/SearchHero";
import { BusinessCard } from "@/components/directory/BusinessCard";
import { CategoryGrid } from "@/components/directory/CategoryGrid";
import { getSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import { businessCardInclude } from "@/lib/queries";
import { format } from "date-fns";

const POPULAR_CATEGORY_SLUGS = [
  "metal-roofing",
  "shingle-roofing",
  "standing-seam",
  "stone-coated-steel",
  "tpo-roofing",
  "tile-roofing",
];

export default async function HomePage() {
  const settings = await getSettings();
  const [industries, homepageFeatured, featured, categories, cities, posts] = await Promise.all([
    prisma.industry.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.business.findMany({
      where: { published: true, homepageFeatured: true },
      include: businessCardInclude,
      take: 4,
    }),
    prisma.business.findMany({
      where: { published: true, sponsored: true },
      include: businessCardInclude,
      take: 3,
    }),
    prisma.category.findMany({
      where: { slug: { in: POPULAR_CATEGORY_SLUGS } },
      include: { industry: true },
    }),
    prisma.city.findMany({ include: { state: true }, orderBy: { name: "asc" }, take: 12 }),
    prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      include: { category: true },
      orderBy: { publishedAt: "desc" },
      take: 4,
    }),
  ]);

  return (
    <>
      <SearchHero
        title="Find top-rated pros in your area"
        subtitle={settings.tagline}
        industries={industries}
        imageUrl={settings.heroImageUrl}
      />

      <section className="border-b border-line bg-paper-2">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-primary">{settings.swapName}</p>
            <p className="text-lg font-bold tracking-tight">{settings.swapTagline}</p>
          </div>
          <Link href="/swap" className="btn btn-primary">
            Browse {settings.swapName}
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-16 px-4 py-12">
        <section>
          <h2 className="mb-5 text-2xl font-bold tracking-tight text-ink">Browse by city</h2>
          <div className="flex flex-wrap gap-2">
            {cities.map((city) => (
              <Link
                key={city.id}
                href={`/cities/${city.slug}-${city.state.abbr.toLowerCase()}`}
                className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary"
              >
                {city.name}, {city.state.abbr}
              </Link>
            ))}
          </div>
        </section>

        {homepageFeatured.length ? (
          <section>
            <div className="mb-5 flex items-end justify-between">
              <h2 className="text-2xl font-bold tracking-tight text-ink">Top-rated pros</h2>
              <Link href="/search" className="text-sm font-semibold text-primary hover:underline">
                See all
              </Link>
            </div>
            <div className="space-y-4">
              {homepageFeatured.map((business) => (
                <BusinessCard key={business.id} business={business} mediaPriority={settings.mediaPriority} />
              ))}
            </div>
          </section>
        ) : null}

        {featured.length ? (
          <section>
            <h2 className="mb-5 text-2xl font-bold tracking-tight text-ink">Sponsored businesses</h2>
            <div className="space-y-4">
              {featured.map((business) => (
                <BusinessCard key={business.id} business={business} mediaPriority={settings.mediaPriority} />
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-ink">Popular categories</h2>
          <CategoryGrid
            categories={[...categories].sort(
              (a, b) => POPULAR_CATEGORY_SLUGS.indexOf(a.slug) - POPULAR_CATEGORY_SLUGS.indexOf(b.slug),
            )}
          />
        </section>

        <section className="grid gap-8 rounded-2xl bg-paper-2 p-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">List your business</h2>
            <p className="mt-2 text-sm text-ink-soft">
              Claim a listing or add a new profile. Featured and sponsored placements are configured in the CMS.
            </p>
            <Link href="/claim-business" className="btn btn-primary mt-5">
              Get listed
            </Link>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Advertise</h2>
            <p className="mt-2 text-sm text-ink-soft">
              Featured, Sponsored, Homepage Featured, and Exclusive City Sponsor. Prices stay editable in the CMS.
            </p>
            <Link href="/advertise" className="btn btn-outline mt-5">
              See packages
            </Link>
          </div>
        </section>

        {posts.length ? (
          <section>
            <div className="mb-5 flex items-end justify-between">
              <h2 className="text-2xl font-bold tracking-tight text-ink">Home care guides</h2>
              <Link href="/blog" className="text-sm font-semibold text-primary hover:underline">
                See all articles
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="overflow-hidden rounded-xl border border-line bg-white shadow-sm hover:shadow-md"
                >
                  {post.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.thumbnailUrl} alt="" className="h-40 w-full object-cover" />
                  ) : null}
                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">{post.category?.name}</p>
                    <h3 className="mt-1 text-lg font-bold tracking-tight">{post.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{post.excerpt}</p>
                    {post.publishedAt ? (
                      <p className="mt-3 text-xs text-ink-soft">{format(post.publishedAt, "MMMM d, yyyy")}</p>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}
