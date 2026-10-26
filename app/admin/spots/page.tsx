import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

export default async function AdminSpotsPage() {
  const settings = await getSettings();
  const spots = await prisma.swapSpot.findMany({
    orderBy: { name: "asc" },
    include: { flags: { where: { resolved: false }, select: { id: true } }, _count: { select: { listings: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{settings.spotLabelPlural}</h1>
        <Link href="/admin/spots/new" className="btn btn-primary">
          Add
        </Link>
      </div>
      <p className="mt-1 text-sm text-ink-soft">Approved public places sellers can attach to a listing.</p>
      <div className="mt-6 space-y-2">
        {spots.length ? (
          spots.map((spot) => (
            <Link key={spot.id} href={`/admin/spots/${spot.id}`} className="flex items-center justify-between rounded-xl border border-line bg-white px-4 py-3">
              <span>
                <span className="font-semibold">{spot.name}</span>
                <span className="ml-2 text-sm text-ink-soft">{spot.active ? "Active" : "Hidden"}</span>
              </span>
              <span className="text-sm text-ink-soft">
                {spot._count.listings} listings
                {spot.flags.length ? ` · ${spot.flags.length} flags` : ""}
              </span>
            </Link>
          ))
        ) : (
          <p className="text-sm text-ink-soft">None yet.</p>
        )}
      </div>
    </div>
  );
}
