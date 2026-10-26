import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const businessCardInclude = {
  industry: true,
  categories: { include: { category: true } },
  services: { include: { service: true } },
  media: { orderBy: { sortOrder: "asc" as const } },
  locations: true,
} satisfies Prisma.BusinessInclude;

export type BusinessCardRecord = Prisma.BusinessGetPayload<{
  include: typeof businessCardInclude;
}>;

export async function listPublishedBusinesses(filters?: {
  industrySlug?: string;
  stateSlug?: string;
  citySlug?: string;
  categorySlug?: string;
  q?: string;
  featured?: boolean;
  sponsored?: boolean;
  verified?: boolean;
  hasVideo?: boolean;
  minRating?: number;
}) {
  const where: Prisma.BusinessWhereInput = { published: true };

  if (filters?.industrySlug) {
    where.industry = { slug: filters.industrySlug };
  }
  if (filters?.stateSlug) where.stateSlug = filters.stateSlug;
  if (filters?.citySlug) where.citySlug = filters.citySlug;
  if (filters?.featured) where.featured = true;
  if (filters?.sponsored) where.sponsored = true;
  if (filters?.verified) where.verified = true;
  if (typeof filters?.minRating === "number") {
    where.googleRating = { gte: filters.minRating };
  }
  if (filters?.categorySlug) {
    where.categories = { some: { category: { slug: filters.categorySlug } } };
  }
  if (filters?.hasVideo) {
    where.media = { some: { type: "VIDEO" } };
  }
  if (filters?.q) {
    const q = filters.q;
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
      { city: { contains: q } },
      { categories: { some: { category: { name: { contains: q } } } } },
      { services: { some: { service: { name: { contains: q } } } } },
    ];
  }

  const businesses = await prisma.business.findMany({
    where,
    include: businessCardInclude,
    orderBy: [{ sponsored: "desc" }, { featured: "desc" }, { googleRating: "desc" }, { name: "asc" }],
  });

  return businesses;
}

export function splitListings<T extends { sponsored: boolean; featured: boolean }>(items: T[]) {
  return {
    sponsored: items.filter((item) => item.sponsored),
    featured: items.filter((item) => item.featured),
    organic: items,
  };
}
