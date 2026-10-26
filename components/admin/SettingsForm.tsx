"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { THEME_LIST, getTheme, type ThemeId } from "@/lib/themes";
import type { DirectorySettings } from "@/lib/settings";
import { HERO_UPLOAD } from "@/lib/settings";

function ColorField({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-12 cursor-pointer rounded-lg border border-line bg-white p-1"
          aria-label={label}
        />
        <Input name={name} value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}

export function SettingsForm({
  settings,
  action,
}: {
  settings: DirectorySettings;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [themeId, setThemeId] = useState<ThemeId>(settings.theme);
  const [colors, setColors] = useState({
    paperColor: settings.paperColor,
    paper2Color: settings.paper2Color,
    inkColor: settings.inkColor,
    inkSoftColor: settings.inkSoftColor,
    primaryColor: settings.primaryColor,
    secondaryColor: settings.secondaryColor,
    accentColor: settings.accentColor,
  });

  const [heroPreview, setHeroPreview] = useState(settings.heroImageUrl);
  const [heroMeta, setHeroMeta] = useState("");
  const theme = useMemo(() => getTheme(themeId), [themeId]);

  function applyTheme(id: ThemeId) {
    const next = getTheme(id);
    setThemeId(id);
    setColors({
      paperColor: next.paper,
      paper2Color: next.paper2,
      inkColor: next.ink,
      inkSoftColor: next.inkSoft,
      primaryColor: next.primary,
      secondaryColor: next.secondary,
      accentColor: next.accent,
    });
  }

  return (
    <form action={action} encType="multipart/form-data" className="mt-6 max-w-2xl space-y-6">
      <input type="hidden" name="theme" value={themeId} />
      <section className="rounded-xl border border-line bg-white p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft">Directory</h2>
        <div className="mt-4 space-y-4">
          <div>
            <Label>Directory name</Label>
            <Input name="directoryName" defaultValue={settings.directoryName} />
          </div>
          <div>
            <Label>Tagline</Label>
            <Input name="tagline" defaultValue={settings.tagline} />
          </div>
          <div>
            <Label>Contact email</Label>
            <Input name="contactEmail" type="email" defaultValue={settings.contactEmail} />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-white p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft">Homepage hero image</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Wide landscape photo that sits behind the search bar. Leave empty to keep the current image.
        </p>
        <div className="mt-4 overflow-hidden rounded-xl border border-line bg-paper-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heroPreview} alt="Current homepage hero" className="h-40 w-full object-cover object-center" />
        </div>
        <div className="mt-4 rounded-lg bg-paper-2 p-4 text-sm">
          <p className="font-semibold text-ink">Image size</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-soft">
            <li>
              Recommended: {HERO_UPLOAD.recommendedWidth} × {HERO_UPLOAD.recommendedHeight} px
            </li>
            <li>
              Minimum: {HERO_UPLOAD.minWidth} × {HERO_UPLOAD.minHeight} px
            </li>
            <li>Aspect ratio: about 12:5 (wide banner, not square)</li>
            <li>JPG, PNG, or WebP · max 8 MB</li>
            <li>Keep the main subject toward the right; the headline sits on the left</li>
          </ul>
        </div>
        <div className="mt-4">
          <Label htmlFor="heroImage">Upload hero image</Label>
          <input
            id="heroImage"
            name="heroImage"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="mt-1 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-navy file:px-3 file:py-2 file:font-semibold file:text-paper"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const url = URL.createObjectURL(file);
              setHeroPreview(url);
              const img = new window.Image();
              img.onload = () => {
                const ok = img.width >= HERO_UPLOAD.minWidth && img.height >= HERO_UPLOAD.minHeight;
                setHeroMeta(
                  `${img.width} × ${img.height} px${ok ? "" : ` — below the ${HERO_UPLOAD.minWidth} × ${HERO_UPLOAD.minHeight} minimum`}`,
                );
              };
              img.src = url;
            }}
          />
          {heroMeta ? <p className="mt-2 text-sm text-ink-soft">{heroMeta}</p> : null}
        </div>
      </section>

      <section className="rounded-xl border border-line bg-white p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft">Theme</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Presets fill the color tokens. You can still override any color below.
        </p>
        <div className="mt-4">
          <Label>Starting palette</Label>
          <Select
            value={themeId}
            onChange={(e) => applyTheme(e.target.value as ThemeId)}
          >
            {THEME_LIST.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
          <p className="mt-2 text-sm text-ink-soft">{theme.description}</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {THEME_LIST.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => applyTheme(item.id)}
              className={`rounded-xl border p-2 text-left ${themeId === item.id ? "border-primary ring-2 ring-primary/20" : "border-line"}`}
            >
              <span className="mb-2 flex h-8 overflow-hidden rounded-md">
                <span className="w-1/3" style={{ background: item.primary }} />
                <span className="w-1/3" style={{ background: item.secondary }} />
                <span className="w-1/3" style={{ background: item.accent }} />
              </span>
              <span className="text-[11px] font-semibold">{item.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-line bg-white p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft">Colors</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <ColorField label="Primary (buttons, sponsored)" name="primaryColor" value={colors.primaryColor} onChange={(v) => setColors((c) => ({ ...c, primaryColor: v }))} />
          <ColorField label="Secondary (logo mark, dark UI)" name="secondaryColor" value={colors.secondaryColor} onChange={(v) => setColors((c) => ({ ...c, secondaryColor: v }))} />
          <ColorField label="Accent (stars, featured)" name="accentColor" value={colors.accentColor} onChange={(v) => setColors((c) => ({ ...c, accentColor: v }))} />
          <ColorField label="Page background" name="paperColor" value={colors.paperColor} onChange={(v) => setColors((c) => ({ ...c, paperColor: v }))} />
          <ColorField label="Muted background" name="paper2Color" value={colors.paper2Color} onChange={(v) => setColors((c) => ({ ...c, paper2Color: v }))} />
          <ColorField label="Text" name="inkColor" value={colors.inkColor} onChange={(v) => setColors((c) => ({ ...c, inkColor: v }))} />
          <ColorField label="Muted text" name="inkSoftColor" value={colors.inkSoftColor} onChange={(v) => setColors((c) => ({ ...c, inkSoftColor: v }))} />
        </div>
      </section>

      <section className="rounded-xl border border-line bg-white p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft">Swap</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Names only. Listings, categories, and meet-up places stay separate from the business directory.
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <Label>Marketplace name</Label>
            <Input name="swapName" defaultValue={settings.swapName} />
          </div>
          <div>
            <Label>Marketplace tagline</Label>
            <Input name="swapTagline" defaultValue={settings.swapTagline} />
          </div>
          <div>
            <Label>Meet-up place, singular</Label>
            <Input name="spotLabel" defaultValue={settings.spotLabel} />
          </div>
          <div>
            <Label>Meet-up place, plural</Label>
            <Input name="spotLabelPlural" defaultValue={settings.spotLabelPlural} />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-white p-5">
        <Label>Listing media priority</Label>
        <Input name="mediaPriority" defaultValue={settings.mediaPriority.join(",")} />
        <p className="mt-1 text-xs text-ink-soft">video, hero, google, logo, placeholder</p>
      </section>

      <Button type="submit">Save settings</Button>
    </form>
  );
}
