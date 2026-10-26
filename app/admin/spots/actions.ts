"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/member";
import { saveSwapImage } from "@/lib/upload";
import { slugify } from "@/lib/utils";
import { uniqueSpotSlug } from "@/lib/swap";

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function checked(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

export async function saveSpot(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const back = id ? `/admin/spots/${id}` : "/admin/spots/new";
  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const region = String(formData.get("region") ?? "").trim();
  const postalCode = String(formData.get("postalCode") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const meetingTip = String(formData.get("meetingTip") ?? "").trim();
  const latRaw = String(formData.get("latitude") ?? "").trim();
  const lngRaw = String(formData.get("longitude") ?? "").trim();
  const latitude = latRaw ? Number(latRaw) : null;
  const longitude = lngRaw ? Number(lngRaw) : null;

  if (name.length < 2) fail(back, "Name is required.");
  if (address.length < 4) fail(back, "Address is required.");
  if (latitude != null && (Number.isNaN(latitude) || latitude < -90 || latitude > 90)) {
    fail(back, "Latitude must be between -90 and 90.");
  }
  if (longitude != null && (Number.isNaN(longitude) || longitude < -180 || longitude > 180)) {
    fail(back, "Longitude must be between -180 and 180.");
  }

  const existing = id ? await prisma.swapSpot.findUnique({ where: { id } }) : null;
  if (id && !existing) fail("/admin/spots", "Spot not found.");

  let photoUrl = existing?.photoUrl ?? null;
  const file = formData.get("photo");
  if (file instanceof File && file.size > 0) {
    try {
      photoUrl = await saveSwapImage(file, "spot");
    } catch (error) {
      fail(back, error instanceof Error ? error.message : "Could not save the photo.");
    }
  }
  if (formData.get("removePhoto") === "on") photoUrl = null;

  const data = {
    name,
    slug: await uniqueSpotSlug(name, existing?.id),
    address,
    city: city || null,
    region: region || null,
    postalCode: postalCode || null,
    notes: notes || null,
    meetingTip: meetingTip || null,
    photoUrl,
    latitude,
    longitude,
    cameraMonitored: checked(formData, "cameraMonitored"),
    wellLit: checked(formData, "wellLit"),
    publicIndoor: checked(formData, "publicIndoor"),
    active: formData.getAll("active").includes("on"),
  };

  if (!existing) {
    const created = await prisma.swapSpot.create({ data });
    redirect(`/admin/spots/${created.id}`);
  }
  await prisma.swapSpot.update({ where: { id: existing.id }, data });
  redirect(`/admin/spots/${existing.id}?saved=1`);
}

export async function deleteSpot(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const used = await prisma.swapProposal.count({ where: { spotId: id } });
  if (used) fail(`/admin/spots/${id}`, "This spot is on a meet-up proposal, so it cannot be deleted. Mark it inactive instead.");
  await prisma.swapSpot.delete({ where: { id } });
  redirect("/admin/spots");
}

export async function resolveFlag(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const flag = await prisma.swapSpotFlag.update({ where: { id }, data: { resolved: true } });
  redirect(`/admin/spots/${flag.spotId}?saved=1`);
}

export async function saveCategory(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const formMode = String(formData.get("formMode") ?? "GOODS");
  const back = id ? `/admin/swap-categories/${id}` : "/admin/swap-categories";
  if (name.length < 2) fail(back, "Name is required.");
  if (!["GOODS", "APPAREL", "DIGITAL", "SERVICE"].includes(formMode)) fail(back, "Unknown form type.");

  if (!id) {
    const slugBase = slugify(name) || "category";
    let slug = slugBase;
    let n = 2;
    while (await prisma.swapCategory.findUnique({ where: { slug } })) slug = `${slugBase}-${n++}`;
    await prisma.swapCategory.create({
      data: {
        name,
        slug,
        description: description || null,
        formMode: formMode as "GOODS",
        active: true,
      },
    });
    redirect("/admin/swap-categories");
  }

  await prisma.swapCategory.update({
    where: { id },
    data: {
      name,
      description: description || null,
      formMode: formMode as "GOODS",
      active: formData.get("active") === "on",
    },
  });
  redirect(`/admin/swap-categories/${id}?saved=1`);
}

export async function saveField(formData: FormData) {
  await requireStaff();
  const categoryId = String(formData.get("categoryId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const fieldType = String(formData.get("fieldType") ?? "text");
  const options = String(formData.get("options") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
  if (name.length < 2) fail(`/admin/swap-categories/${categoryId}`, "Field name is required.");
  const slugBase = slugify(name) || "field";
  let slug = slugBase;
  let n = 2;
  while (await prisma.swapField.findUnique({ where: { categoryId_slug: { categoryId, slug } } })) {
    slug = `${slugBase}-${n++}`;
  }
  const count = await prisma.swapField.count({ where: { categoryId } });
  await prisma.swapField.create({
    data: {
      categoryId,
      name,
      slug,
      fieldType: fieldType === "select" ? "select" : "text",
      options: fieldType === "select" ? options : null,
      required: formData.get("required") === "on",
      sortOrder: count,
    },
  });
  redirect(`/admin/swap-categories/${categoryId}?saved=1`);
}

export async function deleteField(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const field = await prisma.swapField.delete({ where: { id } });
  redirect(`/admin/swap-categories/${field.categoryId}?saved=1`);
}
