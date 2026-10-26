"use server";

import { format } from "date-fns";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireMember } from "@/lib/member";
import { saveSwapImage } from "@/lib/upload";
import {
  IMAGE_MAX,
  TITLE_MAX,
  parseDollars,
  refreshSellerRating,
  uniqueListingSlug,
} from "@/lib/swap";

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function saveProfile(formData: FormData) {
  const { profile } = await requireMember();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const preferredSpotId = String(formData.get("preferredSpotId") ?? "");
  const sellerSpotIds = formData.getAll("sellerSpotIds").map(String);

  if (displayName.length < 2 || displayName.length > 40) {
    fail("/account", "Display name must be 2 to 40 characters.");
  }

  const spots = await prisma.swapSpot.findMany({
    where: { id: { in: [preferredSpotId, ...sellerSpotIds].filter(Boolean) }, active: true },
    select: { id: true },
  });
  const allowed = new Set(spots.map((spot) => spot.id));

  await prisma.$transaction([
    prisma.swapProfile.update({
      where: { id: profile.id },
      data: {
        displayName,
        city: city || null,
        preferredSpotId: allowed.has(preferredSpotId) ? preferredSpotId : null,
      },
    }),
    prisma.swapProfileSpot.deleteMany({ where: { profileId: profile.id } }),
    prisma.swapProfileSpot.createMany({
      data: sellerSpotIds.filter((id) => allowed.has(id)).map((spotId) => ({ profileId: profile.id, spotId })),
    }),
  ]);
  redirect("/account?saved=1");
}

export async function saveListing(formData: FormData) {
  const { profile } = await requireMember();
  const listingId = String(formData.get("listingId") ?? "");
  const existing = listingId
    ? await prisma.listing.findFirst({
        where: { id: listingId, sellerId: profile.id },
        include: { images: true },
      })
    : null;
  const back = existing ? `/account/listings/${existing.id}` : "/account/listings/new";
  if (listingId && !existing) fail("/account", "Listing not found.");

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "");
  const priceCents = parseDollars(formData.get("price"));
  const saleRaw = String(formData.get("salePrice") ?? "").trim();
  const salePriceCents = saleRaw ? parseDollars(saleRaw) : null;

  if (title.length < 3 || title.length > TITLE_MAX) {
    fail(back, `Title must be 3 to ${TITLE_MAX} characters.`);
  }
  if (description.length < 10 || description.length > 5000) {
    fail(back, "Description must be 10 to 5000 characters.");
  }
  if (priceCents == null || priceCents <= 0) fail(back, "Enter a price greater than zero.");
  if (saleRaw && (salePriceCents == null || salePriceCents <= 0 || salePriceCents >= priceCents)) {
    fail(back, "Sale price must be lower than the regular price.");
  }

  const category = await prisma.swapCategory.findFirst({
    where: { id: categoryId, active: true },
    include: { fields: { orderBy: { sortOrder: "asc" } } },
  });
  if (!category) fail(back, "Choose a category.");

  const requestedSpots = formData.getAll("spotIds").map(String).filter(Boolean);
  const activeSpots =
    category.formMode === "DIGITAL"
      ? []
      : await prisma.swapSpot.findMany({
          where: { id: { in: requestedSpots }, active: true },
          select: { id: true },
        });
  if ((category.formMode === "GOODS" || category.formMode === "APPAREL") && activeSpots.length === 0) {
    fail(back, "Choose at least one meet-up spot.");
  }

  const digitalNote = String(formData.get("digitalNote") ?? "").trim();
  const availabilityNote = String(formData.get("availabilityNote") ?? "").trim();
  if (category.formMode === "DIGITAL" && digitalNote.length < 3) {
    fail(back, "Add a short note about how the buyer receives this item.");
  }
  if (category.formMode === "SERVICE" && availabilityNote.length < 3) {
    fail(back, "Add when you are available.");
  }

  const values: { fieldId: string; value: string }[] = [];
  for (const field of category.fields) {
    const value = String(formData.get(`field_${field.id}`) ?? "").trim();
    if (field.required && !value) fail(back, `${field.name} is required.`);
    if (field.fieldType === "select" && value && field.options) {
      const options = field.options.split("\n").map((line) => line.trim()).filter(Boolean);
      if (options.length && !options.includes(value)) fail(back, `${field.name} must use one of the listed choices.`);
    }
    if (value) values.push({ fieldId: field.id, value: value.slice(0, 200) });
  }

  const removeIds = new Set(formData.getAll("removeImage").map(String));
  const kept = (existing?.images ?? []).filter((image) => !removeIds.has(image.id));
  const files = formData
    .getAll("images")
    .filter((item): item is File => item instanceof File && item.size > 0);
  if (kept.length + files.length > IMAGE_MAX) fail(back, `Use up to ${IMAGE_MAX} photos.`);
  const needsPhoto = category.formMode === "GOODS" || category.formMode === "APPAREL";
  if (needsPhoto && kept.length + files.length < 1) fail(back, "Add at least one photo.");

  const uploaded: string[] = [];
  try {
    for (const file of files) uploaded.push(await saveSwapImage(file, "listing"));
  } catch (error) {
    fail(back, error instanceof Error ? error.message : "Could not save a photo.");
  }

  const slug = await uniqueListingSlug(title, existing?.id);
  const data = {
    categoryId: category.id,
    title,
    slug,
    description,
    priceCents,
    salePriceCents,
    sortPriceCents: salePriceCents ?? priceCents,
    digitalNote: category.formMode === "DIGITAL" ? digitalNote : null,
    availabilityNote: category.formMode === "SERVICE" ? availabilityNote : null,
  };

  if (!existing) {
    const created = await prisma.listing.create({
      data: {
        ...data,
        sellerId: profile.id,
        images: { create: uploaded.map((url, index) => ({ url, sortOrder: index })) },
        values: { create: values },
        spots: { create: activeSpots.map((spot) => ({ spotId: spot.id })) },
      },
    });
    redirect(`/swap/l/${created.slug}`);
  }

  await prisma.$transaction([
    prisma.listingImage.deleteMany({ where: { listingId: existing.id, id: { in: [...removeIds] } } }),
    prisma.listingFieldValue.deleteMany({ where: { listingId: existing.id } }),
    prisma.listingSpot.deleteMany({ where: { listingId: existing.id } }),
    prisma.listing.update({
      where: { id: existing.id },
      data: {
        ...data,
        images: { create: uploaded.map((url, index) => ({ url, sortOrder: kept.length + index })) },
        values: { create: values },
        spots: { create: activeSpots.map((spot) => ({ spotId: spot.id })) },
      },
    }),
  ]);
  redirect(`/swap/l/${slug}`);
}

export async function setListingStatus(formData: FormData) {
  const { profile } = await requireMember();
  const id = String(formData.get("listingId") ?? "");
  const status = String(formData.get("status") ?? "");
  const back = String(formData.get("back") ?? "/account");
  if (status !== "AVAILABLE" && status !== "PENDING" && status !== "SOLD") fail("/account", "Unknown status.");
  const listing = await prisma.listing.findFirst({ where: { id, sellerId: profile.id } });
  if (!listing) fail("/account", "Listing not found.");
  await prisma.listing.update({ where: { id }, data: { status } });
  redirect(back.startsWith("/") ? back : "/account");
}

export async function markPurchased(formData: FormData) {
  const { profile } = await requireMember();
  const listingId = String(formData.get("listingId") ?? "");
  const threadId = String(formData.get("threadId") ?? "");
  const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { id: true } });
  if (!listing) fail("/account", "Listing not found.");
  await prisma.swapSave.upsert({
    where: { profileId_listingId: { profileId: profile.id, listingId } },
    update: {},
    create: { profileId: profile.id, listingId },
  });
  if (threadId) {
    await prisma.swapThread.updateMany({
      where: { id: threadId, buyerId: profile.id },
      data: { buyerArchived: true },
    });
    redirect(`/account?tab=purchased`);
  }
  redirect("/account?tab=purchased");
}

async function ownThread(id: string, profileId: string) {
  const thread = await prisma.swapThread.findUnique({
    where: { id },
    include: {
      listing: { include: { spots: true, category: true } },
      buyer: true,
      seller: true,
      proposals: { include: { spot: true }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!thread || (thread.buyerId !== profileId && thread.sellerId !== profileId)) redirect("/account");
  return thread;
}

export async function sendMessage(formData: FormData) {
  const { profile } = await requireMember();
  const threadId = String(formData.get("threadId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const thread = await ownThread(threadId, profile.id);
  if (!body || body.length > 2000) fail(`/account/messages/${thread.id}`, "Write a message under 2000 characters.");
  await prisma.$transaction([
    prisma.swapMessage.create({ data: { threadId: thread.id, senderId: profile.id, body } }),
    prisma.swapThread.update({ where: { id: thread.id }, data: { updatedAt: new Date() } }),
  ]);
  redirect(`/account/messages/${thread.id}`);
}

export async function proposeMeet(formData: FormData) {
  const { profile } = await requireMember();
  const threadId = String(formData.get("threadId") ?? "");
  const thread = await ownThread(threadId, profile.id);
  const back = `/account/messages/${thread.id}`;
  if (thread.sellerId !== profile.id) fail(back, "Only the seller can propose a meet-up.");
  if (thread.listing.category.formMode === "DIGITAL") fail(back, "Digital listings do not use meet-up spots.");
  if (thread.status === "COMPLETED") fail(back, "This meet-up is already closed.");

  const spotId = String(formData.get("spotId") ?? "");
  if (!thread.listing.spots.some((row) => row.spotId === spotId)) {
    fail(back, "Choose a spot already attached to this listing.");
  }
  const meetAt = new Date(String(formData.get("meetAt") ?? ""));
  if (Number.isNaN(meetAt.getTime()) || meetAt.getTime() < Date.now() - 60_000) {
    fail(back, "Choose a date and time in the future.");
  }
  const note = String(formData.get("note") ?? "").trim();
  const spot = await prisma.swapSpot.findUnique({ where: { id: spotId } });
  if (!spot) fail(back, "That spot is no longer available.");

  const when = format(meetAt, "EEE, MMM d, yyyy 'at' h:mm a");
  await prisma.$transaction([
    prisma.swapProposal.updateMany({
      where: { threadId: thread.id, status: "PENDING" },
      data: { status: "SUPERSEDED" },
    }),
    prisma.swapProposal.create({
      data: { threadId: thread.id, spotId, meetAt, note: note || null },
    }),
    prisma.swapThread.update({ where: { id: thread.id }, data: { status: "PROPOSED" } }),
    prisma.swapMessage.create({
      data: {
        threadId: thread.id,
        body: `Meet-up proposed for ${spot.name} on ${when}.${note ? ` Note: ${note}` : ""}`,
      },
    }),
  ]);
  redirect(back);
}

export async function respondToProposal(formData: FormData) {
  const { profile } = await requireMember();
  const threadId = String(formData.get("threadId") ?? "");
  const proposalId = String(formData.get("proposalId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const thread = await ownThread(threadId, profile.id);
  const back = `/account/messages/${thread.id}`;
  if (thread.buyerId !== profile.id) fail(back, "Only the buyer can accept or change a proposal.");

  const proposal = thread.proposals.find((item) => item.id === proposalId && item.status === "PENDING");
  if (!proposal) fail(back, "That proposal is no longer open.");

  if (decision === "changes") {
    await prisma.$transaction([
      prisma.swapProposal.update({ where: { id: proposal.id }, data: { status: "CHANGES" } }),
      prisma.swapThread.update({ where: { id: thread.id }, data: { status: "OPEN" } }),
      prisma.swapMessage.create({
        data: { threadId: thread.id, senderId: profile.id, body: "Can we change the meet-up details?" },
      }),
    ]);
    redirect(back);
  }

  if (decision !== "accept") fail(back, "Unknown response.");

  const when = format(proposal.meetAt, "EEE, MMM d, yyyy 'at' h:mm a");
  const tip = proposal.spot.meetingTip ? ` ${proposal.spot.meetingTip}` : "";
  await prisma.$transaction([
    prisma.swapProposal.update({ where: { id: proposal.id }, data: { status: "ACCEPTED" } }),
    prisma.swapProposal.updateMany({
      where: { threadId: thread.id, status: "PENDING", NOT: { id: proposal.id } },
      data: { status: "SUPERSEDED" },
    }),
    prisma.swapThread.update({ where: { id: thread.id }, data: { status: "CONFIRMED" } }),
    prisma.listing.update({ where: { id: thread.listingId }, data: { status: "PENDING" } }),
    prisma.swapMessage.create({
      data: {
        threadId: thread.id,
        body: `Meet-up confirmed at ${proposal.spot.name} on ${when}.${tip}`,
      },
    }),
  ]);
  redirect(back);
}

export async function completeMeet(formData: FormData) {
  const { profile } = await requireMember();
  const threadId = String(formData.get("threadId") ?? "");
  const thread = await ownThread(threadId, profile.id);
  const back = `/account/messages/${thread.id}`;
  if (thread.status !== "CONFIRMED") fail(back, "Confirm a meet-up before marking it complete.");
  await prisma.$transaction([
    prisma.swapThread.update({ where: { id: thread.id }, data: { status: "COMPLETED" } }),
    prisma.swapMessage.create({
      data: {
        threadId: thread.id,
        body: "Meet-up marked complete. The seller can mark the item sold or still available. Both people can leave a trust rating.",
      },
    }),
  ]);
  redirect(back);
}

export async function rateMember(formData: FormData) {
  const { profile } = await requireMember();
  const threadId = String(formData.get("threadId") ?? "");
  const thread = await ownThread(threadId, profile.id);
  const back = `/account/messages/${thread.id}`;
  if (thread.status !== "COMPLETED") fail(back, "Ratings open after the meet-up is marked complete.");

  const existing = await prisma.swapRating.findUnique({
    where: { threadId_fromId: { threadId: thread.id, fromId: profile.id } },
  });
  if (existing) fail(back, "You already left a rating on this thread.");

  const toId = thread.buyerId === profile.id ? thread.sellerId : thread.buyerId;
  const note = String(formData.get("note") ?? "").trim();
  await prisma.swapRating.create({
    data: {
      threadId: thread.id,
      fromId: profile.id,
      toId,
      onTime: formData.get("onTime") === "on",
      polite: formData.get("polite") === "on",
      communicative: formData.get("communicative") === "on",
      note: note || null,
    },
  });
  await refreshSellerRating(toId);
  redirect(back);
}
