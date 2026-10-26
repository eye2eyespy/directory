import { notFound } from "next/navigation";
import { SearchExperience } from "@/components/directory/SearchExperience";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { listPublishedBusinesses } from "@/lib/queries";

export default async function CityPage({
  params,
}: {
  params: Promise<{ industry: string; state: string; city: string }>;
}) {
  const { industry: industrySlug, state: stateSlug, city: citySlug } = await params;
  const [industry, state, city] = await Promise.all([
    prisma.industry.findUnique({ where: { slug: industrySlug } }),
    prisma.state.findUnique({ where: { slug: stateSlug } }),
    prisma.city.findFirst({ where: { slug: citySlug, state: { slug: stateSlug } } }),
  ]);
  if (!industry || !state || !city) notFound();

  const [settings, businesses] = await Promise.all([
    getSettings(),
    listPublishedBusinesses({ industrySlug, stateSlug, citySlug }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
        {industry.name} · {state.name}
      </p>
      <h1 className="serif text-4xl text-navy">
        {industry.name} in {city.name}, {state.abbr}
      </h1>
      <p className="mb-8 mt-2 text-ink-soft">{businesses.length} published listings</p>
      <SearchExperience businesses={businesses} mediaPriority={settings.mediaPriority} />
    </div>
  );
}
