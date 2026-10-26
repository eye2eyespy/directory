import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireMember } from "@/lib/member";
import { getSettings } from "@/lib/settings";
import { saveListing } from "@/app/account/actions";
import { ListingForm } from "@/components/swap/ListingForm";

export default async function EditListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const { profile } = await requireMember();
  const settings = await getSettings();
  const [listing, categories, spots] = await Promise.all([
    prisma.listing.findFirst({
      where: { id, sellerId: profile.id },
      include: { images: { orderBy: { sortOrder: "asc" } }, values: true, spots: true },
    }),
    prisma.swapCategory.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      include: { fields: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.swapSpot.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);
  if (!listing) notFound();

  return (
    <div className="max-w-2xl">
      <h2 className="mb-6 text-2xl font-bold tracking-tight">Edit listing</h2>
      <ListingForm
        action={saveListing}
        categories={categories}
        spots={spots.map((spot) => ({ id: spot.id, name: spot.name, city: spot.city }))}
        defaultSpotIds={[]}
        error={error}
        spotLabelPlural={settings.spotLabelPlural}
        listing={{
          id: listing.id,
          title: listing.title,
          description: listing.description,
          priceCents: listing.priceCents,
          salePriceCents: listing.salePriceCents,
          categoryId: listing.categoryId,
          digitalNote: listing.digitalNote,
          availabilityNote: listing.availabilityNote,
          spotIds: listing.spots.map((row) => row.spotId),
          values: listing.values.map((value) => ({ fieldId: value.fieldId, value: value.value })),
          images: listing.images.map((image) => ({ id: image.id, url: image.url })),
        }}
      />
    </div>
  );
}
