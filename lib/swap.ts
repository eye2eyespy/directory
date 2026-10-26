import { Prisma, type ListingStatus, type SwapFormMode } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export const TITLE_MAX = 80;
export const IMAGE_MAX = 6;

export const listingCardInclude = {
  images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
  category: { select: { name: true, slug: true, formMode: true } },
  seller: { select: { displayName: true, city: true, ratingScore: true, ratingCount: true } },
  spots: { include: { spot: { select: { id: true, name: true, slug: true, city: true } } } },
} satisfies Prisma.ListingInclude;

export type ListingCard = Prisma.ListingGetPayload<{ include: typeof listingCardInclude }>;

export function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function parseDollars(value: FormDataEntryValue | null) {
  const raw = String(value ?? "")
    .trim()
    .replace(/[$,]/g, "");
  if (!raw) return null;
  const amount = Number(raw);
  if (!Number.isFinite(amount) || amount < 0 || amount > 1_000_000) return null;
  return Math.round(amount * 100);
}

export function ratingStars(score: number | null | undefined) {
  if (score == null) return null;
  return Math.round(score * 50) / 10;
}

export function statusLabel(status: ListingStatus) {
  if (status === "PENDING") return "Pending meet-up";
  if (status === "SOLD") return "Sold";
  return "Available";
}

export function formModeLabel(mode: SwapFormMode) {
  if (mode === "APPAREL") return "Apparel";
  if (mode === "DIGITAL") return "Digital goods";
  if (mode === "SERVICE") return "Services";
  return "Goods";
}

export function spotBadges(spot: { cameraMonitored: boolean; wellLit: boolean; publicIndoor: boolean }) {
  const badges: string[] = [];
  if (spot.cameraMonitored) badges.push("Camera monitored");
  if (spot.wellLit) badges.push("Well lit");
  if (spot.publicIndoor) badges.push("Public indoor");
  return badges;
}

export async function uniqueListingSlug(title: string, excludeId?: string) {
  const base = slugify(title).slice(0, 70) || "listing";
  let slug = base;
  let n = 2;
  while (
    await prisma.listing.findFirst({
      where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      select: { id: true },
    })
  ) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

export async function uniqueSpotSlug(name: string, excludeId?: string) {
  const base = slugify(name).slice(0, 70) || "spot";
  let slug = base;
  let n = 2;
  while (
    await prisma.swapSpot.findFirst({
      where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      select: { id: true },
    })
  ) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

export function searchOrder(sort: string | undefined): Prisma.ListingOrderByWithRelationInput {
  if (sort === "price_asc") return { sortPriceCents: "asc" };
  if (sort === "price_desc") return { sortPriceCents: "desc" };
  if (sort === "rating") return { seller: { ratingScore: "desc" } };
  return { createdAt: "desc" };
}

export async function refreshSellerRating(profileId: string) {
  const ratings = await prisma.swapRating.findMany({ where: { toId: profileId } });
  if (!ratings.length) {
    await prisma.swapProfile.update({
      where: { id: profileId },
      data: { ratingScore: null, ratingCount: 0 },
    });
    return;
  }
  const score =
    ratings.reduce((sum, rating) => {
      const points = Number(rating.onTime) + Number(rating.polite) + Number(rating.communicative);
      return sum + points / 3;
    }, 0) / ratings.length;
  await prisma.swapProfile.update({
    where: { id: profileId },
    data: { ratingScore: score, ratingCount: ratings.length },
  });
}

export function safeNextPath(value: FormDataEntryValue | null, fallback: string) {
  const path = String(value ?? "");
  if (!path.startsWith("/") || path.startsWith("//")) return fallback;
  return path;
}

export function mapLink(spot: {
  latitude?: number | null;
  longitude?: number | null;
  address: string;
  city?: string | null;
  region?: string | null;
}) {
  if (spot.latitude != null && spot.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${spot.latitude},${spot.longitude}`;
  }
  const query = [spot.address, spot.city, spot.region].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
