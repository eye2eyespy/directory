import { SearchExperience } from "@/components/directory/SearchExperience";
import { getSettings } from "@/lib/settings";
import { listPublishedBusinesses } from "@/lib/queries";

export const metadata = {
  title: "Featured",
};

export default async function FeaturedPage() {
  const [settings, businesses] = await Promise.all([
    getSettings(),
    listPublishedBusinesses({ featured: true }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-xs font-bold uppercase tracking-wide text-primary">Featured listings</p>
      <h1 className="text-3xl font-bold tracking-tight text-navy">Featured</h1>
      <p className="mb-6 mt-2 text-ink-soft">
        {businesses.length} featured {businesses.length === 1 ? "listing" : "listings"}. Listings may also be
        sponsored or verified — they must be featured to appear here.
      </p>
      <SearchExperience businesses={businesses} mediaPriority={settings.mediaPriority} grouped={false} />
    </div>
  );
}
