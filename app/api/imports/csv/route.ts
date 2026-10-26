import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const FIELD_ALIASES: Record<string, string> = {
  external_id: "externalId",
  industry: "industry",
  business_name: "name",
  company: "name",
  name: "name",
  slug: "slug",
  description: "description",
  phone: "phone",
  "main phone": "phone",
  email: "email",
  website: "websiteUrl",
  url: "websiteUrl",
  address_1: "address1",
  address: "address1",
  city: "city",
  town: "city",
  state: "state",
  st: "state",
  zip: "postalCode",
  country: "country",
  latitude: "latitude",
  longitude: "longitude",
  google_place_id: "googlePlaceId",
  "google id": "googlePlaceId",
  video_url: "videoUrl",
  logo_url: "logoUrl",
  hero_image_url: "heroImageUrl",
  featured: "featured",
  sponsored: "sponsored",
  verified: "verified",
  published: "published",
};

function truthy(value: unknown) {
  const s = String(value ?? "").trim().toLowerCase();
  return ["1", "true", "yes", "y"].includes(s);
}

function cell(row: Record<string, unknown>, mapped: Record<string, string>, key: string) {
  const header = Object.keys(mapped).find((h) => mapped[h] === key);
  if (!header) return "";
  return String(row[header] ?? "").trim();
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const form = await request.formData();
  const file = form.get("file");
  const industryId = String(form.get("industryId") ?? "");
  if (!(file instanceof File) || !industryId) {
    return NextResponse.json({ error: "File and industry required" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
  const headers = Object.keys(rows[0] ?? {});
  const mapped: Record<string, string> = {};
  for (const header of headers) {
    const key = FIELD_ALIASES[header.trim().toLowerCase()];
    if (key) mapped[header] = key;
  }

  const job = await prisma.importJob.create({
    data: {
      filename: file.name,
      userEmail: session.user.email ?? undefined,
      industryId,
      status: "RUNNING",
      startedAt: new Date(),
      rowsProcessed: 0,
    },
  });

  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (const [index, row] of rows.entries()) {
    try {
      const name = cell(row, mapped, "name");
      if (!name) {
        skippedCount += 1;
        await prisma.importError.create({ data: { jobId: job.id, row: index + 2, message: "Missing business name" } });
        continue;
      }
      const externalId = cell(row, mapped, "externalId") || undefined;
      const payload = {
        name,
        slug: cell(row, mapped, "slug") || slugify(name),
        description: cell(row, mapped, "description") || null,
        phone: cell(row, mapped, "phone") || null,
        email: cell(row, mapped, "email") || null,
        websiteUrl: cell(row, mapped, "websiteUrl") || null,
        address1: cell(row, mapped, "address1") || null,
        city: cell(row, mapped, "city") || null,
        citySlug: cell(row, mapped, "city") ? slugify(cell(row, mapped, "city")) : null,
        state: cell(row, mapped, "state") || null,
        stateSlug: cell(row, mapped, "state") ? slugify(cell(row, mapped, "state")) : null,
        postalCode: cell(row, mapped, "postalCode") || null,
        country: cell(row, mapped, "country") || "US",
        latitude: cell(row, mapped, "latitude") ? Number(cell(row, mapped, "latitude")) : null,
        longitude: cell(row, mapped, "longitude") ? Number(cell(row, mapped, "longitude")) : null,
        googlePlaceId: cell(row, mapped, "googlePlaceId") || null,
        featured: truthy(cell(row, mapped, "featured")),
        sponsored: truthy(cell(row, mapped, "sponsored")),
        verified: truthy(cell(row, mapped, "verified")),
        published: cell(row, mapped, "published") ? truthy(cell(row, mapped, "published")) : true,
        industryId,
        externalId,
      };

      const existing = externalId
        ? await prisma.business.findUnique({ where: { externalId } })
        : await prisma.business.findFirst({ where: { industryId, slug: payload.slug } });

      if (existing) {
        await prisma.business.update({ where: { id: existing.id }, data: payload });
        updatedCount += 1;
      } else {
        const created = await prisma.business.create({ data: payload });
        const videoUrl = cell(row, mapped, "videoUrl");
        const heroImageUrl = cell(row, mapped, "heroImageUrl");
        if (videoUrl) {
          await prisma.businessMedia.create({
            data: { businessId: created.id, type: "VIDEO", source: "YOUTUBE", url: videoUrl, featured: true },
          });
        }
        if (heroImageUrl) {
          await prisma.businessMedia.create({
            data: { businessId: created.id, type: "IMAGE", source: "EXTERNAL", url: heroImageUrl },
          });
        }
        createdCount += 1;
      }
    } catch (error) {
      failedCount += 1;
      await prisma.importError.create({
        data: { jobId: job.id, row: index + 2, message: error instanceof Error ? error.message : "Row failed" },
      });
    }
  }

  await prisma.importJob.update({
    where: { id: job.id },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      rowsProcessed: rows.length,
      createdCount,
      updatedCount,
      skippedCount,
      failedCount,
    },
  });

  return NextResponse.redirect(new URL("/admin/imports", request.url), 303);
}
