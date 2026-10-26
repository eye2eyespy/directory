import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireMember } from "@/lib/member";
import { getSettings } from "@/lib/settings";
import { formatMoney, ratingStars, statusLabel } from "@/lib/swap";
import { saveProfile, setListingStatus } from "@/app/account/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string; tab?: string }>;
}) {
  const query = await searchParams;
  const { profile } = await requireMember();
  const settings = await getSettings();
  const tab = query.tab === "messages" || query.tab === "purchased" ? query.tab : "listings";

  const [spots, sellerSpotRows, listings, threads, saves] = await Promise.all([
    prisma.swapSpot.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.swapProfileSpot.findMany({ where: { profileId: profile.id }, select: { spotId: true } }),
    prisma.listing.findMany({
      where: { sellerId: profile.id },
      orderBy: { updatedAt: "desc" },
      include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
    }),
    prisma.swapThread.findMany({
      where: { OR: [{ buyerId: profile.id }, { sellerId: profile.id }] },
      orderBy: { updatedAt: "desc" },
      include: {
        listing: { select: { title: true, slug: true } },
        buyer: { select: { displayName: true } },
        seller: { select: { displayName: true } },
      },
    }),
    prisma.swapSave.findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: "desc" },
      include: { listing: { select: { title: true, slug: true, status: true } } },
    }),
  ]);

  const sellerSpotIds = new Set(sellerSpotRows.map((row) => row.spotId));
  const stars = ratingStars(profile.ratingScore);
  const openThreads = threads.filter((thread) => (thread.buyerId === profile.id ? !thread.buyerArchived : true));

  return (
    <div className="space-y-8">
      {query.error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{query.error}</p> : null}
      {query.saved ? <p className="rounded-lg bg-paper-2 px-3 py-2 text-sm">Saved.</p> : null}

      <section className="rounded-2xl border border-line bg-white p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-bold">Profile</h2>
          <p className="text-sm text-ink-soft">
            {stars != null ? `${stars.toFixed(1)} from ${profile.ratingCount} ratings` : "No ratings yet"}
          </p>
        </div>
        <form action={saveProfile} className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="displayName">Display name</Label>
            <Input id="displayName" name="displayName" required minLength={2} maxLength={40} defaultValue={profile.displayName} />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" defaultValue={profile.city ?? ""} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="preferredSpotId">Preferred {settings.spotLabel.toLowerCase()}</Label>
            <Select id="preferredSpotId" name="preferredSpotId" defaultValue={profile.preferredSpotId ?? ""}>
              <option value="">None yet</option>
              {spots.map((spot) => (
                <option key={spot.id} value={spot.id}>
                  {spot.name}
                </option>
              ))}
            </Select>
          </div>
          <fieldset className="md:col-span-2">
            <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-soft">
              {settings.spotLabelPlural} you will travel to
            </legend>
            {spots.length ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {spots.map((spot) => (
                  <label key={spot.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="sellerSpotIds" value={spot.id} defaultChecked={sellerSpotIds.has(spot.id)} />
                    {spot.name}
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-soft">An admin has not added spots yet.</p>
            )}
          </fieldset>
          <Button type="submit">Save profile</Button>
        </form>
      </section>

      <div className="flex gap-4 text-sm font-semibold">
        <Link href="/account" className={tab === "listings" ? "text-primary" : "text-ink-soft"}>
          My listings
        </Link>
        <Link href="/account?tab=messages" className={tab === "messages" ? "text-primary" : "text-ink-soft"}>
          Messages ({openThreads.length})
        </Link>
        <Link href="/account?tab=purchased" className={tab === "purchased" ? "text-primary" : "text-ink-soft"}>
          Purchased ({saves.length})
        </Link>
      </div>

      {tab === "listings" ? (
        <section className="space-y-3">
          {listings.length ? (
            listings.map((listing) => (
              <div key={listing.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white p-4">
                <div>
                  <Link href={`/swap/l/${listing.slug}`} className="font-semibold hover:text-primary">
                    {listing.title}
                  </Link>
                  <p className="text-sm text-ink-soft">
                    {formatMoney(listing.salePriceCents ?? listing.priceCents)} · {statusLabel(listing.status)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/account/listings/${listing.id}`} className="btn btn-outline">
                    Edit
                  </Link>
                  <form action={setListingStatus} className="flex gap-2">
                    <input type="hidden" name="listingId" value={listing.id} />
                    <input type="hidden" name="back" value="/account" />
                    <select name="status" defaultValue={listing.status} className="rounded-lg border border-line px-2 py-2 text-sm">
                      <option value="AVAILABLE">Available</option>
                      <option value="PENDING">Pending meet-up</option>
                      <option value="SOLD">Sold</option>
                    </select>
                    <Button type="submit" variant="outline" size="sm">
                      Update
                    </Button>
                  </form>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-ink-soft">
              You have no listings. <Link href="/account/listings/new" className="font-semibold text-primary">Create one</Link>.
            </p>
          )}
        </section>
      ) : null}

      {tab === "messages" ? (
        <section className="space-y-3">
          {openThreads.length ? (
            openThreads.map((thread) => {
              const other = thread.buyerId === profile.id ? thread.seller.displayName : thread.buyer.displayName;
              return (
                <Link key={thread.id} href={`/account/messages/${thread.id}`} className="block rounded-2xl border border-line bg-white p-4 hover:border-primary">
                  <p className="font-semibold">{thread.listing.title}</p>
                  <p className="text-sm text-ink-soft">
                    {other} · {thread.status.toLowerCase()}
                  </p>
                </Link>
              );
            })
          ) : (
            <p className="text-sm text-ink-soft">No open conversations.</p>
          )}
        </section>
      ) : null}

      {tab === "purchased" ? (
        <section className="space-y-3">
          {saves.length ? (
            saves.map((save) => (
              <div key={save.id} className="rounded-2xl border border-line bg-white p-4">
                <Link href={`/swap/l/${save.listing.slug}`} className="font-semibold hover:text-primary">
                  {save.listing.title}
                </Link>
                <p className="text-sm text-ink-soft">{statusLabel(save.listing.status)}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-ink-soft">Nothing archived yet. Mark a conversation as purchased from the thread.</p>
          )}
        </section>
      ) : null}
    </div>
  );
}
