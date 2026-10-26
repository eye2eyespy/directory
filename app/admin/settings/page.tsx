import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { getSettings, setSettings } from "@/lib/settings";
import { getTheme, isThemeId, tokensFromTheme } from "@/lib/themes";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { saveHeroUpload } from "@/lib/upload";

async function saveSettings(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) return;

  const themeId = String(formData.get("theme") ?? "marketplace");
  const theme = getTheme(isThemeId(themeId) ? themeId : "marketplace");
  const fallback = tokensFromTheme(theme);
  const current = await getSettings();

  const upload = formData.get("heroImage");
  let heroImageUrl = current.heroImageUrl;
  if (upload instanceof File && upload.size > 0) {
    try {
      heroImageUrl = await saveHeroUpload(upload);
    } catch (error) {
      throw error instanceof Error ? error : new Error("Could not save hero image.");
    }
  }

  await setSettings({
    directoryName: String(formData.get("directoryName") ?? ""),
    tagline: String(formData.get("tagline") ?? ""),
    contactEmail: String(formData.get("contactEmail") ?? ""),
    theme: theme.id,
    primaryColor: String(formData.get("primaryColor") ?? fallback.primaryColor),
    secondaryColor: String(formData.get("secondaryColor") ?? fallback.secondaryColor),
    accentColor: String(formData.get("accentColor") ?? fallback.accentColor),
    paperColor: String(formData.get("paperColor") ?? fallback.paperColor),
    paper2Color: String(formData.get("paper2Color") ?? fallback.paper2Color),
    inkColor: String(formData.get("inkColor") ?? fallback.inkColor),
    inkSoftColor: String(formData.get("inkSoftColor") ?? fallback.inkSoftColor),
    mediaPriority: String(formData.get("mediaPriority") ?? "video,hero,google,logo,placeholder"),
    heroImageUrl,
    swapName: String(formData.get("swapName") ?? "Swap"),
    swapTagline: String(formData.get("swapTagline") ?? ""),
    spotLabel: String(formData.get("spotLabel") ?? "Meet-up spot"),
    spotLabelPlural: String(formData.get("spotLabelPlural") ?? "Meet-up spots"),
  });
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
}

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-navy">Settings</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Marketplace is the live layout. Themes only change starting colors; pickers override them.
      </p>
      <SettingsForm settings={settings} action={saveSettings} />
    </div>
  );
}
