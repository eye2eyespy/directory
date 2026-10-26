"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { signIn, auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireMember } from "@/lib/member";

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function joinSwap(formData: FormData) {
  const displayName = String(formData.get("displayName") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  if (displayName.length < 2 || displayName.length > 40) {
    fail("/swap/join", "Display name must be 2 to 40 characters.");
  }

  const session = await auth();
  if (session?.user?.id) {
    const existing = await prisma.swapProfile.findUnique({ where: { userId: session.user.id } });
    if (existing) redirect("/account");
    await prisma.swapProfile.create({
      data: { userId: session.user.id, displayName, city: city || null },
    });
    redirect("/account");
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email.includes("@")) fail("/swap/join", "Enter a valid email.");
  if (password.length < 8) fail("/swap/join", "Use a password of at least 8 characters.");

  const taken = await prisma.user.findUnique({ where: { email } });
  if (taken) fail("/swap/login", "That email already has an account. Sign in instead.");

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      email,
      name: displayName,
      passwordHash,
      role: "MEMBER",
      swapProfile: { create: { displayName, city: city || null } },
    },
  });

  try {
    await signIn("credentials", { email, password, redirectTo: "/account" });
  } catch (error) {
    if (error instanceof AuthError) fail("/swap/login", "Account created, but sign-in failed. Try signing in.");
    throw error;
  }
}

export async function expressInterest(formData: FormData) {
  const { profile } = await requireMember();
  const listingId = String(formData.get("listingId") ?? "");
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { seller: true, category: true },
  });
  if (!listing) redirect("/swap");
  if (listing.status !== "AVAILABLE") {
    fail(`/swap/l/${listing.slug}`, "This listing is not available.");
  }
  if (listing.sellerId === profile.id) {
    fail(`/swap/l/${listing.slug}`, "This is your listing.");
  }

  const existing = await prisma.swapThread.findUnique({
    where: { listingId_buyerId: { listingId: listing.id, buyerId: profile.id } },
  });
  if (existing) redirect(`/account/messages/${existing.id}`);

  const body =
    listing.category.formMode === "DIGITAL"
      ? `Hi ${listing.seller.displayName}, I'm interested in your ${listing.title}. How should we handle delivery?`
      : `Hi ${listing.seller.displayName}, I'm interested in your ${listing.title}. Which of your meet-up spots works best for you?`;

  const thread = await prisma.swapThread.create({
    data: {
      listingId: listing.id,
      buyerId: profile.id,
      sellerId: listing.sellerId,
      messages: { create: { senderId: profile.id, body } },
    },
  });
  redirect(`/account/messages/${thread.id}`);
}

export async function flagSpot(formData: FormData) {
  const { profile } = await requireMember();
  const spotId = String(formData.get("spotId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const spot = await prisma.swapSpot.findUnique({ where: { id: spotId } });
  if (!spot) redirect("/swap/spots");
  if (!reason) fail(`/swap/spots/${spot.slug}`, "Choose a reason for the flag.");

  await prisma.swapSpotFlag.create({
    data: { spotId: spot.id, profileId: profile.id, reason, note: note || null },
  });
  redirect(`/swap/spots/${spot.slug}?flagged=1`);
}
