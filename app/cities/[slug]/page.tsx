import { notFound } from "next/navigation";
import { SearchExperience } from "@/components/directory/SearchExperience";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { listPublishedBusinesses } from "@/lib/queries";

export default async function CityAliasPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const citySlug = slug.replace(/-[a-z]{2}$/i, "");
  const city = await prisma.city.findFirst({ where: { slug: citySlug }, include: { state: true } });
  if (!city) notFound();
  const settings = await getSettings();
  const businesses = await listPublishedBusinesses({ citySlug: city.slug, stateSlug: city.state.slug });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="serif text-4xl text-navy">
        Businesses in {city.name}, {city.state.abbr}
      </h1>
      <p className="mb-8 mt-2 text-ink-soft">{businesses.length} listings</p>
      <SearchExperience businesses={businesses} mediaPriority={settings.mediaPriority} />
    </div>
  );
}
