"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
}

export async function createBusiness(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const industryId = String(formData.get("industryId") ?? "");
  if (!name || !industryId) throw new Error("Name and industry are required");

  const city = String(formData.get("city") ?? "");
  const state = String(formData.get("state") ?? "Florida");
  const business = await prisma.business.create({
    data: {
      name,
      slug: slugify(name),
      industryId,
      description: String(formData.get("description") ?? "") || null,
      shortDescription: String(formData.get("shortDescription") ?? "") || null,
      phone: String(formData.get("phone") ?? "") || null,
      email: String(formData.get("email") ?? "") || null,
      websiteUrl: String(formData.get("websiteUrl") ?? "") || null,
      address1: String(formData.get("address1") ?? "") || null,
      city,
      citySlug: city ? slugify(city) : null,
      state,
      stateSlug: slugify(state),
      postalCode: String(formData.get("postalCode") ?? "") || null,
      latitude: formData.get("latitude") ? Number(formData.get("latitude")) : null,
      longitude: formData.get("longitude") ? Number(formData.get("longitude")) : null,
      yearEstablished: formData.get("yearEstablished") ? Number(formData.get("yearEstablished")) : null,
      googlePlaceId: String(formData.get("googlePlaceId") ?? "") || null,
      googleRating: formData.get("googleRating") ? Number(formData.get("googleRating")) : null,
      googleReviewCount: formData.get("googleReviewCount") ? Number(formData.get("googleReviewCount")) : null,
      externalId: String(formData.get("externalId") ?? "") || null,
      seoTitle: String(formData.get("seoTitle") ?? "") || null,
      metaDescription: String(formData.get("metaDescription") ?? "") || null,
      verified: formData.get("verified") === "on",
      featured: formData.get("featured") === "on",
      sponsored: formData.get("sponsored") === "on",
      homepageFeatured: formData.get("homepageFeatured") === "on",
      published: formData.get("published") === "on",
    },
  });

  const video = String(formData.get("videoUrl") ?? "");
  const hero = String(formData.get("heroImageUrl") ?? "");
  if (video) {
    await prisma.businessMedia.create({
      data: { businessId: business.id, type: "VIDEO", source: "YOUTUBE", url: video, featured: true, sortOrder: 0 },
    });
  }
  if (hero) {
    await prisma.businessMedia.create({
      data: { businessId: business.id, type: "IMAGE", source: "EXTERNAL", url: hero, featured: !video, sortOrder: 1 },
    });
  }

  revalidatePath("/admin/businesses");
  redirect(`/admin/businesses/${business.id}`);
}

export async function updateBusiness(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const city = String(formData.get("city") ?? "");
  const state = String(formData.get("state") ?? "Florida");

  await prisma.business.update({
    where: { id },
    data: {
      name,
      slug: String(formData.get("slug") ?? "") || slugify(name),
      industryId: String(formData.get("industryId") ?? ""),
      description: String(formData.get("description") ?? "") || null,
      shortDescription: String(formData.get("shortDescription") ?? "") || null,
      phone: String(formData.get("phone") ?? "") || null,
      email: String(formData.get("email") ?? "") || null,
      websiteUrl: String(formData.get("websiteUrl") ?? "") || null,
      address1: String(formData.get("address1") ?? "") || null,
      city,
      citySlug: city ? slugify(city) : null,
      state,
      stateSlug: slugify(state),
      postalCode: String(formData.get("postalCode") ?? "") || null,
      latitude: formData.get("latitude") ? Number(formData.get("latitude")) : null,
      longitude: formData.get("longitude") ? Number(formData.get("longitude")) : null,
      yearEstablished: formData.get("yearEstablished") ? Number(formData.get("yearEstablished")) : null,
      googlePlaceId: String(formData.get("googlePlaceId") ?? "") || null,
      googleRating: formData.get("googleRating") ? Number(formData.get("googleRating")) : null,
      googleReviewCount: formData.get("googleReviewCount") ? Number(formData.get("googleReviewCount")) : null,
      externalId: String(formData.get("externalId") ?? "") || null,
      seoTitle: String(formData.get("seoTitle") ?? "") || null,
      metaDescription: String(formData.get("metaDescription") ?? "") || null,
      verified: formData.get("verified") === "on",
      featured: formData.get("featured") === "on",
      sponsored: formData.get("sponsored") === "on",
      homepageFeatured: formData.get("homepageFeatured") === "on",
      published: formData.get("published") === "on",
    },
  });

  const video = String(formData.get("videoUrl") ?? "");
  if (video) {
    const existing = await prisma.businessMedia.findFirst({
      where: { businessId: id, type: "VIDEO" },
    });
    if (existing) {
      await prisma.businessMedia.update({ where: { id: existing.id }, data: { url: video, featured: true } });
    } else {
      await prisma.businessMedia.create({
        data: { businessId: id, type: "VIDEO", source: "YOUTUBE", url: video, featured: true },
      });
    }
  }

  revalidatePath("/admin/businesses");
  revalidatePath("/");
  redirect("/admin/businesses");
}

export async function toggleFlag(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const field = String(formData.get("field") ?? "");
  const allowed = ["published", "featured", "sponsored", "homepageFeatured", "verified"] as const;
  if (!allowed.includes(field as (typeof allowed)[number])) return;
  const current = await prisma.business.findUnique({ where: { id } });
  if (!current) return;
  await prisma.business.update({
    where: { id },
    data: { [field]: !current[field as (typeof allowed)[number]] },
  });
  revalidatePath("/admin/businesses");
  revalidatePath("/");
}
