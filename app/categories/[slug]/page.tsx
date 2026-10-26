import { notFound } from "next/navigation";
import { SearchExperience } from "@/components/directory/SearchExperience";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { listPublishedBusinesses } from "@/lib/queries";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await prisma.category.findFirst({ where: { slug }, include: { industry: true } });
  if (!category) notFound();
  const settings = await getSettings();
  const businesses = await listPublishedBusinesses({ categorySlug: slug });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{category.industry.name}</p>
      <h1 className="serif text-4xl text-navy">{category.name}</h1>
      <p className="mb-8 mt-2 text-ink-soft">{businesses.length} listings</p>
      <SearchExperience businesses={businesses} mediaPriority={settings.mediaPriority} />
    </div>
  );
}
