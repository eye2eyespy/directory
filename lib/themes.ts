export type ThemeId = "marketplace" | "harbor" | "foundry" | "atlas" | "canvas" | "blush" | "banner" | "kimi";

export type ThemeTokens = {
  id: ThemeId;
  name: string;
  description: string;
  paper: string;
  paper2: string;
  ink: string;
  inkSoft: string;
  primary: string;
  secondary: string;
  accent: string;
};

export const THEMES: Record<ThemeId, ThemeTokens> = {
  marketplace: {
    id: "marketplace",
    name: "Marketplace",
    description: "HomeAdvisor-style white canvas, trust green, charcoal type.",
    paper: "#FFFFFF",
    paper2: "#F4F6F5",
    ink: "#1A1D21",
    inkSoft: "#5C6570",
    primary: "#2F8F3A",
    secondary: "#1F3A2E",
    accent: "#F5C518",
  },
  harbor: {
    id: "harbor",
    name: "Harbor",
    description: "Coastal teal on a cool white field.",
    paper: "#F7FAFB",
    paper2: "#EEF4F5",
    ink: "#16303A",
    inkSoft: "#4A6670",
    primary: "#0F7A7A",
    secondary: "#1B3A4B",
    accent: "#E2B15A",
  },
  foundry: {
    id: "foundry",
    name: "Foundry",
    description: "Clean white with copper trade CTAs.",
    paper: "#FBFAF7",
    paper2: "#F3F0EA",
    ink: "#1C1917",
    inkSoft: "#57534E",
    primary: "#C45C26",
    secondary: "#2A2420",
    accent: "#E8A838",
  },
  atlas: {
    id: "atlas",
    name: "Atlas",
    description: "Professional navy and sky on cool gray.",
    paper: "#F5F7FA",
    paper2: "#E8EEF4",
    ink: "#0F172A",
    inkSoft: "#475569",
    primary: "#1D4ED8",
    secondary: "#0F2744",
    accent: "#38BDF8",
  },
  canvas: {
    id: "canvas",
    name: "Canvas",
    description: "Near-neutral shell. Admin colors do the branding.",
    paper: "#FFFFFF",
    paper2: "#F3F4F6",
    ink: "#111827",
    inkSoft: "#6B7280",
    primary: "#111827",
    secondary: "#374151",
    accent: "#2563EB",
  },
  blush: {
    id: "blush",
    name: "Blush",
    description: "Pink palette: blush paper, rose CTAs, wine text.",
    paper: "#FFE9EF",
    paper2: "#FFC9D7",
    ink: "#4A1830",
    inkSoft: "#9A5A6E",
    primary: "#FC809F",
    secondary: "#FFBCCD",
    accent: "#FF9CB5",
  },
  banner: {
    id: "banner",
    name: "Banner",
    description: "Steel blue, light gray, white, and crimson.",
    paper: "#FFFFFF",
    paper2: "#E7E7E7",
    ink: "#3D5172",
    inkSoft: "#6D7C93",
    primary: "#B80000",
    secondary: "#3D5172",
    accent: "#B80000",
  },
  kimi: {
    id: "kimi",
    name: "Kimi",
    description: "Viedoc-inspired: white space, one blue accent, gold stars.",
    paper: "#FFFFFF",
    paper2: "#F7F7FA",
    ink: "#14141F",
    inkSoft: "#8A8A99",
    primary: "#2E5BFF",
    secondary: "#1E46D9",
    accent: "#F5A623",
  },
};

export const THEME_LIST = Object.values(THEMES);

export function isThemeId(value: string): value is ThemeId {
  return value in THEMES;
}

export function getTheme(id?: string | null): ThemeTokens {
  if (id && isThemeId(id)) return THEMES[id];
  return THEMES.marketplace;
}

export function tokensFromTheme(theme: ThemeTokens) {
  return {
    theme: theme.id,
    paperColor: theme.paper,
    paper2Color: theme.paper2,
    inkColor: theme.ink,
    inkSoftColor: theme.inkSoft,
    primaryColor: theme.primary,
    secondaryColor: theme.secondary,
    accentColor: theme.accent,
  };
}
