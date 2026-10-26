"use client";

import { useRef, useState } from "react";
import type { SwapFormMode } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { TITLE_MAX } from "@/lib/swap";

export type FormCategory = {
  id: string;
  name: string;
  formMode: SwapFormMode;
  fields: {
    id: string;
    name: string;
    fieldType: string;
    options: string | null;
    required: boolean;
  }[];
};

export type FormSpot = { id: string; name: string; city: string | null };

export type FormListing = {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  salePriceCents: number | null;
  categoryId: string;
  digitalNote: string | null;
  availabilityNote: string | null;
  spotIds: string[];
  values: { fieldId: string; value: string }[];
  images: { id: string; url: string }[];
};

function dollars(cents: number | null) {
  if (cents == null) return "";
  return (cents / 100).toFixed(2);
}

function readSize(file: File) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: image.width, height: image.height });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("unreadable"));
    };
    image.src = url;
  });
}

export function ListingForm({
  action,
  categories,
  spots,
  listing,
  defaultSpotIds,
  error,
  spotLabelPlural,
}: {
  action: (formData: FormData) => void | Promise<void>;
  categories: FormCategory[];
  spots: FormSpot[];
  listing?: FormListing;
  defaultSpotIds: string[];
  error?: string;
  spotLabelPlural: string;
}) {
  const [categoryId, setCategoryId] = useState(listing?.categoryId ?? categories[0]?.id ?? "");
  const [title, setTitle] = useState(listing?.title ?? "");
  const [imageError, setImageError] = useState("");
  const skipImageCheck = useRef(false);
  const category = categories.find((item) => item.id === categoryId) ?? categories[0];
  const mode = category?.formMode ?? "GOODS";
  const selectedSpots = new Set(listing?.spotIds ?? defaultSpotIds);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (skipImageCheck.current) {
      skipImageCheck.current = false;
      return;
    }
    const form = event.currentTarget;
    const input = form.querySelector<HTMLInputElement>('input[name="images"]');
    const files = [...(input?.files ?? [])];
    if (!files.length) return;

    event.preventDefault();
    for (const file of files) {
      try {
        const size = await readSize(file);
        if (size.width < 600 || size.height < 600) {
          setImageError("Each photo must be at least 600 × 600 pixels.");
          return;
        }
      } catch {
        setImageError("One of the photos could not be read. Use a JPG, PNG, or WebP.");
        return;
      }
    }
    setImageError("");
    skipImageCheck.current = true;
    form.requestSubmit();
  }

  if (!category) {
    return <p className="text-sm text-ink-soft">Add a category in the CMS before creating a listing.</p>;
  }

  return (
    <form action={action} encType="multipart/form-data" onSubmit={onSubmit} className="space-y-5">
      {listing ? <input type="hidden" name="listingId" value={listing.id} /> : null}
      {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
      {imageError ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{imageError}</p> : null}

      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          required
          maxLength={TITLE_MAX}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <p className="mt-1 text-xs text-ink-soft">
          {title.length}/{TITLE_MAX}
        </p>
      </div>

      <div>
        <Label htmlFor="categoryId">Category</Label>
        <Select id="categoryId" name="categoryId" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" required minLength={10} rows={6} defaultValue={listing?.description} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="price">Price (USD)</Label>
          <Input id="price" name="price" inputMode="decimal" required defaultValue={dollars(listing?.priceCents ?? null)} placeholder="24.00" />
        </div>
        <div>
          <Label htmlFor="salePrice">Sale price (optional)</Label>
          <Input id="salePrice" name="salePrice" inputMode="decimal" defaultValue={dollars(listing?.salePriceCents ?? null)} placeholder="18.00" />
        </div>
      </div>

      {category.fields.map((field) => {
        const current = listing?.values.find((value) => value.fieldId === field.id)?.value ?? "";
        const options = (field.options ?? "").split("\n").map((line) => line.trim()).filter(Boolean);
        return (
          <div key={field.id}>
            <Label htmlFor={`field_${field.id}`}>
              {field.name}
              {field.required ? "" : " (optional)"}
            </Label>
            {field.fieldType === "select" ? (
              <Select id={`field_${field.id}`} name={`field_${field.id}`} defaultValue={current} required={field.required}>
                <option value="">{field.required ? "Select" : "Any"}</option>
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            ) : (
              <Input id={`field_${field.id}`} name={`field_${field.id}`} defaultValue={current} required={field.required} maxLength={200} />
            )}
          </div>
        );
      })}

      {mode === "DIGITAL" ? (
        <div>
          <Label htmlFor="digitalNote">How the buyer receives it</Label>
          <Textarea id="digitalNote" name="digitalNote" required minLength={3} rows={3} defaultValue={listing?.digitalNote ?? ""} />
        </div>
      ) : null}

      {mode === "SERVICE" ? (
        <div>
          <Label htmlFor="availabilityNote">Availability</Label>
          <Textarea
            id="availabilityNote"
            name="availabilityNote"
            required
            minLength={3}
            rows={3}
            defaultValue={listing?.availabilityNote ?? ""}
            placeholder="Weekday evenings, or Saturdays after 10."
          />
        </div>
      ) : null}

      {mode !== "DIGITAL" ? (
        <fieldset>
          <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-soft">{spotLabelPlural}</legend>
          {spots.length ? (
            <div className="space-y-2 rounded-xl border border-line bg-white p-3">
              {spots.map((spot) => (
                <label key={spot.id} className="flex items-start gap-2 text-sm">
                  <input type="checkbox" name="spotIds" value={spot.id} defaultChecked={selectedSpots.has(spot.id)} className="mt-1" />
                  <span>
                    {spot.name}
                    {spot.city ? <span className="text-ink-soft"> · {spot.city}</span> : null}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-soft">No spots yet. An admin needs to add approved {spotLabelPlural.toLowerCase()} before goods can be listed.</p>
          )}
        </fieldset>
      ) : null}

      {listing?.images.length ? (
        <fieldset>
          <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-soft">Current photos</legend>
          <div className="grid grid-cols-3 gap-3">
            {listing.images.map((image) => (
              <label key={image.id} className="block text-xs text-ink-soft">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} alt="" className="aspect-square w-full rounded-lg object-cover" />
                <span className="mt-1 flex items-center gap-1">
                  <input type="checkbox" name="removeImage" value={image.id} /> Remove
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <div>
        <Label htmlFor="images">Photos</Label>
        <input
          id="images"
          name="images"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-navy file:px-3 file:py-2 file:font-semibold file:text-paper"
        />
        <p className="mt-1 text-xs text-ink-soft">Up to 6 photos. JPG, PNG, or WebP. At least 600 × 600 pixels. 4 MB each.</p>
      </div>

      <Button type="submit">{listing ? "Save listing" : "Publish listing"}</Button>
    </form>
  );
}
