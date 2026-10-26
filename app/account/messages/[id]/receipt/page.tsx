import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireMember } from "@/lib/member";
import { formatMoney, mapLink } from "@/lib/swap";

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { profile } = await requireMember();
  const thread = await prisma.swapThread.findUnique({
    where: { id },
    include: {
      listing: true,
      buyer: true,
      seller: true,
      proposals: { where: { status: "ACCEPTED" }, include: { spot: true }, orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!thread || (thread.buyerId !== profile.id && thread.sellerId !== profile.id)) notFound();
  const proposal = thread.proposals[0];
  if (!proposal) notFound();

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-line bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Receipt summary</p>
      <h2 className="mt-1 text-2xl font-bold tracking-tight">{thread.listing.title}</h2>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between gap-4"><dt className="text-ink-soft">Price agreed online</dt><dd>{formatMoney(thread.listing.salePriceCents ?? thread.listing.priceCents)}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-ink-soft">Buyer</dt><dd>{thread.buyer.displayName}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-ink-soft">Seller</dt><dd>{thread.seller.displayName}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-ink-soft">Spot</dt><dd>{proposal.spot.name}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-ink-soft">When</dt><dd>{format(proposal.meetAt, "EEE, MMM d, yyyy 'at' h:mm a")}</dd></div>
      </dl>
      <p className="mt-4 text-sm text-ink-soft">{[proposal.spot.address, proposal.spot.city, proposal.spot.region].filter(Boolean).join(", ")}</p>
      {proposal.spot.meetingTip ? <p className="mt-3 text-sm">{proposal.spot.meetingTip}</p> : null}
      <p className="mt-4 text-xs text-ink-soft">Payment happens in person. This note is only a record of what you agreed on the site.</p>
      <div className="mt-5 flex gap-4 text-sm font-semibold">
        <a href={mapLink(proposal.spot)} target="_blank" rel="noreferrer" className="text-primary hover:underline">Map</a>
        <Link href={`/account/messages/${thread.id}`} className="hover:text-primary">Back to messages</Link>
      </div>
    </div>
  );
}
