import { Filters } from "@/components/directory/Filters";
import { SearchExperience } from "@/components/directory/SearchExperience";
import { getSettings } from "@/lib/settings";
import { listPublishedBusinesses } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const value = (key: string) => {
    const raw = params[key];
    return Array.isArray(raw) ? raw[0] : raw;
  };

  const location = value("location") ?? "";
  const locationSlug = location ? slugify(location.split(",")[0] ?? "") : "";

  const [settings, industries, categories, businesses] = await Promise.all([
    getSettings(),
    prisma.industry.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    listPublishedBusinesses({
      q: value("q"),
      industrySlug: value("industry"),
      categorySlug: value("category"),
      citySlug: locationSlug || undefined,
      minRating: value("minRating") ? Number(value("minRating")) : undefined,
      verified: value("verified") === "1",
      featured: value("featured") === "1",
      hasVideo: value("video") === "1",
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-xs font-bold uppercase tracking-wide text-primary">Find a pro</p>
      <h1 className="text-3xl font-bold tracking-tight text-navy">Results</h1>
      <p className="mb-6 mt-2 text-ink-soft">{businesses.length} published listings</p>
      <Filters
        industries={industries}
        categories={categories}
        values={{
          q: value("q"),
          industry: value("industry"),
          category: value("category"),
          location,
          minRating: value("minRating"),
          verified: value("verified"),
          featured: value("featured"),
          video: value("video"),
        }}
      />
      <SearchExperience businesses={businesses} mediaPriority={settings.mediaPriority} />
    </div>
  );
}
