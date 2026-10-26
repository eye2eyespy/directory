import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { businessPath } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.APP_URL || "http://localhost:3000";
  const [industries, businesses, posts, cities, categories] = await Promise.all([
    prisma.industry.findMany({ where: { active: true } }),
    prisma.business.findMany({ where: { published: true }, include: { industry: true } }),
    prisma.blogPost.findMany({ where: { status: "PUBLISHED" } }),
    prisma.city.findMany({ include: { state: true } }),
    prisma.category.findMany(),
  ]);

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/search`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/featured`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/advertise`, changeFrequency: "monthly", priority: 0.5 },
    ...industries.map((industry) => ({ url: `${base}/${industry.slug}`, changeFrequency: "daily" as const, priority: 0.8 })),
    ...cities.flatMap((city) =>
      industries.map((industry) => ({
        url: `${base}/${industry.slug}/${city.state.slug}/${city.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ),
    ...businesses.map((business) => ({
      url: `${base}${businessPath({
        industrySlug: business.industry.slug,
        stateSlug: business.stateSlug,
        citySlug: business.citySlug,
        businessSlug: business.slug,
      })}`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...posts.map((post) => ({ url: `${base}/blog/${post.slug}`, changeFrequency: "monthly" as const, priority: 0.5 })),
    ...categories.map((category) => ({ url: `${base}/categories/${category.slug}`, changeFrequency: "weekly" as const, priority: 0.5 })),
  ];
}
