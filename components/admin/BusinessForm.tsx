import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select } from "@/components/ui/input";
import type { Business, Industry } from "@prisma/client";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  industries: Industry[];
  business?: Business & { media?: { type: string; url: string | null }[] };
};

export function BusinessForm({ action, industries, business }: Props) {
  const videoUrl = business?.media?.find((m) => m.type === "VIDEO")?.url ?? "";
  const heroImageUrl = business?.media?.find((m) => m.type === "IMAGE")?.url ?? "";

  return (
    <form action={action} className="space-y-8">
      {business ? <input type="hidden" name="id" value={business.id} /> : null}

      <section className="rounded-sm border border-line bg-white p-5">
        <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-ink-soft">General</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label>Business name</Label>
            <Input name="name" required defaultValue={business?.name} />
          </div>
          <div>
            <Label>Industry</Label>
            <Select name="industryId" defaultValue={business?.industryId ?? industries[0]?.id} required>
              {industries.map((industry) => (
                <option key={industry.id} value={industry.id}>
                  {industry.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Slug</Label>
            <Input name="slug" defaultValue={business?.slug} placeholder="auto from name" />
          </div>
          <div>
            <Label>External ID</Label>
            <Input name="externalId" defaultValue={business?.externalId ?? ""} placeholder="ROOF-000007" />
          </div>
          <div>
            <Label>Year established</Label>
            <Input name="yearEstablished" type="number" defaultValue={business?.yearEstablished ?? ""} />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          {[
            ["published", "Published"],
            ["verified", "Verified"],
            ["featured", "Featured"],
            ["sponsored", "Sponsored"],
            ["homepageFeatured", "Homepage featured"],
          ].map(([name, label]) => (
            <label key={name} className="flex items-center gap-2">
              <input type="checkbox" name={name} defaultChecked={Boolean(business?.[name as keyof Business])} />
              {label}
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-sm border border-line bg-white p-5">
        <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-ink-soft">Description</h2>
        <div className="mt-4 space-y-4">
          <div>
            <Label>Short description</Label>
            <Input name="shortDescription" defaultValue={business?.shortDescription ?? ""} />
          </div>
          <div>
            <Label>About</Label>
            <Textarea name="description" rows={6} defaultValue={business?.description ?? ""} />
          </div>
        </div>
      </section>

      <section className="rounded-sm border border-line bg-white p-5">
        <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-ink-soft">Contact & location</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <Label>Phone</Label>
            <Input name="phone" defaultValue={business?.phone ?? ""} />
          </div>
          <div>
            <Label>Email</Label>
            <Input name="email" type="email" defaultValue={business?.email ?? ""} />
          </div>
          <div className="md:col-span-2">
            <Label>Website</Label>
            <Input name="websiteUrl" defaultValue={business?.websiteUrl ?? ""} />
          </div>
          <div className="md:col-span-2">
            <Label>Address</Label>
            <Input name="address1" defaultValue={business?.address1 ?? ""} />
          </div>
          <div>
            <Label>City</Label>
            <Input name="city" defaultValue={business?.city ?? ""} />
          </div>
          <div>
            <Label>State</Label>
            <Input name="state" defaultValue={business?.state ?? "Florida"} />
          </div>
          <div>
            <Label>ZIP</Label>
            <Input name="postalCode" defaultValue={business?.postalCode ?? ""} />
          </div>
          <div>
            <Label>Latitude</Label>
            <Input name="latitude" defaultValue={business?.latitude ?? ""} />
          </div>
          <div>
            <Label>Longitude</Label>
            <Input name="longitude" defaultValue={business?.longitude ?? ""} />
          </div>
        </div>
      </section>

      <section className="rounded-sm border border-line bg-white p-5">
        <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-ink-soft">Media</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <Label>Featured video URL</Label>
            <Input name="videoUrl" defaultValue={videoUrl} placeholder="YouTube or Vimeo URL" />
          </div>
          <div>
            <Label>Hero image URL</Label>
            <Input name="heroImageUrl" defaultValue={heroImageUrl} />
          </div>
        </div>
      </section>

      <section className="rounded-sm border border-line bg-white p-5">
        <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-ink-soft">Google</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <Label>Place ID</Label>
            <Input name="googlePlaceId" defaultValue={business?.googlePlaceId ?? ""} />
          </div>
          <div>
            <Label>Rating</Label>
            <Input name="googleRating" defaultValue={business?.googleRating ?? ""} />
          </div>
          <div>
            <Label>Review count</Label>
            <Input name="googleReviewCount" defaultValue={business?.googleReviewCount ?? ""} />
          </div>
        </div>
      </section>

      <section className="rounded-sm border border-line bg-white p-5">
        <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-ink-soft">SEO</h2>
        <div className="mt-4 space-y-4">
          <div>
            <Label>SEO title</Label>
            <Input name="seoTitle" defaultValue={business?.seoTitle ?? ""} />
          </div>
          <div>
            <Label>Meta description</Label>
            <Textarea name="metaDescription" rows={3} defaultValue={business?.metaDescription ?? ""} />
          </div>
        </div>
      </section>

      <Button type="submit">{business ? "Save business" : "Create business"}</Button>
    </form>
  );
}
