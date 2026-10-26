import { SpotForm } from "@/components/admin/SpotForm";
import { saveSpot } from "@/app/admin/spots/actions";
import { getSettings } from "@/lib/settings";

export default async function NewSpotPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const settings = await getSettings();
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold tracking-tight">New {settings.spotLabel.toLowerCase()}</h1>
      <SpotForm action={saveSpot} error={error} spotLabel={settings.spotLabel} />
    </div>
  );
}
