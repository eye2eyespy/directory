import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireMember } from "@/lib/member";
import { getSettings } from "@/lib/settings";
import { formatMoney, mapLink, statusLabel } from "@/lib/swap";
import {
  completeMeet,
  markPurchased,
  proposeMeet,
  rateMember,
  respondToProposal,
  sendMessage,
  setListingStatus,
} from "@/app/account/actions";
import { Button } from "@/components/ui/button";
import { Label, Select, Textarea } from "@/components/ui/input";

export default async function ThreadPage({
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
  const thread = await prisma.swapThread.findUnique({
    where: { id },
    include: {
      listing: { include: { spots: { include: { spot: true } }, category: true } },
      buyer: true,
      seller: true,
      messages: { orderBy: { createdAt: "asc" }, include: { sender: true } },
      proposals: { orderBy: { createdAt: "desc" }, include: { spot: true } },
      ratings: true,
    },
  });
  if (!thread || (thread.buyerId !== profile.id && thread.sellerId !== profile.id)) notFound();

  const mineIsBuyer = thread.buyerId === profile.id;
  const other = mineIsBuyer ? thread.seller : thread.buyer;
  const pending = thread.proposals.find((proposal) => proposal.status === "PENDING");
  const confirmed = thread.proposals.find((proposal) => proposal.status === "ACCEPTED");
  const myRating = thread.ratings.find((rating) => rating.fromId === profile.id);
  const digital = thread.listing.category.formMode === "DIGITAL";
  const widget =
    thread.status === "CONFIRMED" || thread.status === "COMPLETED"
      ? "Confirmed"
      : thread.status === "PROPOSED"
        ? "Proposed"
        : "Unscheduled";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="space-y-4">
        <div>
          <Link href={`/swap/l/${thread.listing.slug}`} className="text-2xl font-bold tracking-tight hover:text-primary">
            {thread.listing.title}
          </Link>
          <p className="text-sm text-ink-soft">
            With {other.displayName} · {formatMoney(thread.listing.salePriceCents ?? thread.listing.priceCents)} · {statusLabel(thread.listing.status)}
          </p>
        </div>
        {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}

        <div className="space-y-3 rounded-2xl border border-line bg-white p-4">
          {thread.messages.map((message) => (
            <div key={message.id} className={message.senderId === profile.id ? "ml-8" : "mr-8"}>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                {message.sender?.displayName ?? "Swap"} · {format(message.createdAt, "MMM d, h:mm a")}
              </p>
              <p className="mt-1 whitespace-pre-wrap rounded-xl bg-paper-2 px-3 py-2 text-sm">{message.body}</p>
            </div>
          ))}
        </div>

        {pending && mineIsBuyer ? (
          <div className="rounded-2xl border border-line bg-white p-4">
            <p className="font-semibold">Meet-up proposal</p>
            <p className="mt-1 text-sm">
              {pending.spot.name} · {format(pending.meetAt, "EEE, MMM d, yyyy 'at' h:mm a")}
            </p>
            {pending.note ? <p className="mt-1 text-sm text-ink-soft">{pending.note}</p> : null}
            {pending.spot.meetingTip ? <p className="mt-2 text-sm">{pending.spot.meetingTip}</p> : null}
            <div className="mt-3 flex gap-2">
              <form action={respondToProposal}>
                <input type="hidden" name="threadId" value={thread.id} />
                <input type="hidden" name="proposalId" value={pending.id} />
                <input type="hidden" name="decision" value="accept" />
                <Button type="submit">Accept details</Button>
              </form>
              <form action={respondToProposal}>
                <input type="hidden" name="threadId" value={thread.id} />
                <input type="hidden" name="proposalId" value={pending.id} />
                <input type="hidden" name="decision" value="changes" />
                <Button type="submit" variant="outline">
                  Propose changes
                </Button>
              </form>
            </div>
          </div>
        ) : null}

        <form action={sendMessage} className="space-y-2">
          <input type="hidden" name="threadId" value={thread.id} />
          <Textarea name="body" required maxLength={2000} rows={3} placeholder="Write a message" />
          <Button type="submit">Send</Button>
        </form>

        {!digital && !mineIsBuyer && thread.status !== "COMPLETED" ? (
          <form action={proposeMeet} className="space-y-3 rounded-2xl border border-line bg-white p-4">
            <p className="font-semibold">Schedule meet-up</p>
            <input type="hidden" name="threadId" value={thread.id} />
            <div>
              <Label htmlFor="spotId">{settings.spotLabel}</Label>
              <Select id="spotId" name="spotId" required defaultValue="">
                <option value="" disabled>
                  Choose a spot on this listing
                </option>
                {thread.listing.spots.map((row) => (
                  <option key={row.spotId} value={row.spotId}>
                    {row.spot.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="meetAt">Date and time</Label>
              <input id="meetAt" name="meetAt" type="datetime-local" required className="w-full rounded-lg border border-line px-3 py-2 text-sm" />
            </div>
            <div>
              <Label htmlFor="note">Note (optional)</Label>
              <Textarea id="note" name="note" rows={2} />
            </div>
            <Button type="submit">Send meet-up proposal</Button>
          </form>
        ) : null}

        {thread.status === "CONFIRMED" ? (
          <form action={completeMeet}>
            <input type="hidden" name="threadId" value={thread.id} />
            <Button type="submit" variant="outline">
              Meet-up complete
            </Button>
          </form>
        ) : null}

        {thread.status === "COMPLETED" && !myRating ? (
          <form action={rateMember} className="space-y-2 rounded-2xl border border-line bg-white p-4">
            <p className="font-semibold">Rate {other.displayName}</p>
            <input type="hidden" name="threadId" value={thread.id} />
            <label className="flex gap-2 text-sm"><input type="checkbox" name="onTime" /> On time</label>
            <label className="flex gap-2 text-sm"><input type="checkbox" name="polite" /> Polite</label>
            <label className="flex gap-2 text-sm"><input type="checkbox" name="communicative" /> Communicative</label>
            <Textarea name="note" rows={2} placeholder="Optional note" />
            <Button type="submit">Submit rating</Button>
          </form>
        ) : null}
        {myRating ? <p className="text-sm text-ink-soft">You left a rating on this thread.</p> : null}
      </div>

      <aside className="h-fit space-y-4 rounded-2xl border border-line bg-white p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Meet-up details</p>
          <p className="mt-1 font-semibold">{widget}</p>
          {confirmed ? (
            <>
              <p className="mt-2 text-sm">{confirmed.spot.name}</p>
              <p className="text-sm text-ink-soft">{format(confirmed.meetAt, "EEE, MMM d, yyyy 'at' h:mm a")}</p>
              <a href={mapLink(confirmed.spot)} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-semibold text-primary hover:underline">
                Map
              </a>
              <Link href={`/account/messages/${thread.id}/receipt`} className="mt-3 block text-sm font-semibold hover:text-primary">
                Receipt summary
              </Link>
            </>
          ) : (
            <p className="mt-2 text-sm text-ink-soft">Nothing is locked in yet.</p>
          )}
        </div>

        {!mineIsBuyer && thread.status === "COMPLETED" ? (
          <form action={setListingStatus} className="space-y-2">
            <input type="hidden" name="listingId" value={thread.listingId} />
            <input type="hidden" name="back" value={`/account/messages/${thread.id}`} />
            <Label>After the meet-up</Label>
            <Select name="status" defaultValue={thread.listing.status}>
              <option value="SOLD">Sold</option>
              <option value="AVAILABLE">Still available</option>
            </Select>
            <Button type="submit" size="sm">
              Update listing
            </Button>
          </form>
        ) : null}

        {mineIsBuyer ? (
          <form action={markPurchased}>
            <input type="hidden" name="listingId" value={thread.listingId} />
            <input type="hidden" name="threadId" value={thread.id} />
            <Button type="submit" variant="outline" size="sm">
              Mark as purchased
            </Button>
          </form>
        ) : null}
      </aside>
    </div>
  );
}
