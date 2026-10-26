import { Search } from "lucide-react";
import { DEFAULT_HERO_IMAGE } from "@/lib/settings";

export function SearchHero({
  title,
  subtitle,
  industries,
  defaultIndustry,
  imageUrl,
}: {
  title: string;
  subtitle: string;
  industries: { name: string; slug: string }[];
  defaultIndustry?: string;
  imageUrl?: string | null;
}) {
  return (
    <section className="relative isolate overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl || DEFAULT_HERO_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/45" />
      <div className="relative mx-auto max-w-6xl px-4 py-16 text-center md:py-24">
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-white md:text-5xl">{title}</h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-white/85">{subtitle}</p>
        <form
          action="/search"
          className="mx-auto mt-8 grid max-w-3xl gap-0 overflow-hidden rounded-xl bg-white p-2 text-left shadow-2xl md:grid-cols-[1.3fr_1fr_auto]"
        >
          <label className="block px-3 py-2">
            <span className="text-[11px] font-semibold text-ink-soft">What can we help you with?</span>
            <input
              name="q"
              className="mt-0.5 w-full bg-transparent text-[15px] text-ink outline-none"
            />
          </label>
          <label className="block border-t border-line px-3 py-2 md:border-l md:border-t-0">
            <span className="text-[11px] font-semibold text-ink-soft">Zip or city</span>
            <input
              name="location"
              placeholder="Orlando, FL"
              className="mt-0.5 w-full bg-transparent text-[15px] text-ink outline-none"
            />
          </label>
          <input type="hidden" name="industry" defaultValue={defaultIndustry ?? industries[0]?.slug} />
          <button className="btn btn-primary mt-1 md:mt-0">
            <Search className="h-4 w-4" /> Search
          </button>
        </form>
      </div>
    </section>
  );
}
