import { prisma } from "@/lib/prisma";
import { requireMember } from "@/lib/member";
import { getSettings } from "@/lib/settings";
import { saveListing } from "@/app/account/actions";
import { ListingForm } from "@/components/swap/ListingForm";

export default async function NewListingPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const { profile } = await requireMember();
  const settings = await getSettings();
  const [categories, spots, sellerSpots] = await Promise.all([
    prisma.swapCategory.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      include: { fields: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.swapSpot.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.swapProfileSpot.findMany({ where: { profileId: profile.id }, select: { spotId: true } }),
  ]);

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold tracking-tight">New listing</h2>
      <p className="mt-1 mb-6 text-sm text-ink-soft">The form follows the category. Goods ask for a photo and a {settings.spotLabel.toLowerCase()}. Digital goods ask how the file is delivered.</p>
      <ListingForm
        action={saveListing}
        categories={categories}
        spots={spots.map((spot) => ({ id: spot.id, name: spot.name, city: spot.city }))}
        defaultSpotIds={sellerSpots.map((row) => row.spotId)}
        error={error}
        spotLabelPlural={settings.spotLabelPlural}
      />
    </div>
  );
}
