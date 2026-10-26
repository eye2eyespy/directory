import { notFound } from "next/navigation";
import Link from "next/link";
import { SearchExperience } from "@/components/directory/SearchExperience";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { listPublishedBusinesses } from "@/lib/queries";

export default async function StatePage({
  params,
}: {
  params: Promise<{ industry: string; state: string }>;
}) {
  const { industry: industrySlug, state: stateSlug } = await params;
  const [industry, state] = await Promise.all([
    prisma.industry.findUnique({ where: { slug: industrySlug } }),
    prisma.state.findUnique({ where: { slug: stateSlug }, include: { cities: { orderBy: { name: "asc" } } } }),
  ]);
  if (!industry || !state) notFound();

  const [settings, businesses] = await Promise.all([
    getSettings(),
    listPublishedBusinesses({ industrySlug, stateSlug }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{industry.name}</p>
      <h1 className="serif text-4xl text-navy">
        {industry.name} in {state.name}
      </h1>
      <div className="my-6 flex flex-wrap gap-2">
        {state.cities.map((city) => (
          <Link
            key={city.id}
            href={`/${industry.slug}/${state.slug}/${city.slug}`}
            className="rounded-full border border-line bg-white px-3 py-1 text-sm"
          >
            {city.name}
          </Link>
        ))}
      </div>
      <SearchExperience businesses={businesses} mediaPriority={settings.mediaPriority} />
    </div>
  );
}
