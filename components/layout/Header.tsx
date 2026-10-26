import Link from "next/link";
import type { DirectorySettings } from "@/lib/settings";
import { GetHelpButton } from "@/components/layout/GetHelpButton";

export async function Header({
  settings,
  industries,
}: {
  settings: DirectorySettings;
  industries: { name: string; slug: string }[];
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3.5">
        <Link href="/" className="flex items-center gap-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold"
            style={{ color: "var(--on-primary)" }}
          >
            {settings.directoryName.slice(0, 1)}
          </span>
          <span className="text-[17px] font-bold tracking-tight text-ink">{settings.directoryName}</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-ink md:flex">
          {industries.map((industry) => (
            <Link key={industry.slug} href={`/${industry.slug}`} className="hover:text-primary">
              {industry.name}
            </Link>
          ))}
          <Link href="/search" className="hover:text-primary">
            Find a pro
          </Link>
          <Link href="/swap" className="hover:text-primary">
            {settings.swapName}
          </Link>
          <Link href="/featured" className="hover:text-primary">
            Featured
          </Link>
          <Link href="/blog" className="hover:text-primary">
            Guides
          </Link>
          <Link href="/advertise" className="hover:text-primary">
            For businesses
          </Link>
        </nav>
        <GetHelpButton />
      </div>
    </header>
  );
}
