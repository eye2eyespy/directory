import { notFound } from "next/navigation";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { SpotForm } from "@/components/admin/SpotForm";
import { deleteSpot, resolveFlag, saveSpot } from "@/app/admin/spots/actions";
import { Button } from "@/components/ui/button";

export default async function EditSpotPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const settings = await getSettings();
  const spot = await prisma.swapSpot.findUnique({
    where: { id },
    include: { flags: { orderBy: { createdAt: "desc" }, include: { profile: true } } },
  });
  if (!spot) notFound();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">{spot.name}</h1>
      {query.saved ? <p className="text-sm text-ink-soft">Saved.</p> : null}
      <SpotForm action={saveSpot} spot={spot} error={query.error} spotLabel={settings.spotLabel} />
      <section>
        <h2 className="text-lg font-bold">Flags</h2>
        <div className="mt-3 space-y-2">
          {spot.flags.length ? (
            spot.flags.map((flag) => (
              <div key={flag.id} className="rounded-xl border border-line bg-white p-3 text-sm">
                <p className="font-semibold">
                  {flag.reason} {flag.resolved ? "· resolved" : "· open"}
                </p>
                <p className="text-ink-soft">
                  {flag.profile?.displayName ?? "Member"} · {format(flag.createdAt, "MMM d, yyyy")}
                </p>
                {flag.note ? <p className="mt-1">{flag.note}</p> : null}
                {flag.resolved ? null : (
                  <form action={resolveFlag} className="mt-2">
                    <input type="hidden" name="id" value={flag.id} />
                    <Button type="submit" size="sm" variant="outline">
                      Mark resolved
                    </Button>
                  </form>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-ink-soft">No flags.</p>
          )}
        </div>
      </section>
      <form action={deleteSpot}>
        <input type="hidden" name="id" value={spot.id} />
        <Button type="submit" variant="danger">
          Delete
        </Button>
      </form>
    </div>
  );
}
