import type { CSSProperties } from "react";
import { prisma } from "@/lib/prisma";
import { contrastOn } from "@/lib/utils";
import { getTheme, tokensFromTheme, type ThemeId } from "@/lib/themes";

export type DirectorySettings = {
  directoryName: string;
  tagline: string;
  contactEmail: string;
  theme: ThemeId;
  paperColor: string;
  paper2Color: string;
  inkColor: string;
  inkSoftColor: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  heroImageUrl: string;
  installed: boolean;
  mediaPriority: string[];
  organicSort: string;
  swapName: string;
  swapTagline: string;
  spotLabel: string;
  spotLabelPlural: string;
};

export const DEFAULT_HERO_IMAGE =
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=80";

export const HERO_UPLOAD = {
  recommendedWidth: 1920,
  recommendedHeight: 800,
  minWidth: 1600,
  minHeight: 700,
  maxBytes: 8 * 1024 * 1024,
  types: ["image/jpeg", "image/png", "image/webp", "image/avif"] as const,
};

const marketplace = tokensFromTheme(getTheme("marketplace"));

const defaults: DirectorySettings = {
  directoryName: "Local Directory",
  tagline: "Find trusted local businesses",
  contactEmail: "",
  ...marketplace,
  theme: "marketplace",
  heroImageUrl: DEFAULT_HERO_IMAGE,
  installed: false,
  mediaPriority: ["video", "hero", "google", "logo", "placeholder"],
  organicSort: "relevance",
  swapName: "Swap",
  swapTagline: "List an item. Meet nearby. Pay in person.",
  spotLabel: "Meet-up spot",
  spotLabelPlural: "Meet-up spots",
};

export async function getSettings(): Promise<DirectorySettings> {
  try {
    const rows = await prisma.siteSetting.findMany();
    const map = Object.fromEntries(rows.map((row) => [row.key, row.value]));
    const theme = getTheme(map.theme);
    const fallback = tokensFromTheme(theme);
    return {
      directoryName: map.directoryName ?? defaults.directoryName,
      tagline: map.tagline ?? defaults.tagline,
      contactEmail: map.contactEmail ?? defaults.contactEmail,
      theme: theme.id,
      paperColor: map.paperColor ?? fallback.paperColor,
      paper2Color: map.paper2Color ?? fallback.paper2Color,
      inkColor: map.inkColor ?? fallback.inkColor,
      inkSoftColor: map.inkSoftColor ?? fallback.inkSoftColor,
      primaryColor: map.primaryColor ?? fallback.primaryColor,
      secondaryColor: map.secondaryColor ?? fallback.secondaryColor,
      accentColor: map.accentColor ?? fallback.accentColor,
      heroImageUrl: map.heroImageUrl || DEFAULT_HERO_IMAGE,
      installed: map.installed === "true",
      mediaPriority: (map.mediaPriority ?? defaults.mediaPriority.join(",")).split(","),
      organicSort: map.organicSort ?? defaults.organicSort,
      swapName: map.swapName || defaults.swapName,
      swapTagline: map.swapTagline || defaults.swapTagline,
      spotLabel: map.spotLabel || defaults.spotLabel,
      spotLabelPlural: map.spotLabelPlural || defaults.spotLabelPlural,
    };
  } catch {
    return defaults;
  }
}

export function settingsToCssVars(settings: DirectorySettings): CSSProperties {
  return {
    "--paper": settings.paperColor,
    "--paper-2": settings.paper2Color,
    "--ink": settings.inkColor,
    "--ink-soft": settings.inkSoftColor,
    "--primary": settings.primaryColor,
    "--navy": settings.secondaryColor,
    "--accent": settings.accentColor,
    "--on-primary": contrastOn(settings.primaryColor),
    "--on-navy": contrastOn(settings.secondaryColor),
    "--on-accent": contrastOn(settings.accentColor),
  } as CSSProperties;
}

export async function setSettings(values: Record<string, string>) {
  for (const [key, value] of Object.entries(values)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
}
