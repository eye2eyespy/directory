import { notFound } from "next/navigation";
import { SearchHero } from "@/components/directory/SearchHero";
import { SearchExperience } from "@/components/directory/SearchExperience";
import { TrustBar, trustStats } from "@/components/directory/TrustBar";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { listPublishedBusinesses } from "@/lib/queries";

export default async function IndustryPage({ params }: { params: Promise<{ industry: string }> }) {
  const { industry: slug } = await params;
  const industry = await prisma.industry.findUnique({
    where: { slug },
  });
  if (!industry) notFound();

  const [settings, businesses] = await Promise.all([
    getSettings(),
    listPublishedBusinesses({ industrySlug: slug }),
  ]);

  return (
    <>
      <SearchHero
        title={industry.name}
        subtitle={industry.description || `Browse ${industry.name.toLowerCase()} near you.`}
        industries={[industry]}
        defaultIndustry={industry.slug}
        imageUrl={settings.heroImageUrl}
      />
      <TrustBar {...trustStats(businesses)} />
      <div className="mx-auto max-w-7xl px-4 py-10">
        <SearchExperience businesses={businesses} mediaPriority={settings.mediaPriority} />
      </div>
    </>
  );
}
